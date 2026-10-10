import { ZodError } from "zod";

export function errorResponse(code: string, message: string, status: number, error?: unknown) {
  const fields = error instanceof ZodError
    ? Object.fromEntries(error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]))
    : undefined;
  return Response.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}

const attempts = new Map<string, { count: number; resetAt: number }>();
export function checkRateLimit(key: string, limit = 10, windowMs = 5 * 60_000) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
