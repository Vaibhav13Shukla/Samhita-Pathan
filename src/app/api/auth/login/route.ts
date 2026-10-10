import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/validation";
import { checkRateLimit, clientIp, errorResponse } from "@/lib/http";

const INVALID_CREDENTIALS = "Email or password is incorrect.";

export async function POST(request: Request) {
  if (!checkRateLimit(`login:${clientIp(request)}`, 10)) return errorResponse("RATE_LIMITED", "Too many attempts. Please wait five minutes.", 429);
  try {
    const input = loginSchema.parse(await request.json());
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (!user || !(await compare(input.password, user.passwordHash))) {
      return errorResponse("INVALID_CREDENTIALS", INVALID_CREDENTIALS, 401);
    }
    await createSession(user.id);
    return Response.json({ user: {
      id: user.id,
      email: user.email,
      name: user.name,
      preferredLanguage: user.preferredLanguage,
      plan: user.plan,
    } });
  } catch (error) {
    if (error instanceof SyntaxError) return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
    if (error && typeof error === "object" && "issues" in error) return errorResponse("VALIDATION_ERROR", "Check the highlighted fields.", 400, error);
    console.error("login_failed", { error: error instanceof Error ? error.name : "unknown" });
    return errorResponse("LOGIN_FAILED", "We could not sign you in. Please try again.", 500);
  }
}
