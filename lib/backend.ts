import { cookies } from "next/headers";
import type {
  AuditLogEntry,
  ChangePasswordInput,
  ComponentInput,
  ComponentRecord,
  ComponentUpdateInput,
  MeUpdateInput,
  RoleInput,
  RoleRecord,
  RoleUpdateInput,
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

// --- components --------------------------------------------------------

interface PaginatedComponents {
  items: ComponentRecord[];
  total: number;
  limit: number;
  offset: number;
}

const COMPONENTS_PAGE_SIZE = 200; // the backend's own max page size (PaginationParams, le=200)

/**
 * Follows the backend's limit/offset/total pagination until every
 * component has been fetched, instead of reading only the first page.
 * A single hardcoded `?limit=200` silently dropped everything past the
 * 200th component with no indication anything was missing; this keeps
 * that from ever happening again regardless of how large the library
 * grows, without needing pagination UI for what is still a small
 * personal library today.
 */
export async function listComponents(token?: string): Promise<ComponentRecord[]> {
  const all: ComponentRecord[] = [];
  let offset = 0;

  while (true) {
    const data = await backendFetch<PaginatedComponents>({
      path: `/admin/components?limit=${COMPONENTS_PAGE_SIZE}&offset=${offset}`,
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

/**
 * The backend does not expose GET /admin/components/{id}, only the list
 * route and the mutation routes. Loading a single component for the edit
 * page goes through the list and finds the matching id.
 */
export async function getComponentById(id: string, token?: string): Promise<ComponentRecord | null> {
  const components = await listComponents(token);
  return components.find((component) => component.id === id) ?? null;
}

export async function createComponentRecord(
  data: ComponentInput,
  token?: string
): Promise<ComponentRecord> {
  return backendFetch<ComponentRecord>({
    path: "/admin/components",
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateComponentRecord(
  id: string,
  data: ComponentUpdateInput,
  token?: string
): Promise<ComponentRecord> {
  return backendFetch<ComponentRecord>({
    path: `/admin/components/${id}`,
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteComponentRecord(id: string, token?: string): Promise<void> {
  await backendFetch<void>({
    path: `/admin/components/${id}`,
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
