import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, BackendError, listComponents } from "@/lib/backend";

interface LoginRequestBody {
  adminKey?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const adminKey = body.adminKey;
  if (typeof adminKey !== "string" || adminKey.trim().length === 0) {
    return Response.json({ error: "Admin key is required" }, { status: 400 });
  }

  try {
    // Validate the key against the backend before setting any cookie.
    await listComponents(adminKey);
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      return Response.json({ error: "Invalid admin key" }, { status: 401 });
    }
    return Response.json({ error: "Unable to reach the backend" }, { status: 502 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, adminKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}
