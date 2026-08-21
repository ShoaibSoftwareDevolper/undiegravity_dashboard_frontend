import type { Permission, UserRecord } from "./types";

export function hasPermission(user: UserRecord | null, permission: Permission): boolean {
  return user?.role.permissions.includes(permission) ?? false;
}
