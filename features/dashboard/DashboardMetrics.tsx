import { CheckCircle2, LayoutGrid, Shapes, Star } from "lucide-react";
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
      icon: <LayoutGrid className="h-4 w-4 text-text-muted" />,
    },
    {
      title: "Active & Published",
      value: enabled,
      description: `${total - enabled} drafts/hidden`,
      badge: enabled > 0 ? "Live" : "None",
      badgeVariant: "success",
      icon: <CheckCircle2 className="h-4 w-4 text-success" />,
    },
    {
      title: "Featured on Home",
      value: featured,
      description: "Shown on homepage grid",
      badge: `${featured}/3`,
      badgeVariant: "accent",
      icon: <Star className="h-4 w-4 text-accent" />,
    },
    {
      title: "Categories",
      value: categoriesCount,
      description: "Unique component categories",
      icon: <Shapes className="h-4 w-4 text-text-muted" />,
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
