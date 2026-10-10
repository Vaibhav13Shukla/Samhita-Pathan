import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { audioAssets, shlokas } from "@/db/schema";

export async function getApprovedReferenceAudio(stableKey: string) {
  try {
    const [audio] = await db.select({
      url: audioAssets.url,
      meter: audioAssets.meter,
      durationSeconds: audioAssets.durationSeconds,
    }).from(audioAssets)
      .innerJoin(shlokas, eq(audioAssets.shlokaId, shlokas.id))
      .where(and(
        eq(shlokas.stableKey, stableKey),
        eq(audioAssets.type, "reference"),
        eq(audioAssets.qcStatus, "approved"),
      ))
      .orderBy(desc(audioAssets.approvedAt))
      .limit(1);
    return audio ?? null;
  } catch (error) {
    console.error("get_approved_reference_audio_error", error);
    return null;
  }
}
