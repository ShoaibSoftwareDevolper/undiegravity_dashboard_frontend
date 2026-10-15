import { backendErrorResponse, toggleTemplateEnabled } from "@/lib/backend";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  try {
    const updated = await toggleTemplateEnabled(id);
    return Response.json(updated);
  } catch (error) {
    return backendErrorResponse(error);
  }
}
