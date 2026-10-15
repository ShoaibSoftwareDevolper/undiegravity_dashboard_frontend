import { backendErrorResponse, deleteTemplateRecord, updateTemplateRecord } from "@/lib/backend";
import type { TemplateUpdateInput } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  let body: TemplateUpdateInput;
  try {
    body = (await request.json()) as TemplateUpdateInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const updated = await updateTemplateRecord(id, body);
    return Response.json(updated);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return PATCH(request, { params });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  try {
    await deleteTemplateRecord(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
