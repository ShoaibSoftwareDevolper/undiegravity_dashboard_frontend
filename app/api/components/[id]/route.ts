import { backendErrorResponse, deleteComponentRecord, updateComponentRecord } from "@/lib/backend";
import type { ComponentUpdateInput } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/components/[id]">
): Promise<Response> {
  const { id } = await context.params;

  let body: ComponentUpdateInput;
  try {
    body = (await request.json()) as ComponentUpdateInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const updated = await updateComponentRecord(id, body);
    return Response.json(updated);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/components/[id]">
): Promise<Response> {
  const { id } = await context.params;

  try {
    await deleteComponentRecord(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
