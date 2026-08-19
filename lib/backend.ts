import { cookies } from "next/headers";
import type {
  ComponentInput,
  ComponentRecord,
  ComponentUpdateInput,
  UploadSignature,
} from "./types";

/**
 * Importing `cookies` from `next/headers` already makes this module fail
 * to build if it is ever imported from a Client Component, since that API
 * only works in Server Components, Server Functions, and Route Handlers.
 * That is the boundary that keeps the admin key server side; nothing here
 * needs to duplicate it.
 */

export const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "undiegravity_admin_key";

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? "").replace(/\/+$/, "");

export class BackendError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

export async function getAdminKeyFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? null;
}

interface BackendFetchOptions extends RequestInit {
  path: string;
  /** Overrides the cookie lookup. Used only by the login route, before any cookie exists. */
  adminKey?: string;
}

async function backendFetch<T>({ path, adminKey, headers, ...init }: BackendFetchOptions): Promise<T> {
  if (!BACKEND_API_URL) {
    throw new BackendError("BACKEND_API_URL is not configured", 500);
  }

  const key = adminKey ?? (await getAdminKeyFromCookie());
  if (!key) {
    throw new BackendError("Missing admin session", 401);
  }

  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      "X-Admin-Key": key,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BackendError(await extractErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>;
      if (typeof record.error === "string") return record.error;
      if (typeof record.detail === "string") return record.detail;
    }
  } catch {
    // Response body was not JSON; fall through to the generic message.
  }
  return `Backend request failed with status ${response.status}`;
}

interface PaginatedComponents {
  items: ComponentRecord[];
  total: number;
  limit: number;
  offset: number;
}

export async function listComponents(adminKey?: string): Promise<ComponentRecord[]> {
  const data = await backendFetch<PaginatedComponents>({
    path: "/admin/components?limit=200",
    adminKey,
  });
  return data.items;
}

/**
 * The backend does not expose GET /admin/components/{id}, only the list
 * route and the mutation routes. Loading a single component for the edit
 * page goes through the list and finds the matching id.
 */
export async function getComponentById(id: string, adminKey?: string): Promise<ComponentRecord | null> {
  const components = await listComponents(adminKey);
  return components.find((component) => component.id === id) ?? null;
}

export async function createComponentRecord(
  data: ComponentInput,
  adminKey?: string
): Promise<ComponentRecord> {
  return backendFetch<ComponentRecord>({
    path: "/admin/components",
    method: "POST",
    body: JSON.stringify(data),
    adminKey,
  });
}

export async function updateComponentRecord(
  id: string,
  data: ComponentUpdateInput,
  adminKey?: string
): Promise<ComponentRecord> {
  return backendFetch<ComponentRecord>({
    path: `/admin/components/${id}`,
    method: "PATCH",
    body: JSON.stringify(data),
    adminKey,
  });
}

export async function deleteComponentRecord(id: string, adminKey?: string): Promise<void> {
  await backendFetch<void>({
    path: `/admin/components/${id}`,
    method: "DELETE",
    adminKey,
  });
}

export async function requestUploadSignature(
  params: { folder?: string; public_id?: string },
  adminKey?: string
): Promise<UploadSignature> {
  return backendFetch<UploadSignature>({
    path: "/admin/uploads/signature",
    method: "POST",
    body: JSON.stringify(params),
    adminKey,
  });
}

/** Converts a caught error into a Response, for use in app/api route handlers. */
export function backendErrorResponse(error: unknown): Response {
  if (error instanceof BackendError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Unexpected error while proxying to the backend", error);
  return Response.json({ error: "Unexpected server error" }, { status: 500 });
}
