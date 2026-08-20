import { backendErrorResponse, deleteUserRecord, updateUserRecord } from "@/lib/backend";
import type { UserUpdateInput } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/users/[id]">
): Promise<Response> {
  const { id } = await context.params;

  let body: UserUpdateInput;
  try {
    body = (await request.json()) as UserUpdateInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const updated = await updateUserRecord(id, body);
    return Response.json(updated);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/users/[id]">
): Promise<Response> {
  const { id } = await context.params;

  try {
    await deleteUserRecord(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
