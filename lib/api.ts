import type { ComponentInput, ComponentRecord, ComponentUpdateInput, UploadSignature } from "./types";

/**
 * Client side helpers. Every call here hits this app's own same origin
 * /api routes, never the FastAPI backend directly, so the browser never
 * needs the admin key.
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

export async function loginWithAdminKey(adminKey: string): Promise<void> {
  await requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ adminKey }),
  });
}

export async function logout(): Promise<void> {
  await requestJson("/api/auth/logout", { method: "POST" });
}

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
