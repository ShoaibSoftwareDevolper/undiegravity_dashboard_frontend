import type {
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
 * Client side helpers. Every call here hits this app's own same origin
 * /api routes, never the FastAPI backend directly, so the browser never
 * needs the session token.
 */

class ClientApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ClientApiError";
    this.status = status;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ClientApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && typeof (body as { error?: unknown }).error === "string") {
      return (body as { error: string }).error;
    }
  } catch {
    // Response body was not JSON; fall through to the generic message.
  }
  return `Request failed with status ${response.status}`;
}

// --- auth --------------------------------------------------------------

export async function login(username: string, password: string): Promise<UserRecord> {
  const result = await requestJson<{ user: UserRecord }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return result.user;
}

export async function logout(): Promise<void> {
  await requestJson("/api/auth/logout", { method: "POST" });
}

export async function updateMe(input: MeUpdateInput): Promise<UserRecord> {
  return requestJson<UserRecord>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await requestJson("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// --- users ---------------------------------------------------------------

export async function createUser(input: UserInput): Promise<UserRecord> {
  return requestJson<UserRecord>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUser(id: string, input: UserUpdateInput): Promise<UserRecord> {
  return requestJson<UserRecord>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await requestJson<void>(`/api/users/${id}`, { method: "DELETE" });
}

// --- roles -----------------------------------------------------------------

export async function createRole(input: RoleInput): Promise<RoleRecord> {
  return requestJson<RoleRecord>("/api/roles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateRole(id: string, input: RoleUpdateInput): Promise<RoleRecord> {
  return requestJson<RoleRecord>(`/api/roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteRole(id: string): Promise<void> {
  await requestJson<void>(`/api/roles/${id}`, { method: "DELETE" });
}

// --- components --------------------------------------------------------

export async function createComponent(input: ComponentInput): Promise<ComponentRecord> {
  return requestJson<ComponentRecord>("/api/components", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateComponent(
  id: string,
  input: ComponentUpdateInput
): Promise<ComponentRecord> {
  return requestJson<ComponentRecord>(`/api/components/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteComponent(id: string): Promise<void> {
  await requestJson<void>(`/api/components/${id}`, { method: "DELETE" });
}

export async function getUploadSignature(params: {
  folder?: string;
  public_id?: string;
}): Promise<UploadSignature> {
  return requestJson<UploadSignature>("/api/uploads/signature", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
