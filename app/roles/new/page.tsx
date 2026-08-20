import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { RoleForm } from "@/features/roles/RoleForm";

export const metadata: Metadata = {
  title: "New Role | UndieGravity Admin",
};

export default async function NewRolePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "roles.manage")) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/roles" className="hover:text-text transition-colors">
            Roles
          </Link>
          <span>/</span>
          <span className="font-medium text-text">New Role</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Add Role</h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Name the role and choose exactly what it can access.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <RoleForm mode="create" />
      </div>
    </div>
  );
}
