import { backendErrorResponse, reorderTemplates } from "@/lib/backend";
import type { TemplateReorderItem } from "@/lib/types";

export async function PUT(request: Request): Promise<Response> {
  let body: { items: TemplateReorderItem[] };

  try {
    body = (await request.json()) as { items: TemplateReorderItem[] };
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await reorderTemplates(body.items);
    return Response.json({ status: "ok" });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  return PUT(request);
}
