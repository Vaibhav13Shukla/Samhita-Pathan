import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { recitationAttempts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "Sign in to view this attempt.", 401);
  const { id } = await context.params;
  const [attempt] = await db.select({
    id: recitationAttempts.id,
    status: recitationAttempts.status,
    score: recitationAttempts.score,
    feedback: recitationAttempts.feedbackJson,
    errorCode: recitationAttempts.safeErrorCode,
    createdAt: recitationAttempts.createdAt,
  }).from(recitationAttempts).where(and(eq(recitationAttempts.id, id), eq(recitationAttempts.userId, user.id))).limit(1);
  if (!attempt) return errorResponse("NOT_FOUND", "Attempt not found.", 404);
  return Response.json({ attempt });
}
