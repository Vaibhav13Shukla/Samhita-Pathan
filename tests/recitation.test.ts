import test from "node:test";
import assert from "node:assert/strict";
import { GeminiServiceError } from "../src/services/gemini/explain";
import { evaluateRecitation } from "../src/services/gemini/recitation";

test("evaluateRecitation throws not_configured when GEMINI_API_KEY is missing", async () => {
  const origKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await evaluateRecitation({
      referenceText: "अथातो दीर्घञ्जीवितीयम्",
      audio: new Uint8Array([1, 2, 3]),
      mimeType: "audio/webm",
    });
    assert.fail("Should have thrown not_configured");
  } catch (error) {
    assert.ok(error instanceof GeminiServiceError);
    assert.equal((error as GeminiServiceError).code, "not_configured");
  } finally {
    if (origKey) process.env.GEMINI_API_KEY = origKey;
  }
});
