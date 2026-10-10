import { GoogleGenAI } from "@google/genai";
import { explanationSchema, type Explanation } from "./schemas";

const PROMPT_VERSION = "explain-v1";

export class GeminiServiceError extends Error {
  constructor(
    public readonly code: "not_configured" | "timeout" | "invalid_output" | "provider_error",
    public readonly details?: string
  ) {
    super(details ? `${code}: ${details}` : code);
  }
}

export async function generateExplanation(input: {
  sanskrit: string;
  reference: string;
  language: "en" | "hi" | "mr";
}): Promise<Explanation & { promptVersion: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiServiceError("not_configured");

  const configuredModel = process.env.GEMINI_EXPLAIN_MODEL || process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const candidateModels: string[] = [
    ...(!configuredModel.includes("transcribe") ? [configuredModel] : []),
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ];

  const ai = new GoogleGenAI({ apiKey });

  // Auto-discover supported models from Google if possible
  try {
    const list = await ai.models.list({ config: { pageSize: 30 } });
    for await (const m of list) {
      if (m.name) {
        const id = m.name.replace("models/", "");
        if (!id.includes("transcribe") && !id.includes("embedding") && (id.includes("flash") || id.includes("gemini"))) {
          if (!candidateModels.includes(id)) {
            candidateModels.unshift(id);
          }
        }
      }
    }
  } catch (listErr) {
    console.warn("model_discovery_skipped", listErr);
  }
  const languageName = { en: "English", hi: "Hindi", mr: "Marathi" }[input.language];
  const prompt = `You are assisting a BAMS student with classical Sanskrit study. Explain the supplied Charaka Samhita passage in ${languageName}. Remain educational, source-aware, concise, and non-prescriptive. Do not invent quotations, diagnoses, remedies, or textual variants. Return JSON only with summary, keyIdeas (2-5 strings), studyQuestion, and disclaimer exactly "Educational content only; not medical advice."\n\nReference: ${input.reference}\nText: ${input.sanskrit}`;

  let lastError: unknown = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      const parsed = explanationSchema.safeParse(JSON.parse(response.text ?? ""));
      if (parsed.success) {
        return { ...parsed.data, promptVersion: PROMPT_VERSION, model };
      }
    } catch (error) {
      lastError = error;
      console.warn(`model_${model}_failed`, error instanceof Error ? error.message : error);
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError || "Unknown error");
  throw new GeminiServiceError("provider_error", message);
}
