import { getCurrentUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "Sign in to continue.", 401);
  return Response.json({ user });
}
