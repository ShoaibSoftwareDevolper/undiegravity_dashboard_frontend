import { backendErrorResponse, createRoleRecord, listRoles } from "@/lib/backend";
import type { RoleInput } from "@/lib/types";

export async function GET(): Promise<Response> {
  try {
    const roles = await listRoles();
    return Response.json(roles);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: RoleInput;
  try {
    body = (await request.json()) as RoleInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const created = await createRoleRecord(body);
    return Response.json(created, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
