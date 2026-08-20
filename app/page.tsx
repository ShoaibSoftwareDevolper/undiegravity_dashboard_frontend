import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
import { BackendError, getCurrentUser, listComponents } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { DashboardMetrics } from "@/features/dashboard/DashboardMetrics";
import { ComponentsTable } from "@/features/components/ComponentsTable";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (user && !hasPermission(user, "components.view")) {
    redirect("/settings");
  }

  let components: Awaited<ReturnType<typeof listComponents>> = [];
  let loadError: string | null = null;

  try {
    components = await listComponents();
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "Could not load components.";
  }

  const canManageComponents = hasPermission(user, "components.manage");

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Manage, publish, and track all UndieGravity gallery components.
          </p>
        </div>

        {canManageComponents ? (
          <Link
            href="/components/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-hover active:scale-95 shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Component</span>
          </Link>
        ) : null}
      </div>

      {/* Metrics Overview Cards */}
      <DashboardMetrics components={components} />

      {/* Error Alert */}
      {loadError ? (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger-muted p-4 text-xs font-medium text-danger">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{loadError}</span>
        </div>
      ) : null}

      {/* Components Management Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">All Components</h2>
          <span className="text-xs text-text-muted">Live Sync with PostgreSQL</span>
        </div>

        <ComponentsTable components={components} />
      </div>
    </div>
  );
}
