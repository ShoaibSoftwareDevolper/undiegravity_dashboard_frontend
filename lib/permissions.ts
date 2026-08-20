import type { Permission, UserRecord } from "./types";

export function hasPermission(user: UserRecord | null, permission: Permission): boolean {
  return user?.role.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(user: UserRecord | null, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}
