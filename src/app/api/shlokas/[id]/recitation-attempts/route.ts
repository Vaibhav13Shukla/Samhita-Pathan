import { after } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { audioAssets, recitationAttempts, shlokas } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { errorResponse } from "@/lib/http";
import { evaluateRecitation } from "@/services/gemini/recitation";
import { StorageServiceError, uploadPrivateRecitation } from "@/services/storage/audio";

const MAX_BYTES = 8 * 1024 * 1024;
const AUDIO_TYPES = new Set(["audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "Sign in to submit a recitation.", 401);
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return errorResponse("INVALID_ORIGIN", "This request could not be verified.", 403);

  try {
    const { id } = await context.params;
    const [shloka] = await db.select({ id: shlokas.id, sanskritText: shlokas.sanskritText }).from(shlokas).where(eq(shlokas.stableKey, id)).limit(1);
    if (!shloka) return errorResponse("NOT_FOUND", "Shloka not found.", 404);
    const form = await request.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) return errorResponse("AUDIO_REQUIRED", "Attach a recording to continue.", 400);
    if (!AUDIO_TYPES.has(file.type) || file.size === 0 || file.size > MAX_BYTES) return errorResponse("INVALID_AUDIO", "Use a supported audio recording under 8 MB.", 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const objectKey = await uploadPrivateRecitation({ userId: user.id, shlokaId: shloka.id, bytes, mimeType: file.type });
    const [asset] = await db.insert(audioAssets).values({
      shlokaId: shloka.id, userId: user.id, url: `r2://${process.env.R2_BUCKET_NAME}/${objectKey}`,
      objectKey, type: "user", qcStatus: "pending",
    }).returning({ id: audioAssets.id });
    const [attempt] = await db.insert(recitationAttempts).values({
      userId: user.id, shlokaId: shloka.id, audioAssetId: asset.id, status: "processing",
    }).returning({ id: recitationAttempts.id, status: recitationAttempts.status });

    after(async () => {
      try {
        const feedback = await evaluateRecitation({ referenceText: shloka.sanskritText, audio: bytes, mimeType: file.type });
        await db.update(recitationAttempts).set({ status: "completed", score: feedback.score, feedbackJson: feedback, completedAt: new Date() }).where(eq(recitationAttempts.id, attempt.id));
      } catch (error) {
        console.error("recitation_evaluation_failed", { attemptId: attempt.id, error: error instanceof Error ? error.name : "unknown" });
        await db.update(recitationAttempts).set({ status: "failed", safeErrorCode: "evaluation_unavailable", completedAt: new Date() }).where(eq(recitationAttempts.id, attempt.id));
      }
    });
    return Response.json({ attemptId: attempt.id, status: attempt.status }, { status: 202 });
  } catch (error) {
    if (error instanceof StorageServiceError) return errorResponse("STORAGE_UNAVAILABLE", "Recording upload is not configured yet.", 503);
    console.error("recitation_submit_failed", { error: error instanceof Error ? error.name : "unknown" });
    return errorResponse("SUBMISSION_FAILED", "We could not submit this recording. Please try again.", 500);
  }
}
