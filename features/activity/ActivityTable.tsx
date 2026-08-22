import { Activity, Pencil, Plus, Trash2 } from "lucide-react";
import type { AuditAction, AuditLogEntry } from "@/lib/types";

interface ActivityTableProps {
  entries: AuditLogEntry[];
}

const ACTION_STYLES: Record<AuditAction, { label: string; className: string; icon: typeof Plus }> = {
  create: { label: "Created", className: "bg-success/15 text-success", icon: Plus },
  update: { label: "Updated", className: "bg-accent/15 text-accent", icon: Pencil },
  delete: { label: "Deleted", className: "bg-danger-muted text-danger", icon: Trash2 },
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "(empty)";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "(none)";
  return String(value);
}

function ChangesSummary({ entry }: { entry: AuditLogEntry }) {
  if (!entry.changes || Object.keys(entry.changes).length === 0) {
    return <span className="text-text-muted">{entry.entity_label}</span>;
  }

  const fields = Object.entries(entry.changes);
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-text">{entry.entity_label}</span>
      <ul className="flex flex-col gap-0.5">
        {fields.map(([field, change]) => (
          <li key={field} className="text-xs text-text-muted">
            <span className="font-mono">{field}</span>: {formatValue(change.old)} →{" "}
            <span className="text-text">{formatValue(change.new)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActivityTable({ entries }: ActivityTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/40 text-[0.6875rem] font-semibold tracking-wider text-text-muted uppercase">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">What</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.length > 0 ? (
              entries.map((entry) => {
                const style = ACTION_STYLES[entry.action];
                const Icon = style.icon;
                return (
                  <tr key={entry.id} className="transition-colors hover:bg-surface-muted/30">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-text-muted">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">{entry.actor_username}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${style.className}`}
                      >
                        <Icon className="h-3 w-3" />
                        {style.label}
                        <span className="font-normal opacity-75">{entry.entity_type}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChangesSummary entry={entry} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                      <Activity className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-text">No activity yet</p>
                    <p className="text-xs text-text-muted max-w-sm">
                      Component, user, and role changes will show up here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
