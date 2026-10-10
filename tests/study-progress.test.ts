import test from "node:test";
import assert from "node:assert/strict";
import { learningProgressSchema, percentageForCompletedSteps } from "../src/lib/study";

test("learning progress removes duplicate completed steps", () => {
  const result = learningProgressSchema.parse({ shlokaId: "charaka-sutra-1-1", currentStep: 3, completedSteps: [2, 1, 2] });
  assert.deepEqual(result.completedSteps, [1, 2]);
  assert.equal(percentageForCompletedSteps(result.completedSteps), 29);
});

test("learning progress rejects impossible future completions", () => {
  const result = learningProgressSchema.safeParse({ shlokaId: "charaka-sutra-1-1", currentStep: 2, completedSteps: [3] });
  assert.equal(result.success, false);
});
