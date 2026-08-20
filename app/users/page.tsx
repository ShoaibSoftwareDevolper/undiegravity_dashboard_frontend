import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
import { BackendError, getCurrentUser, listUsers } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { UsersTable } from "@/features/users/UsersTable";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Users | UndieGravity Admin",
};

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "users.manage")) {
    redirect("/");
  }

  let users: Awaited<ReturnType<typeof listUsers>> = [];
  let loadError: string | null = null;

  try {
    users = await listUsers();
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "Could not load users.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Users</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Manage who can sign in to this dashboard and what they can do.
          </p>
        </div>
        <Link
          href="/users/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-hover active:scale-95 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Link>
      </div>

      {loadError ? (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger-muted p-4 text-xs font-medium text-danger">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{loadError}</span>
        </div>
      ) : null}

      <UsersTable users={users} currentUserId={currentUser.id} />
    </div>
  );
}
