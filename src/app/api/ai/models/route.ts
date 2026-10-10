import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const list = await ai.models.list({ config: { pageSize: 100 } });
    const models: any[] = [];
    for await (const m of list) {
      models.push(m);
    }
    return Response.json({ count: models.length, models });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
