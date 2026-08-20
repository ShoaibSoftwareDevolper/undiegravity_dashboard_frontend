import { backendErrorResponse, changePassword } from "@/lib/backend";
import { setSessionCookie } from "@/lib/session-cookie";
import type { ChangePasswordInput } from "@/lib/types";

export async function POST(request: Request): Promise<Response> {
  let body: ChangePasswordInput;
  try {
    body = (await request.json()) as ChangePasswordInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    // The backend revokes every existing session, including this one, and
    // issues a fresh token. The cookie must be updated to that new token
    // in the same response, or the very next request would 401.
    const newToken = await changePassword(body);
    await setSessionCookie(newToken);
    return Response.json({ ok: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
