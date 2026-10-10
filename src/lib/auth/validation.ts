import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  password: z.string().min(8, "Use at least 8 characters").max(128).regex(/\d/, "Include at least one number"),
  preferredLanguage: z.enum(["en", "hi", "mr"]).default("en"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  password: z.string().min(1, "Enter your password").max(128),
});

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  preferredLanguage: "en" | "hi" | "mr";
  plan: "free" | "premium" | "institutional";
};
