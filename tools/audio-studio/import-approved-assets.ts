import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { db, pool } from "../../src/db";
import { audioAssets, shlokas } from "../../src/db/schema";
import { referenceAudioManifestSchema } from "../../src/lib/reference-audio";

const manifestPath = process.argv[2];
if (!manifestPath) throw new Error("Usage: tsx tools/audio-studio/import-approved-assets.ts <manifest.json>");

async function main() {
  const manifest = referenceAudioManifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  for (const asset of manifest.assets) {
    const [shloka] = await db.select({ id: shlokas.id }).from(shlokas).where(eq(shlokas.stableKey, asset.stableKey)).limit(1);
    if (!shloka) throw new Error(`Unknown shloka stable key: ${asset.stableKey}`);
    await db.insert(audioAssets).values({
      shlokaId: shloka.id,
      url: asset.publicUrl,
      objectKey: asset.outputKey,
      type: "reference",
      meter: asset.meter,
      qcStatus: "approved",
      qcNotes: `${asset.source}; ${asset.license}; reviewed by ${asset.qc.reviewer} at ${asset.qc.reviewedAt}${asset.qc.notes ? ` — ${asset.qc.notes}` : ""}`,
      approvedAt: new Date(asset.qc.reviewedAt),
    }).onConflictDoUpdate({
      target: audioAssets.objectKey,
      set: { url: asset.publicUrl, meter: asset.meter, qcStatus: "approved", qcNotes: `${asset.source}; ${asset.license}; reviewed by ${asset.qc.reviewer} at ${asset.qc.reviewedAt}${asset.qc.notes ? ` — ${asset.qc.notes}` : ""}`, approvedAt: new Date(asset.qc.reviewedAt) },
    });
  }
  console.log(`Imported ${manifest.assets.length} approved reference audio asset(s) from ${manifest.release}.`);
}

main().finally(async () => { await pool.end(); });
