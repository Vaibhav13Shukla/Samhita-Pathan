import { z } from "zod";

export const learningSteps = ["listen", "recite", "break-down", "understand", "visualize", "connect", "quiz"] as const;
export const learningProgressSchema = z.object({
  shlokaId: z.string().trim().min(1).max(160),
  currentStep: z.number().int().min(1).max(learningSteps.length),
  completedSteps: z.array(z.number().int().min(1).max(learningSteps.length)).max(learningSteps.length)
    .transform((steps) => [...new Set(steps)].sort((left, right) => left - right)),
  quizScore: z.number().int().min(0).max(100).nullable().optional(),
}).superRefine((value, context) => {
  if (value.completedSteps.some((step) => step > value.currentStep)) {
    context.addIssue({ code: "custom", path: ["completedSteps"], message: "Completed steps cannot be ahead of the current step." });
  }
});

export type LearningProgressInput = z.infer<typeof learningProgressSchema>;

export function percentageForCompletedSteps(steps: readonly number[]) {
  return Math.round((new Set(steps).size / learningSteps.length) * 100);
}
