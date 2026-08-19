import { backendErrorResponse, requestUploadSignature } from "@/lib/backend";

interface SignatureRequestBody {
  folder?: unknown;
  public_id?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  let body: SignatureRequestBody;

  try {
    body = (await request.json()) as SignatureRequestBody;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const folder = typeof body.folder === "string" ? body.folder : undefined;
  const publicId = typeof body.public_id === "string" ? body.public_id : undefined;

  try {
    const signature = await requestUploadSignature({ folder, public_id: publicId });
    return Response.json(signature);
  } catch (error) {
    return backendErrorResponse(error);
  }
}
