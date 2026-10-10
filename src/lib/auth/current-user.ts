import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUserId } from "./session";
import type { SafeUser } from "./validation";

export async function getCurrentUser(): Promise<SafeUser | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    preferredLanguage: users.preferredLanguage,
    plan: users.plan,
  }).from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}
