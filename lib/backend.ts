import { cookies } from "next/headers";
import type {
  AuditLogEntry,
  ChangePasswordInput,
  MeUpdateInput,
  RoleInput,
  RoleRecord,
  RoleUpdateInput,
  TemplateInput,
  TemplateRecord,
  TemplateReorderItem,
  TemplateUpdateInput,
  UploadSignature,
  UserInput,
  UserRecord,
  UserUpdateInput,
} from "./types";

/**
 * Importing `cookies` from `next/headers` already makes this module fail
 * to build if it is ever imported from a Client Component, since that API
 * only works in Server Components, Server Functions, and Route Handlers.
 * That is the boundary that keeps the session token server side; nothing
 * here needs to duplicate it.
 */

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "undiegravity_session";

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? "").replace(/\/+$/, "");

export class BackendError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

interface BackendFetchOptions extends RequestInit {
  path: string;
  /** Overrides the cookie lookup. Used only right after login/password
   * change, before the new cookie has been written yet. */
  token?: string;
}

async function backendFetch<T>({ path, token, headers, ...init }: BackendFetchOptions): Promise<T> {
  if (!BACKEND_API_URL) {
    throw new BackendError("BACKEND_API_URL is not configured", 500);
  }

  const sessionToken = token ?? (await getSessionToken());
  if (!sessionToken) {
    throw new BackendError("Missing session", 401);
  }

  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      Authorization: `Bearer ${sessionToken}`,
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

// --- auth --------------------------------------------------------------

interface LoginResult {
  token: string;
  user: UserRecord;
}

/**
 * Unlike every other call in this file, login has no session token yet,
 * so it talks to the backend directly rather than through backendFetch.
 */
export async function loginWithCredentials(username: string, password: string): Promise<LoginResult> {
  if (!BACKEND_API_URL) {
    throw new BackendError("BACKEND_API_URL is not configured", 500);
  }

  const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BackendError(await extractErrorMessage(response), response.status);
  }

  return response.json() as Promise<LoginResult>;
}

export async function logoutSession(token?: string): Promise<void> {
  const sessionToken = token ?? (await getSessionToken());
  if (!sessionToken || !BACKEND_API_URL) {
    return;
  }
  // Best effort: even if this fails, the dashboard still clears its own
  // cookie, since staying "logged out" locally matters more to the user
  // than the backend session technically outliving the cookie until its
  // 7 day TTL expires.
  await fetch(`${BACKEND_API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
    cache: "no-store",
  }).catch(() => undefined);
}

export async function getCurrentUser(token?: string): Promise<UserRecord | null> {
  const sessionToken = token ?? (await getSessionToken());
  if (!sessionToken) {
    return null;
  }
  try {
    return await backendFetch<UserRecord>({ path: "/auth/me", token: sessionToken });
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function updateMe(data: MeUpdateInput, token?: string): Promise<UserRecord> {
  return backendFetch<UserRecord>({
    path: "/auth/me",
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

/** Returns the new session token: the backend rotates every session,
 * including the current one, on a successful password change. */
export async function changePassword(data: ChangePasswordInput, token?: string): Promise<string> {
  const result = await backendFetch<{ token: string }>({
    path: "/auth/change-password",
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
  return result.token;
}

// --- users ---------------------------------------------------------------

export async function listUsers(token?: string): Promise<UserRecord[]> {
  return backendFetch<UserRecord[]>({ path: "/admin/users", token });
}

export async function getUserById(id: string, token?: string): Promise<UserRecord | null> {
  const users = await listUsers(token);
  return users.find((user) => user.id === id) ?? null;
}

export async function createUserRecord(data: UserInput, token?: string): Promise<UserRecord> {
  return backendFetch<UserRecord>({
    path: "/admin/users",
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateUserRecord(
  id: string,
  data: UserUpdateInput,
  token?: string
): Promise<UserRecord> {
  return backendFetch<UserRecord>({
    path: `/admin/users/${id}`,
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteUserRecord(id: string, token?: string): Promise<void> {
  await backendFetch<void>({ path: `/admin/users/${id}`, method: "DELETE", token });
}

// --- roles -----------------------------------------------------------------

export async function listRoles(token?: string): Promise<RoleRecord[]> {
  return backendFetch<RoleRecord[]>({ path: "/admin/roles", token });
}

export async function getRoleById(id: string, token?: string): Promise<RoleRecord | null> {
  const roles = await listRoles(token);
  return roles.find((role) => role.id === id) ?? null;
}

export async function createRoleRecord(data: RoleInput, token?: string): Promise<RoleRecord> {
  return backendFetch<RoleRecord>({
    path: "/admin/roles",
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateRoleRecord(
  id: string,
  data: RoleUpdateInput,
  token?: string
): Promise<RoleRecord> {
  return backendFetch<RoleRecord>({
    path: `/admin/roles/${id}`,
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteRoleRecord(id: string, token?: string): Promise<void> {
  await backendFetch<void>({ path: `/admin/roles/${id}`, method: "DELETE", token });
}

// --- templates ---------------------------------------------------------

interface PaginatedTemplates {
  items: TemplateRecord[];
  total: number;
  limit: number;
  offset: number;
}

const TEMPLATES_PAGE_SIZE = 100;

export async function listTemplates(token?: string): Promise<TemplateRecord[]> {
  const all: TemplateRecord[] = [];
  let offset = 0;

  while (true) {
    const data = await backendFetch<PaginatedTemplates>({
      path: `/admin/templates?limit=${TEMPLATES_PAGE_SIZE}&offset=${offset}`,
      token,
    });
    all.push(...data.items);

    offset += data.items.length;
    if (data.items.length === 0 || offset >= data.total) {
      break;
    }
  }

  return all;
}

export async function getTemplateById(id: string, token?: string): Promise<TemplateRecord | null> {
  try {
    return await backendFetch<TemplateRecord>({
      path: `/admin/templates/${id}`,
      token,
    });
  } catch (error) {
    if (error instanceof BackendError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createTemplateRecord(
  data: TemplateInput,
  token?: string
): Promise<TemplateRecord> {
  return backendFetch<TemplateRecord>({
    path: "/admin/templates",
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateTemplateRecord(
  id: string,
  data: TemplateUpdateInput,
  token?: string
): Promise<TemplateRecord> {
  return backendFetch<TemplateRecord>({
    path: `/admin/templates/${id}`,
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function toggleTemplateEnabled(
  id: string,
  token?: string
): Promise<TemplateRecord> {
  return backendFetch<TemplateRecord>({
    path: `/admin/templates/${id}/toggle-enabled`,
    method: "PATCH",
    token,
  });
}

export async function toggleTemplateFeatured(
  id: string,
  token?: string
): Promise<TemplateRecord> {
  return backendFetch<TemplateRecord>({
    path: `/admin/templates/${id}/toggle-featured`,
    method: "PATCH",
    token,
  });
}

export async function reorderTemplates(
  items: TemplateReorderItem[],
  token?: string
): Promise<void> {
  await backendFetch<void>({
    path: "/admin/templates/reorder",
    method: "PUT",
    body: JSON.stringify({ items }),
    token,
  });
}

export async function deleteTemplateRecord(id: string, token?: string): Promise<void> {
  await backendFetch<void>({
    path: `/admin/templates/${id}`,
    method: "DELETE",
    token,
  });
}

export async function requestUploadSignature(
  params: { folder?: string; public_id?: string },
  token?: string
): Promise<UploadSignature> {
  return backendFetch<UploadSignature>({
    path: "/admin/uploads/signature",
    method: "POST",
    body: JSON.stringify(params),
    token,
  });
}

// --- audit log -----------------------------------------------------------

interface PaginatedAuditLog {
  items: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export async function listAuditLog(token?: string): Promise<AuditLogEntry[]> {
  const data = await backendFetch<PaginatedAuditLog>({
    path: "/admin/audit-log?limit=100",
    token,
  });
  return data.items;
}

/** Converts a caught error into a Response, for use in app/api route handlers. */
export function backendErrorResponse(error: unknown): Response {
  if (error instanceof BackendError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Unexpected error while proxying to the backend", error);
  return Response.json({ error: "Unexpected server error" }, { status: 500 });
}
