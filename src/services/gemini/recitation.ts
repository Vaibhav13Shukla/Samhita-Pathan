import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { GeminiServiceError } from "./explain";

const feedbackSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string().min(10).max(600),
  strengths: z.array(z.string().min(2).max(240)).max(4),
  improvements: z.array(z.string().min(2).max(240)).max(4),
});

export type RecitationFeedback = z.infer<typeof feedbackSchema>;

export async function evaluateRecitation(input: { referenceText: string; audio: Uint8Array; mimeType: string }): Promise<RecitationFeedback> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiServiceError("not_configured");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Evaluate this student's Sanskrit recitation against the written reference below. Be constructive and uncertainty-aware. Assess audible completeness, pacing, long/short vowel care, conjunct clarity, and pauses only where supported by the audio. Do not identify the speaker, diagnose, prescribe, or claim expert phonetic certainty. Return JSON only: score (0-100 integer), summary, strengths (0-4 strings), improvements (0-4 strings).\n\nReference: ${input.referenceText}`;

  // If model is gemini-3.5-transcribe, first transcribe the audio, then evaluate
  if (model.includes("transcribe")) {
    try {
      let transcription = "";
      try {
        const transcribeResponse = await ai.models.generateContent({
          model,
          contents: [{ inlineData: { mimeType: input.mimeType, data: Buffer.from(input.audio).toString("base64") } }],
        });
        const candidatePart = transcribeResponse.candidates?.[0]?.content?.parts?.[0] as
          | { audioTranscription?: { text?: string }; text?: string }
          | undefined;
        transcription = candidatePart?.audioTranscription?.text || transcribeResponse.text || "";
      } catch (transcribeError) {
        console.warn("transcribe_step_fallback", transcribeError);
      }

      const evalPrompt = `Evaluate this student's Sanskrit recitation against the written reference below.
Reference: ${input.referenceText}
${transcription ? `Student Transcribed Recitation (via Gemini Transcribe): ${transcription}` : "Audio recorded by student."}

Be constructive and uncertainty-aware. Assess audible completeness, pacing, long/short vowel care, conjunct clarity, and pauses.
Return JSON only: score (0-100 integer), summary, strengths (0-4 strings), improvements (0-4 strings).`;

      const evalModel = process.env.GEMINI_EVAL_MODEL || "gemini-3.8-flash";
      const evalResponse = await ai.models.generateContent({
        model: evalModel,
        contents: transcription
          ? [{ text: evalPrompt }]
          : [{ text: evalPrompt }, { inlineData: { mimeType: input.mimeType, data: Buffer.from(input.audio).toString("base64") } }],
        config: { responseMimeType: "application/json" },
      });
      const parsed = feedbackSchema.safeParse(JSON.parse(evalResponse.text ?? ""));
      if (parsed.success) return parsed.data;
    } catch (pipelineError) {
      console.warn("transcribe_pipeline_falling_back_to_multimodal", pipelineError);
    }
  }

  try {
    const fallbackModel = model.includes("transcribe") ? "gemini-3.8-flash" : model;
    const response = await ai.models.generateContent({
      model: fallbackModel,
      contents: [{ text: prompt }, { inlineData: { mimeType: input.mimeType, data: Buffer.from(input.audio).toString("base64") } }],
      config: { responseMimeType: "application/json" },
    });
    const parsed = feedbackSchema.safeParse(JSON.parse(response.text ?? ""));
    if (!parsed.success) throw new GeminiServiceError("invalid_output");
    return parsed.data;
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error;
    throw new GeminiServiceError("provider_error");
  }
}
