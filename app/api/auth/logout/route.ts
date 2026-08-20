import { logoutSession } from "@/lib/backend";
import { clearSessionCookie } from "@/lib/session-cookie";

export async function POST(): Promise<Response> {
  await logoutSession();
  await clearSessionCookie();
  return Response.json({ ok: true });
}
