import { backendErrorResponse, createTemplateRecord, listTemplates } from "@/lib/backend";
import type { TemplateInput } from "@/lib/types";

export async function GET(): Promise<Response> {
  try {
    const templates = await listTemplates();
    return Response.json(templates);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: TemplateInput;

  try {
    body = (await request.json()) as TemplateInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const created = await createTemplateRecord(body);
    return Response.json(created, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
