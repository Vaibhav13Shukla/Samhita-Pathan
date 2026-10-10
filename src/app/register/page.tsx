import Link from "next/link";
import { BookOpenText, Check } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Begin learning — Samhita Pathan" };

export default function RegisterPage() {
  return (
    <main className="auth-page" id="main-content">
      <Link className="brand-mark auth-brand" href="/"><span className="brand-icon"><BookOpenText size={20} /></span><span><strong>samhita</strong> pathan</span></Link>
      <section className="auth-shell">
        <div className="auth-intro">
          <span className="marker-note">your first page</span>
          <h1>make each shloka<br />stay with you.</h1>
          <p>A guided study space for Charaka Saṃhitā—built around listening, recitation, meaning, and recall.</p>
          <ul className="check-list"><li><Check size={18} /> Curated Sanskrit learning loop</li><li><Check size={18} /> English, Hindi, and Marathi</li><li><Check size={18} /> Start with a free chapter sample</li></ul>
        </div>
        <div className="paper-card auth-card"><p className="eyebrow">free to begin</p><h2>create your account</h2><AuthForm mode="register" /></div>
      </section>
    </main>
  );
}
