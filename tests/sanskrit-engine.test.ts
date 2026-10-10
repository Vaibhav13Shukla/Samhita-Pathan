import assert from "node:assert/strict";
import test from "node:test";
import { defaultNormalizer, defaultTokenizer, defaultVerifier } from "../src/lib/sanskrit";

test("SanskritNormalizer strips danda, accents, and collapses spaces", () => {
  const input = "अथातो दीर्घञ्जीवितीयम् । व्याख्यास्यामः ॥";
  const normalized = defaultNormalizer.normalize(input);
  assert.equal(normalized, "अथातो दीर्घञ्जीवितीयम् व्याख्यास्यामः");
});

test("SanskritAksharaTokenizer tokenizes Devanagari into phonological syllables", () => {
  const input = "अथातो";
  const tokens = defaultTokenizer.tokenize(input);
  assert.deepEqual(tokens, ["अ", "था", "तो"]);
});

test("SanskritRecitationVerifier scores accurate recitation with akshara breakdown", () => {
  const ref = "अथातो दीर्घञ्जीवितीयम्";
  const candidate = "अथातो दीर्घञ्जीवितीयम्";
  const result = defaultVerifier.verify(ref, candidate);

  assert.equal(result.score, 100);
  assert.equal(result.aksharaAlignments.length > 0, true);
  assert.equal(result.aksharaAlignments[0].status, "accurate");
});

test("SanskritRecitationVerifier handles sandhi and phonetic variants constructively", () => {
  const ref = "अथातो दीर्घञ्जीवितीयम्";
  const candidate = "अथ अतः दीर्घं जीवितीयम्";
  const result = defaultVerifier.verify(ref, candidate);

  assert.equal(result.score >= 70, true);
  assert.equal(result.sandhiNormalizedScore >= 80, true);
});

test("SanskritRecitationVerifier abstains constructively when recording is silent or empty", () => {
  const ref = "अथातो दीर्घञ्जीवितीयम्";
  const candidate = "";
  const result = defaultVerifier.verify(ref, candidate);

  assert.equal(result.score, 0);
  assert.equal(result.aksharaAlignments.every((a) => a.status === "unclear"), true);
});
