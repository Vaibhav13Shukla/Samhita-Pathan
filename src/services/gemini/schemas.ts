import { z } from "zod";

export const explanationSchema = z.object({
  summary: z.string().min(20).max(1200),
  keyIdeas: z.array(z.string().min(2).max(220)).min(2).max(5),
  studyQuestion: z.string().min(8).max(280),
  disclaimer: z.literal("Educational content only; not medical advice."),
});

export type Explanation = z.infer<typeof explanationSchema>;
