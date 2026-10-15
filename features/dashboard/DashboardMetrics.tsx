import { CheckCircle2, LayoutGrid, Shapes, Star } from "lucide-react";
import type { TemplateRecord } from "@/lib/types";

interface DashboardMetricsProps {
  templates: TemplateRecord[];
}

export function DashboardMetrics({ templates }: DashboardMetricsProps) {
  const total = templates.length;
  const enabled = templates.filter((t) => t.enabled).length;
  const featured = templates.filter((t) => t.featured_on_home).length;
  const categoriesCount = new Set(
    templates
      .map((t) => t.category)
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
  ).size;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Templates */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs transition-all hover:border-border/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Total Templates</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
            <LayoutGrid className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-text">{total}</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">{enabled} published to gallery</p>
      </div>

      {/* Active & Published */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs transition-all hover:border-border/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Active & Published</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-text">{enabled}</span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-indigo-600 border border-indigo-200/50">
            Live
          </span>
        </div>
        <p className="mt-1 text-xs text-text-muted">{total - enabled} drafts/hidden</p>
      </div>

      {/* Featured on Home */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs transition-all hover:border-border/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Featured on Home</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-indigo-500">
            <Star className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-text">{featured}</span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-indigo-600 border border-indigo-200/50">
            {featured}/3
          </span>
        </div>
        <p className="mt-1 text-xs text-text-muted">Shown on homepage grid</p>
      </div>

      {/* Categories */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs transition-all hover:border-border/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Categories</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
            <Shapes className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-text">{categoriesCount}</span>
        </div>
        <p className="mt-1 text-xs text-text-muted">Unique template categories</p>
      </div>
    </div>
  );
}
