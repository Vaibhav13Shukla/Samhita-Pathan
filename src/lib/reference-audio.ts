import { z } from "zod";

const devangariText = z.string().trim().min(2).max(4_000);

export const referenceAudioManifestSchema = z.object({
  release: z.string().trim().min(1).max(80),
  assets: z.array(z.object({
    stableKey: z.string().trim().min(1).max(160),
    meter: z.string().trim().min(2).max(80),
    padas: z.array(devangariText).min(2).max(8),
    source: z.string().trim().min(3).max(240),
    license: z.string().trim().min(3).max(240),
    outputKey: z.string().trim().regex(/^reference\/[a-z0-9/_-]+\.(wav|mp3)$/i, "Use a versioned reference/ object key ending in .wav or .mp3"),
    publicUrl: z.string().url().refine((url) => url.startsWith("https://"), "Use an HTTPS CDN URL"),
    qc: z.object({
      reviewer: z.string().trim().min(2).max(100),
      reviewedAt: z.string().datetime({ offset: true }),
      checks: z.object({
        textMatch: z.literal(true),
        meter: z.literal(true),
        pronunciation: z.literal(true),
        padaBoundaries: z.literal(true),
        noImpersonation: z.literal(true),
      }),
      notes: z.string().trim().max(1_000).default(""),
    }),
  })).min(1).max(500),
}).superRefine((manifest, context) => {
  const keys = new Set<string>();
  for (const [index, asset] of manifest.assets.entries()) {
    if (keys.has(asset.stableKey)) context.addIssue({ code: "custom", path: ["assets", index, "stableKey"], message: "Each shloka can appear once in a release." });
    keys.add(asset.stableKey);
  }
});

export type ReferenceAudioManifest = z.infer<typeof referenceAudioManifestSchema>;
