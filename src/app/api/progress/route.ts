import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { shlokas, userProgress } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/http";
import { learningProgressSchema } from "@/lib/study";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "Sign in to see your saved progress.", 401);
  const shlokaId = new URL(request.url).searchParams.get("shlokaId");
  if (!shlokaId) return errorResponse("SHLOKA_REQUIRED", "Choose a shloka to continue.", 400);
  const [progress] = await db.select({
    currentStep: userProgress.currentStep,
    completedSteps: userProgress.completedSteps,
    quizScore: userProgress.quizScore,
    lastStudiedAt: userProgress.lastStudiedAt,
  }).from(userProgress)
    .innerJoin(shlokas, eq(shlokas.id, userProgress.shlokaId))
    .where(and(eq(userProgress.userId, user.id), eq(shlokas.stableKey, shlokaId)))
    .limit(1);
  return Response.json({ progress: progress ?? null });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "Sign in to save your progress.", 401);
  try {
    const input = learningProgressSchema.parse(await request.json());
    const [shloka] = await db.select({ id: shlokas.id }).from(shlokas).where(eq(shlokas.stableKey, input.shlokaId)).limit(1);
    if (!shloka) return errorResponse("NOT_FOUND", "Shloka not found.", 404);
    const [progress] = await db.insert(userProgress).values({
      userId: user.id,
      shlokaId: shloka.id,
      currentStep: input.currentStep,
      completedSteps: input.completedSteps,
      quizScore: input.quizScore ?? null,
      lastStudiedAt: new Date(),
    }).onConflictDoUpdate({
      target: [userProgress.userId, userProgress.shlokaId],
      set: {
        currentStep: input.currentStep,
        completedSteps: input.completedSteps,
        quizScore: input.quizScore ?? null,
        lastStudiedAt: new Date(),
      },
    }).returning({ currentStep: userProgress.currentStep, completedSteps: userProgress.completedSteps, quizScore: userProgress.quizScore, lastStudiedAt: userProgress.lastStudiedAt });
    return Response.json({ progress });
  } catch (error) {
    if (error instanceof SyntaxError) return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
    if (error && typeof error === "object" && "issues" in error) return errorResponse("VALIDATION_ERROR", "Check the progress data and try again.", 400, error);
    console.error("progress_save_failed", { error: error instanceof Error ? error.name : "unknown" });
    return errorResponse("PROGRESS_SAVE_FAILED", "We could not save your progress. Please try again.", 500);
  }
}
