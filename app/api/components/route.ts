import { backendErrorResponse, createComponentRecord, listComponents } from "@/lib/backend";
import type { ComponentInput } from "@/lib/types";

export async function GET(): Promise<Response> {
  try {
    const components = await listComponents();
    return Response.json(components);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: ComponentInput;

  try {
    body = (await request.json()) as ComponentInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const created = await createComponentRecord(body);
    return Response.json(created, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
