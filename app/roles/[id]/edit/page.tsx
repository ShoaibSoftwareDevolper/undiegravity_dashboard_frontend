import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getRoleById } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { RoleForm } from "@/features/roles/RoleForm";

export const metadata: Metadata = {
  title: "Edit Role | UndieGravity Admin",
};

export default async function EditRolePage(props: PageProps<"/roles/[id]/edit">) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "roles.manage")) {
    redirect("/");
  }

  const { id } = await props.params;
  const role = await getRoleById(id);

  if (!role) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/roles" className="hover:text-text transition-colors">
            Roles
          </Link>
          <span>/</span>
          <span className="font-medium text-text">Edit Role</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Edit: {role.name}</h1>
        <p className="text-xs sm:text-sm text-text-muted">Update the permissions for this role.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <RoleForm mode="edit" initialData={role} />
      </div>
    </div>
  );
}
