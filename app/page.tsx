import Link from "next/link";
import { BackendError, listComponents } from "@/lib/backend";
import { DashboardMetrics } from "@/features/dashboard/DashboardMetrics";
import { ComponentsTable } from "@/features/components/ComponentsTable";

export const revalidate = 0;

export default async function DashboardPage() {
  let components: Awaited<ReturnType<typeof listComponents>> = [];
  let loadError: string | null = null;

  try {
    components = await listComponents();
  } catch (error) {
    loadError = error instanceof BackendError ? error.message : "Could not load components.";
  }

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

        <Link
          href="/components/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-hover active:scale-95 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Component</span>
        </Link>
      </div>

      {/* Metrics Overview Cards */}
      <DashboardMetrics components={components} />

      {/* Error Alert */}
      {loadError ? (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger-muted p-4 text-xs font-medium text-danger">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
