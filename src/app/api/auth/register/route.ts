import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/validation";
import { checkRateLimit, clientIp, errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  if (!checkRateLimit(`register:${clientIp(request)}`, 8)) return errorResponse("RATE_LIMITED", "Please wait before trying again.", 429);
  try {
    const input = registerSchema.parse(await request.json());
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
    if (existing) return errorResponse("EMAIL_EXISTS", "An account with this email already exists.", 409);

    const passwordHash = await hash(input.password, 12);
    const [user] = await db.insert(users).values({
      email: input.email,
      name: input.name,
      passwordHash,
      preferredLanguage: input.preferredLanguage,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      preferredLanguage: users.preferredLanguage,
      plan: users.plan,
    });
    await createSession(user.id);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
    if (error && typeof error === "object" && "issues" in error) return errorResponse("VALIDATION_ERROR", "Check the highlighted fields.", 400, error);
    console.error("register_failed", { error: error instanceof Error ? error.name : "unknown" });
    return errorResponse("REGISTRATION_FAILED", "We could not create your account. Please try again.", 500);
  }
}
