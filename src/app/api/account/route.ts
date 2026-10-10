import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { audioAssets, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { clearSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";
import { deletePrivateRecitations, StorageServiceError } from "@/services/storage/audio";

const settingsSchema = z.object({ preferredLanguage: z.enum(["en", "hi", "mr"]) });

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "Sign in to update your settings.", 401);
  try {
    const input = settingsSchema.parse(await request.json());
    const [updated] = await db.update(users).set({ preferredLanguage: input.preferredLanguage, updatedAt: new Date() })
      .where(eq(users.id, user.id)).returning({ preferredLanguage: users.preferredLanguage });
    return Response.json({ user: { ...user, preferredLanguage: updated.preferredLanguage } });
  } catch (error) {
    if (error instanceof SyntaxError) return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
    if (error && typeof error === "object" && "issues" in error) return errorResponse("VALIDATION_ERROR", "Choose a supported language.", 400, error);
    return errorResponse("SETTINGS_UPDATE_FAILED", "We could not update your settings. Please try again.", 500);
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "Sign in to delete your account.", 401);
  try {
    const recordings = await db.select({ objectKey: audioAssets.objectKey }).from(audioAssets).where(eq(audioAssets.userId, user.id));
    const objectKeys = recordings.flatMap((recording) => recording.objectKey ? [recording.objectKey] : []);
    await deletePrivateRecitations(objectKeys);
    await db.delete(users).where(eq(users.id, user.id));
    await clearSession();
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof StorageServiceError) return errorResponse("STORAGE_UNAVAILABLE", "Your recordings could not be safely deleted right now. Please try again later.", 503);
    console.error("account_delete_failed", { error: error instanceof Error ? error.name : "unknown" });
    return errorResponse("ACCOUNT_DELETE_FAILED", "We could not delete your account. Please try again.", 500);
  }
}
