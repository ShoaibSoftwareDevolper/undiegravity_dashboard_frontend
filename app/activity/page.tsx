import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { BackendError, getCurrentUser, listAuditLog } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { ActivityTable } from "@/features/activity/ActivityTable";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Activity | UndieGravity Admin",
};

export default async function ActivityPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "audit.view")) {
    redirect("/");
  }

  let entries: Awaited<ReturnType<typeof listAuditLog>> = [];
  let loadError: string | null = null;

  try {
    entries = await listAuditLog();
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "Could not load activity.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Activity</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Who created, changed, or deleted what, most recent first.
        </p>
      </div>

      {loadError ? (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger-muted p-4 text-xs font-medium text-danger">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{loadError}</span>
        </div>
      ) : null}

      <ActivityTable entries={entries} />
    </div>
  );
}
