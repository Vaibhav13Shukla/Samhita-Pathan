import test from "node:test";
import assert from "node:assert/strict";
test("reference lookup hides a shloka with no approved audio", { skip: process.env.RUN_DATABASE_TESTS !== "true" }, async () => {
  const [{ pool }, { getApprovedReferenceAudio }] = await Promise.all([
    import("../src/db"),
    import("../src/services/audio-assets"),
  ]);
  try {
    const audio = await getApprovedReferenceAudio("charaka-sutra-1-1");
    assert.equal(audio, null);
  } finally {
    await pool.end();
  }
});
