import test from "node:test";
import assert from "node:assert/strict";
import { referenceAudioManifestSchema } from "../src/lib/reference-audio";

const approvedAsset = {
  stableKey: "charaka-sutra-1-1", meter: "anuṣṭubh", padas: ["अथातो दीर्घञ्जीवितीयमध्यायं व्याख्यास्यामः ।", "इति ह स्माह भगवानात्रेयः ॥"],
  source: "Reviewed source", license: "Verified license", outputKey: "reference/charaka/sutrasthana/1-1/v1.wav", publicUrl: "https://cdn.example.com/1-1.wav",
  qc: { reviewer: "A reviewer", reviewedAt: "2026-10-10T00:00:00+00:00", checks: { textMatch: true, meter: true, pronunciation: true, padaBoundaries: true, noImpersonation: true }, notes: "" },
};

test("approved audio requires every review gate", () => {
  assert.equal(referenceAudioManifestSchema.safeParse({ release: "r1", assets: [approvedAsset] }).success, true);
  assert.equal(referenceAudioManifestSchema.safeParse({ release: "r1", assets: [{ ...approvedAsset, qc: { ...approvedAsset.qc, checks: { ...approvedAsset.qc.checks, meter: false } } }] }).success, false);
});

test("approved audio uses a versioned HTTPS reference object", () => {
  assert.equal(referenceAudioManifestSchema.safeParse({ release: "r1", assets: [{ ...approvedAsset, publicUrl: "http://cdn.example.com/1-1.wav" }] }).success, false);
  assert.equal(referenceAudioManifestSchema.safeParse({ release: "r1", assets: [{ ...approvedAsset, outputKey: "uploads/1-1.wav" }] }).success, false);
});
