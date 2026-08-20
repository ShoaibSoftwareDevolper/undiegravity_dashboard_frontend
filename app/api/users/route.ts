import { backendErrorResponse, createUserRecord, listUsers } from "@/lib/backend";
import type { UserInput } from "@/lib/types";

export async function GET(): Promise<Response> {
  try {
    const users = await listUsers();
    return Response.json(users);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: UserInput;
  try {
    body = (await request.json()) as UserInput;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const created = await createUserRecord(body);
    return Response.json(created, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
