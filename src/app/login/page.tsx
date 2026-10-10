import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in — Samhita Pathan" };

export default function LoginPage() {
  return (
    <main className="auth-page" id="main-content">
      <Link className="brand-mark auth-brand" href="/"><span className="brand-icon"><BookOpenText size={20} /></span><span><strong>samhita</strong> pathan</span></Link>
      <section className="auth-shell">
        <div className="auth-intro">
          <span className="marker-note">welcome back</span>
          <h1>return to your<br />study notebook.</h1>
          <p>Continue listening, reciting, and understanding from exactly where you paused.</p>
          <blockquote lang="sa">सा विद्या या विमुक्तये</blockquote>
        </div>
        <div className="paper-card auth-card"><p className="eyebrow">your account</p><h2>sign in</h2><AuthForm mode="login" /></div>
      </section>
    </main>
  );
}
