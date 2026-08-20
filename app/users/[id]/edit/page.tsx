import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getUserById, listRoles } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { UserForm } from "@/features/users/UserForm";

export const metadata: Metadata = {
  title: "Edit User | UndieGravity Admin",
};

export default async function EditUserPage(props: PageProps<"/users/[id]/edit">) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "users.manage")) {
    redirect("/");
  }

  const { id } = await props.params;
  const [user, roles] = await Promise.all([getUserById(id), listRoles()]);

  if (!user) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/users" className="hover:text-text transition-colors">
            Users
          </Link>
          <span>/</span>
          <span className="font-medium text-text">Edit User</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Edit: {user.name}</h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Update account details, role, or reset the password.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <UserForm mode="edit" roles={roles} initialData={user} />
      </div>
    </div>
  );
}
