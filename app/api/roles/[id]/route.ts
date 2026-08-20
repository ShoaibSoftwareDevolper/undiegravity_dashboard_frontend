import { backendErrorResponse, deleteRoleRecord, updateRoleRecord } from "@/lib/backend";
import type { RoleUpdateInput } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/roles/[id]">
): Promise<Response> {
  const { id } = await context.params;

  let body: RoleUpdateInput;
  try {
    body = (await request.json()) as RoleUpdateInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const updated = await updateRoleRecord(id, body);
    return Response.json(updated);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/roles/[id]">
): Promise<Response> {
  const { id } = await context.params;

  try {
    await deleteRoleRecord(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
