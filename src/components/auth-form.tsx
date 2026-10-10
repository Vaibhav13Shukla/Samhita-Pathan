"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

type AuthFormProps = { mode: "login" | "register" };
type ErrorPayload = { error?: { message?: string; fields?: Record<string, string> } };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setFields({}); setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = mode === "register" ? {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      preferredLanguage: form.get("preferredLanguage"),
    } : { email: form.get("email"), password: form.get("password") };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json() as ErrorPayload;
        setFields(body.error?.fields ?? {});
        setError(body.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/study");
      router.refresh();
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {mode === "register" && (
        <label htmlFor="name">your name
          <input id="name" name="name" autoComplete="name" required aria-describedby={fields.name ? "name-error" : undefined} />
          {fields.name && <span className="field-error" id="name-error">{fields.name}</span>}
        </label>
      )}
      <label htmlFor="email">email address
        <input id="email" name="email" type="email" autoComplete="email" required aria-describedby={fields.email ? "email-error" : undefined} />
        {fields.email && <span className="field-error" id="email-error">{fields.email}</span>}
      </label>
      <label htmlFor="password">password
        <input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required aria-describedby="password-help password-error" />
        {mode === "register" && <span className="field-help" id="password-help">8+ characters, including a number</span>}
        {fields.password && <span className="field-error" id="password-error">{fields.password}</span>}
      </label>
      {mode === "register" && (
        <label htmlFor="preferred-language">preferred explanation language
          <select id="preferred-language" name="preferredLanguage" defaultValue="en">
            <option value="en">English</option><option value="hi">हिन्दी</option><option value="mr">मराठी</option>
          </select>
        </label>
      )}
      {error && <div className="form-error" role="alert" aria-live="assertive">{error}</div>}
      <button className="ink-button ink-button-wide" disabled={loading} type="submit">
        {loading ? <><LoaderCircle className="spin" size={18} /> one moment…</> : <>{mode === "login" ? "continue to your library" : "create my study space"} <ArrowRight size={17} /></>}
      </button>
      <p className="auth-switch">
        {mode === "login" ? "New to Samhita Pathan?" : "Already have a study space?"}{" "}
        <Link href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</Link>
      </p>
    </form>
  );
}
