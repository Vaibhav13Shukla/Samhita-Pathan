import test from "node:test";
import assert from "node:assert/strict";
import { explanationSchema } from "../src/services/gemini/schemas";

const valid = {
  summary: "This sufficiently detailed study summary explains the opening in an educational way.",
  keyIdeas: ["A prepared beginning", "The stated purpose of inquiry"],
  studyQuestion: "What purpose does the opening establish for the chapter?",
  disclaimer: "Educational content only; not medical advice.",
};

test("Gemini explanation accepts the exact safe contract", () => {
  assert.equal(explanationSchema.safeParse(valid).success, true);
});

test("Gemini explanation rejects missing exact disclaimer", () => {
  assert.equal(explanationSchema.safeParse({ ...valid, disclaimer: "Use clinically." }).success, false);
});

test("Gemini explanation rejects unbounded idea lists", () => {
  assert.equal(explanationSchema.safeParse({ ...valid, keyIdeas: Array.from({ length: 9 }, () => "idea") }).success, false);
});
