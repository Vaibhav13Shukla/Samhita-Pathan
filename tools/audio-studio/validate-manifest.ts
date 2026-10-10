import { readFile } from "node:fs/promises";
import { referenceAudioManifestSchema } from "../../src/lib/reference-audio";

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error("Usage: tsx tools/audio-studio/validate-manifest.ts <manifest.json>");
  const parsed = referenceAudioManifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  console.log(`Validated ${parsed.assets.length} reviewed reference audio asset(s) for release ${parsed.release}.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
