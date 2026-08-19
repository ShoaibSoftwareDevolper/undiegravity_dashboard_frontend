import type { ComponentRecord } from "@/lib/types";

interface DashboardMetricsProps {
  components: ComponentRecord[];
}

export function DashboardMetrics({ components }: DashboardMetricsProps) {
  const total = components.length;
  const enabled = components.filter((c) => c.enabled).length;
  const featured = components.filter((c) => c.tags?.includes("featured")).length;
  const categoriesCount = new Set(components.map((c) => c.category)).size;

  const STATS = [
    {
      title: "Total Components",
      value: total,
      description: `${enabled} published to gallery`,
      icon: (
        <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "Active & Published",
      value: enabled,
      description: `${total - enabled} drafts/hidden`,
      badge: enabled > 0 ? "Live" : "None",
      badgeVariant: "success",
      icon: (
        <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Featured on Home",
      value: featured,
      description: "Shown on homepage grid",
      badge: `${featured}/3`,
      badgeVariant: "accent",
      icon: (
        <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      title: "Categories",
      value: categoriesCount,
      description: "Unique component categories",
      icon: (
        <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border border-border bg-surface p-5 shadow-2xs transition-all hover:border-border/80"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">{stat.title}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted">
              {stat.icon}
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-text">{stat.value}</span>
            {stat.badge ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
                  stat.badgeVariant === "success"
                    ? "bg-success/15 text-success"
                    : "bg-accent/15 text-accent"
                }`}
              >
                {stat.badge}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-xs text-text-muted">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
