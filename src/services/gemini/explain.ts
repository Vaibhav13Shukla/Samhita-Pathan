import { GoogleGenAI } from "@google/genai";
import { explanationSchema, type Explanation } from "./schemas";

const PROMPT_VERSION = "explain-v1";

export class GeminiServiceError extends Error {
  constructor(public readonly code: "not_configured" | "timeout" | "invalid_output" | "provider_error") {
    super(code);
  }
}

export async function generateExplanation(input: {
  sanskrit: string;
  reference: string;
  language: "en" | "hi" | "mr";
}): Promise<Explanation & { promptVersion: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiServiceError("not_configured");
  const configuredModel = process.env.GEMINI_EXPLAIN_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = configuredModel.includes("transcribe") ? "gemini-2.5-flash" : configuredModel;
  const ai = new GoogleGenAI({ apiKey });
  const languageName = { en: "English", hi: "Hindi", mr: "Marathi" }[input.language];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  const prompt = `You are assisting a BAMS student with classical Sanskrit study. Explain the supplied Charaka Samhita passage in ${languageName}. Remain educational, source-aware, concise, and non-prescriptive. Do not invent quotations, diagnoses, remedies, or textual variants. Return JSON only with summary, keyIdeas (2-5 strings), studyQuestion, and disclaimer exactly "Educational content only; not medical advice."\n\nReference: ${input.reference}\nText: ${input.sanskrit}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    const parsed = explanationSchema.safeParse(JSON.parse(response.text ?? ""));
    if (!parsed.success) throw new GeminiServiceError("invalid_output");
    return { ...parsed.data, promptVersion: PROMPT_VERSION, model };
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error;
    if (controller.signal.aborted) throw new GeminiServiceError("timeout");
    throw new GeminiServiceError("provider_error");
  } finally {
    clearTimeout(timeout);
  }
}
