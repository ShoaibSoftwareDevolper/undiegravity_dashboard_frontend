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
