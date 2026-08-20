"use client";

import Link from "next/link";
import { Lock, Shield } from "lucide-react";
import type { RoleRecord } from "@/lib/types";
import { PERMISSION_INFO } from "@/lib/types";
import { DeleteRoleButton } from "./DeleteRoleButton";

interface RolesTableProps {
  roles: RoleRecord[];
}

export function RolesTable({ roles }: RolesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/40 text-[0.6875rem] font-semibold tracking-wider text-text-muted uppercase">
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roles.length > 0 ? (
              roles.map((role) => (
                <tr key={role.id} className="transition-colors hover:bg-surface-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text">{role.name}</span>
                      {role.is_system ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[0.625rem] font-semibold text-accent"
                          title="This role always has every permission and cannot be changed"
                        >
                          <Lock className="h-3 w-3" />
                          Built-in
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {role.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[0.6875rem] font-medium text-text"
                          >
                            {PERMISSION_INFO[permission]?.label ?? permission}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">No permissions</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/roles/${role.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-muted hover:text-accent cursor-pointer shadow-2xs"
                      >
                        {role.is_system ? "View" : "Edit"}
                      </Link>
                      <DeleteRoleButton id={role.id} name={role.name} disabled={role.is_system} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                      <Shield className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-text">No roles found</p>
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
