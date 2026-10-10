import { getApprovedReferenceAudio } from "@/services/audio-assets";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return Response.json({ audio: await getApprovedReferenceAudio(id) });
}
