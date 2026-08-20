import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
import { BackendError, getCurrentUser, listRoles } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { RolesTable } from "@/features/roles/RolesTable";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Roles | UndieGravity Admin",
};

export default async function RolesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "roles.manage")) {
    redirect("/");
  }

  let roles: Awaited<ReturnType<typeof listRoles>> = [];
  let loadError: string | null = null;

  try {
    roles = await listRoles();
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "Could not load roles.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Roles</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Define what each kind of user is allowed to see and do.
          </p>
        </div>
        <Link
          href="/roles/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-hover active:scale-95 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Role</span>
        </Link>
      </div>

      {loadError ? (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger-muted p-4 text-xs font-medium text-danger">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{loadError}</span>
        </div>
      ) : null}

      <RolesTable roles={roles} />
    </div>
  );
}
