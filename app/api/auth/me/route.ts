import { backendErrorResponse, getCurrentUser, updateMe } from "@/lib/backend";
import type { MeUpdateInput } from "@/lib/types";

export async function GET(): Promise<Response> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Not signed in" }, { status: 401 });
    }
    return Response.json(user);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  let body: MeUpdateInput;
  try {
    body = (await request.json()) as MeUpdateInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const user = await updateMe(body);
    return Response.json(user);
  } catch (error) {
    return backendErrorResponse(error);
  }
}
