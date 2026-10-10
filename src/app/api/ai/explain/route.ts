import { z } from "zod";
import { demoShloka } from "@/data/demo-content";
import { checkRateLimit, clientIp, errorResponse } from "@/lib/http";
import { GeminiServiceError, generateExplanation } from "@/services/gemini/explain";

const requestSchema = z.object({
  shlokaId: z.string().trim().min(1).max(160),
  language: z.enum(["en", "hi", "mr"]),
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!checkRateLimit(`explain:${ip}`, 30, 60 * 60_000)) {
    return errorResponse("RATE_LIMITED", "Please wait before requesting another explanation.", 429);
  }
  try {
    const input = requestSchema.parse(await request.json());
    const content = await generateExplanation({
      sanskrit: demoShloka.sanskrit,
      reference: demoShloka.reference,
      language: input.language,
    });
    const payload = {
      summary: content.summary,
      keyIdeas: content.keyIdeas,
      studyQuestion: content.studyQuestion,
      disclaimer: content.disclaimer,
    };
    return Response.json({ content: payload, source: "generated" });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return errorResponse("VALIDATION_ERROR", "Choose a supported shloka and language.", 400, error);
    }
    if (error instanceof GeminiServiceError) {
      const unavailable = error.code === "not_configured";
      const message = unavailable
        ? "AI enrichment is not configured yet. Please set GEMINI_API_KEY in Vercel."
        : (error.details || "The study assistant is taking a pause. Try again shortly.");
      return errorResponse(unavailable ? "AI_NOT_CONFIGURED" : "AI_UNAVAILABLE", message, 503);
    }
    const message = error instanceof Error ? error.message : "The study assistant is taking a pause. Try again shortly.";
    console.error("explanation_failed", message);
    return errorResponse("AI_UNAVAILABLE", message, 503);
  }
}
