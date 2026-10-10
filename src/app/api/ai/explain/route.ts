import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { aiContent, chapters, samhitas, shlokas } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/http";
import { checkRateLimit } from "@/lib/http";
import { GeminiServiceError, generateExplanation } from "@/services/gemini/explain";

const requestSchema = z.object({
  shlokaId: z.string().trim().min(1).max(160),
  language: z.enum(["en", "hi", "mr"]),
});
const PROMPT_VERSION = "explain-v1";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "Sign in to use AI study assistance.", 401);
  if (!checkRateLimit(`explain:${user.id}`, 12, 60 * 60_000)) return errorResponse("RATE_LIMITED", "Please wait before requesting another explanation.", 429);
  try {
    const input = requestSchema.parse(await request.json());
    const [shloka] = await db.select({ id: shlokas.id, sanskritText: shlokas.sanskritText, reference: shlokas.reference })
      .from(shlokas).innerJoin(chapters, eq(shlokas.chapterId, chapters.id)).innerJoin(samhitas, eq(chapters.samhitaId, samhitas.id))
      .where(and(eq(shlokas.stableKey, input.shlokaId), eq(chapters.published, true), eq(samhitas.published, true)))
      .limit(1);
    if (!shloka) return errorResponse("NOT_FOUND", "That published shloka could not be found.", 404);
    const [cached] = await db.select({ payload: aiContent.payload }).from(aiContent).where(and(
      eq(aiContent.shlokaId, shloka.id), eq(aiContent.capability, "explanation"), eq(aiContent.language, input.language), eq(aiContent.promptVersion, PROMPT_VERSION),
    )).limit(1);
    if (cached) return Response.json({ content: cached.payload, source: "cached" });
    const content = await generateExplanation({
      sanskrit: shloka.sanskritText,
      reference: shloka.reference,
      language: input.language,
    });
    const payload = { summary: content.summary, keyIdeas: content.keyIdeas, studyQuestion: content.studyQuestion, disclaimer: content.disclaimer };
    await db.insert(aiContent).values({ shlokaId: shloka.id, capability: "explanation", language: input.language, promptVersion: content.promptVersion, payload, model: content.model })
      .onConflictDoNothing({ target: [aiContent.shlokaId, aiContent.capability, aiContent.language, aiContent.promptVersion] });
    return Response.json({ content: payload, source: "generated" });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) return errorResponse("VALIDATION_ERROR", "Choose a supported shloka and language.", 400, error);
    if (error instanceof GeminiServiceError) {
      const unavailable = error.code === "not_configured";
      return errorResponse(unavailable ? "AI_NOT_CONFIGURED" : "AI_UNAVAILABLE", unavailable ? "AI enrichment is not configured yet." : "The study assistant is taking a pause. Try again shortly.", 503);
    }
    console.error("explanation_failed", { error: error instanceof Error ? error.name : "unknown" });
    return errorResponse("AI_UNAVAILABLE", "The study assistant is taking a pause. Try again shortly.", 503);
  }
}
