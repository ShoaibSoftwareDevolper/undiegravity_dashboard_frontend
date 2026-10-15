export interface TemplateRecord {
  id: string;
  name: string;
  slug: string;
  image: string;
  gallery_images: string[];
  github_url: string;
  video: string | null;
  description: string | null;
  category: string | null;
  tags: string[];
  sort_order: number;
  featured_on_home: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateInput {
  name: string;
  slug?: string;
  image: string;
  gallery_images: string[];
  github_url: string;
  video?: string | null;
  description?: string | null;
  category?: string | null;
  tags: string[];
  sort_order: number;
  featured_on_home: boolean;
  enabled: boolean;
}

export type TemplateUpdateInput = Partial<TemplateInput>;

export interface TemplateReorderItem {
  id: string;
  sort_order: number;
}

export interface TemplateReorderRequest {
  items: TemplateReorderItem[];
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string | null;
  public_id: string | null;
}

export type Permission =
  | "templates.view"
  | "templates.manage"
  | "components.view"
  | "components.manage"
  | "uploads.manage"
  | "users.manage"
  | "roles.manage"
  | "audit.view";

export const ALL_PERMISSIONS: Permission[] = [
  "templates.view",
  "templates.manage",
  "uploads.manage",
  "users.manage",
  "roles.manage",
  "audit.view",
];

export const PERMISSION_INFO: Record<Permission, { label: string; description: string }> = {
  "templates.view": {
    label: "View templates",
    description: "See the website templates catalog and metadata.",
  },
  "templates.manage": {
    label: "Manage templates",
    description: "Create, edit, toggle visibility, reorder, and delete website templates.",
  },
  "components.view": {
    label: "View templates (legacy)",
    description: "Legacy permission alias for viewing templates.",
  },
  "components.manage": {
    label: "Manage templates (legacy)",
    description: "Legacy permission alias for managing templates.",
  },
  "uploads.manage": {
    label: "Upload media",
    description: "Upload template screenshots, covers, and demo videos.",
  },
  "users.manage": {
    label: "Manage users",
    description: "Create, edit, and delete admin user accounts.",
  },
  "roles.manage": {
    label: "Manage roles",
    description: "Create, edit, and delete roles and their permissions.",
  },
  "audit.view": {
    label: "View activity log",
    description: "See a record of who created, changed, or deleted what.",
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

export type AuditAction = "create" | "update" | "delete" | "toggle_enabled" | "toggle_featured" | "reorder";
export type AuditEntityType = "template" | "component" | "user" | "role";

export interface AuditFieldChange {
  old: unknown;
  new: unknown;
}

export interface AuditLogEntry {
  id: string;
  actor_username: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  entity_label: string;
  changes: Record<string, AuditFieldChange> | null;
  created_at: string;
}
