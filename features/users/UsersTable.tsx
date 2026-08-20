"use client";

import Link from "next/link";
import { Users as UsersIcon } from "lucide-react";
import type { UserRecord } from "@/lib/types";
import { DeleteUserButton } from "./DeleteUserButton";

interface UsersTableProps {
  users: UserRecord[];
  currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/40 text-[0.6875rem] font-semibold tracking-wider text-text-muted uppercase">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-surface-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text">{user.name}</span>
                      {user.id === currentUserId ? (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.625rem] font-semibold text-accent">
                          You
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md border border-border bg-surface-muted px-2 py-0.5 text-xs font-medium text-text">
                      {user.role.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/users/${user.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-muted hover:text-accent cursor-pointer shadow-2xs"
                      >
                        Edit
                      </Link>
                      <DeleteUserButton
                        id={user.id}
                        name={user.name}
                        disabled={user.id === currentUserId}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                      <UsersIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-text">No users found</p>
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
