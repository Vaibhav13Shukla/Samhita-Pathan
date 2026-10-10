import { getCurrentUser } from "@/lib/auth/current-user";
import { StudyWorkspace } from "@/components/study-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Study — Samhita Pathan" };

export default async function StudyPage() {
  const user = await getCurrentUser();
  return <StudyWorkspace user={user} />;
}
