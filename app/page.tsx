import Link from "next/link";
import { BackendError, listComponents } from "@/lib/backend";
import { ComponentsTable } from "@/features/components/ComponentsTable";

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text">Components</h1>
          <p className="text-sm text-text-muted">Manage the components shown on the public site.</p>
        </div>
        <Link
          href="/components/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          New component
        </Link>
      </div>

      {loadError ? (
        <p className="rounded-lg border border-danger/30 bg-danger-muted p-4 text-sm text-danger">
          {loadError}
        </p>
      ) : (
        <ComponentsTable components={components} />
      )}
    </div>
  );
}
