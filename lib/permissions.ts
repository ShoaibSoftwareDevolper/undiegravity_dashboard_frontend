import type { Permission, UserRecord } from "./types";

export function hasPermission(user: UserRecord | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.role.name === "Owner") return true;

  if (permission === "templates.view") {
    return (
      user.role.permissions.includes("templates.view") ||
      user.role.permissions.includes("components.view")
    );
  }

  if (permission === "templates.manage") {
    return (
      user.role.permissions.includes("templates.manage") ||
      user.role.permissions.includes("components.manage")
    );
  }

  return user.role.permissions.includes(permission);
}
