export type Framework = "react" | "nextjs";
export type PreviewMode = "image" | "live";

/**
 * Mirrors the backend's admin ComponentOut schema exactly, including its
 * snake_case field names. The public site has its own camelCase shape for
 * its read only routes; this dashboard talks to the admin routes only, so
 * it mirrors those field names instead.
 */
export interface ComponentRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  framework: Framework;
  thumbnail_public_id: string | null;
  preview_mode: PreviewMode;
  enabled: boolean;
  sort_order: number;
  dependencies: string[] | null;
  usage_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComponentInput {
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  framework: Framework;
  thumbnail_public_id: string | null;
  preview_mode: PreviewMode;
  enabled: boolean;
  sort_order: number;
  dependencies: string[];
  usage_notes: string | null;
}

export type ComponentUpdateInput = Partial<ComponentInput>;

export interface UploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string | null;
  public_id: string | null;
}

/**
 * Mirrors the backend's fixed permission catalog
 * (app/modules/users/models.py PERMISSIONS). A permission both gates a
 * backend route and decides which dashboard pages/nav items to show, so
 * this list and PERMISSION_INFO below are the single place a new
 * permission needs to be added on the frontend.
 */
export type Permission =
  | "components.view"
  | "components.manage"
  | "uploads.manage"
  | "users.manage"
  | "roles.manage";

export const ALL_PERMISSIONS: Permission[] = [
  "components.view",
  "components.manage",
  "uploads.manage",
  "users.manage",
  "roles.manage",
];

export const PERMISSION_INFO: Record<Permission, { label: string; description: string }> = {
  "components.view": {
    label: "View components",
    description: "See the components list and their metadata.",
  },
  "components.manage": {
    label: "Manage components",
    description: "Create, edit, enable/disable, and delete components.",
  },
  "uploads.manage": {
    label: "Upload media",
    description: "Upload thumbnail images and videos to Cloudinary.",
  },
  "users.manage": {
    label: "Manage users",
    description: "Create, edit, and delete user accounts.",
  },
  "roles.manage": {
    label: "Manage roles",
    description: "Create, edit, and delete roles and their permissions.",
  },
};

export interface RoleRecord {
  id: string;
  name: string;
  permissions: Permission[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleInput {
  name: string;
  permissions: Permission[];
}

export type RoleUpdateInput = Partial<RoleInput>;

export interface UserRecord {
  id: string;
  username: string;
  name: string;
  role: RoleRecord;
  created_at: string;
  updated_at: string;
}

export interface UserInput {
  username: string;
  name: string;
  password: string;
  role_id: string;
}

export interface UserUpdateInput {
  username?: string;
  name?: string;
  role_id?: string;
  password?: string;
}

export interface MeUpdateInput {
  username?: string;
  name?: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}
