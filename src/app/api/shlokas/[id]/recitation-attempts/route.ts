import { demoShloka } from "@/data/demo-content";
import { errorResponse } from "@/lib/http";
import { evaluateRecitation } from "@/services/gemini/recitation";

const MAX_BYTES = 8 * 1024 * 1024;
const AUDIO_TYPES = new Set(["audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav"]);

export async function POST(request: Request, _context: { params: Promise<{ id: string }> }) {
  try {
    const form = await request.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) return errorResponse("AUDIO_REQUIRED", "Attach a recording to continue.", 400);
    if (!AUDIO_TYPES.has(file.type) || file.size === 0 || file.size > MAX_BYTES) {
      return errorResponse("INVALID_AUDIO", "Use a supported audio recording under 8 MB.", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const padaParam = form.get("pada");
    const padaNum = padaParam ? Number(padaParam) : null;
    const referenceText =
      padaNum && padaNum >= 1 && padaNum <= demoShloka.padas.length
        ? demoShloka.padas[padaNum - 1].sanskrit
        : demoShloka.sanskrit;

    const feedback = await evaluateRecitation({ referenceText, audio: bytes, mimeType: file.type });
    return Response.json({
      status: "completed",
      score: feedback.score,
      sandhiNormalizedScore: feedback.sandhiNormalizedScore,
      feedback,
    });
  } catch (error) {
    console.error("recitation_evaluation_error", error);
    return errorResponse("EVALUATION_FAILED", "We could not evaluate this recording. Please try reciting again.", 500);
  }
}
