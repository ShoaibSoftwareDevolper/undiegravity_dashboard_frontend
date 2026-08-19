import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/backend";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return Response.json({ ok: true });
}
