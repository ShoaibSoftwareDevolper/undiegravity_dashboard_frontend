import { BackendError, loginWithCredentials } from "@/lib/backend";
import { setSessionCookie } from "@/lib/session-cookie";

interface LoginRequestBody {
  username?: unknown;
  password?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = body.username;
  const password = body.password;
  if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password) {
    return Response.json({ error: "Username and password are required" }, { status: 400 });
  }

  try {
    const { token, user } = await loginWithCredentials(username.trim(), password);
    await setSessionCookie(token);
    return Response.json({ user });
  } catch (error) {
    if (error instanceof BackendError) {
      const status = error.status === 401 ? 401 : 502;
      const message = error.status === 401 ? "Invalid username or password" : "Unable to reach the backend";
      return Response.json({ error: message }, { status });
    }
    return Response.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
