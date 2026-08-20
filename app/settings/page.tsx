import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/backend";
import { PERMISSION_INFO } from "@/lib/types";
import { ProfileForm } from "@/features/settings/ProfileForm";
import { ChangePasswordForm } from "@/features/settings/ChangePasswordForm";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Settings | UndieGravity Admin",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-text">Settings</h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Manage your own account details and password.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <h2 className="text-base font-semibold text-text mb-4">Profile</h2>
        <ProfileForm user={user} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <h2 className="text-base font-semibold text-text mb-4">Password</h2>
        <ChangePasswordForm />
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <h2 className="text-base font-semibold text-text">Your access</h2>
        </div>
        <p className="text-sm text-text-muted mb-3">
          You have the <span className="font-medium text-text">{user.role.name}</span> role.
        </p>
        {user.role.permissions.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {user.role.permissions.map((permission) => (
              <li key={permission} className="text-xs text-text-muted">
                <span className="font-medium text-text">{PERMISSION_INFO[permission]?.label ?? permission}</span>
                {" — "}
                {PERMISSION_INFO[permission]?.description}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-muted">This role has no permissions.</p>
        )}
      </div>
    </div>
  );
}
