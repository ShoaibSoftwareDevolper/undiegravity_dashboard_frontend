import type {
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

// --- templates ---------------------------------------------------------

export async function createTemplate(input: TemplateInput): Promise<TemplateRecord> {
  return requestJson<TemplateRecord>("/api/templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTemplate(
  id: string,
  input: TemplateUpdateInput
): Promise<TemplateRecord> {
  return requestJson<TemplateRecord>(`/api/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function toggleTemplateEnabled(id: string): Promise<TemplateRecord> {
  return requestJson<TemplateRecord>(`/api/templates/${id}/toggle-enabled`, {
    method: "PATCH",
  });
}

export async function toggleTemplateFeatured(id: string): Promise<TemplateRecord> {
  return requestJson<TemplateRecord>(`/api/templates/${id}/toggle-featured`, {
    method: "PATCH",
  });
}

export async function reorderTemplates(items: TemplateReorderItem[]): Promise<void> {
  await requestJson<void>("/api/templates/reorder", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  await requestJson<void>(`/api/templates/${id}`, { method: "DELETE" });
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

const UPLOAD_FOLDER = "undiegravity";

export async function uploadMediaFile(file: File): Promise<{ url: string; public_id: string }> {
  // 1. Request signed parameters from backend
  const signature = await getUploadSignature({ folder: UPLOAD_FOLDER });

  // 2. Upload directly to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.api_key);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  if (signature.folder) {
    formData.append("folder", signature.folder);
  }
  if (signature.public_id) {
    formData.append("public_id", signature.public_id);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloud_name}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || "Cloudinary upload failed");
  }

  const result = (await response.json()) as {
    public_id?: string;
    secure_url?: string;
    url?: string;
  };

  const fileUrl = result.secure_url || result.url;
  if (!fileUrl) {
    throw new Error("Upload response missing secure_url from Cloudinary");
  }

  return {
    url: fileUrl,
    public_id: result.public_id || "",
  };
}

