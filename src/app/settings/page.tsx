import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AccountSettings } from "@/components/account-settings";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata = { title: "Study settings — Samhita Pathan" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <main className="about-page page-shell" id="main-content"><Link className="back-link" href="/study"><ArrowLeft size={16} /> back to study</Link><AccountSettings user={user} /></main>;
}
