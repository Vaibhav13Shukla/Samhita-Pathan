"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import type { SafeUser } from "@/lib/auth/validation";

export function AccountSettings({ user }: { user: SafeUser | null }) {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "hi" | "mr">(user?.preferredLanguage ?? "en");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "deleting" | "error">("idle");
  const [message, setMessage] = useState("");
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("samhita_preferred_language") as "en" | "hi" | "mr" | null;
      if (saved && ["en", "hi", "mr"].includes(saved)) {
        setLanguage(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("samhita_preferred_language", language);
      }
      if (user) {
        const response = await fetch("/api/account", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ preferredLanguage: language }),
        });
        if (!response.ok) throw new Error("update_failed");
      }
      setState("saved");
      setMessage("Your language preference has been saved.");
      router.refresh();
    } catch {
      setState("error");
      setMessage("We could not save that setting. Please try again.");
    }
  }

  function resetLocalProgress() {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("samhita_progress_charaka-sutra-1-1");
      }
      setMessage("Your local study progress has been reset.");
      setState("saved");
    } catch {
      setMessage("Could not reset local progress.");
    }
  }

  async function deleteAccount() {
    if (confirmText !== "DELETE") return;
    setState("deleting");
    setMessage("");
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json() as { error?: { message?: string } };
        throw new Error(body.error?.message || "delete_failed");
      }
      router.replace("/");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error && error.message !== "delete_failed" ? error.message : "We could not delete your account. Please try again.");
    }
  }

  return (
    <div className="settings-stack">
      <section className="paper-card settings-card">
        <p className="eyebrow">learning preferences</p>
        <h1>your study settings</h1>
        <p>Choose the language used for explanations and translations. You can also switch while studying.</p>
        <form className="auth-form" onSubmit={save}>
          <label htmlFor="settings-language">
            preferred explanation language
            <select
              id="settings-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </label>
          <button className="ink-button" type="submit" disabled={state === "saving"}>
            {state === "saving" ? <><LoaderCircle className="spin" size={17} /> saving…</> : "save preference"}
          </button>
        </form>
      </section>

      <section className="paper-card settings-card">
        <p className="eyebrow">study session</p>
        <h2>reset device progress</h2>
        <p>Start the Charaka Saṃhitā 1.1 learning loop fresh on this device.</p>
        <button className="text-link" type="button" onClick={resetLocalProgress}>
          reset progress on this device
        </button>
      </section>

      {user && (
        <section className="paper-card settings-card danger-zone">
          <AlertTriangle size={25} aria-hidden="true" />
          <p className="eyebrow">privacy and data</p>
          <h2>delete your account</h2>
          <p>This permanently deletes your profile and saved account data. This cannot be undone.</p>
          <label htmlFor="delete-confirmation">
            Type <strong>DELETE</strong> to confirm
            <input
              id="delete-confirmation"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              autoComplete="off"
            />
          </label>
          <button
            className="text-link danger-action"
            type="button"
            disabled={confirmText !== "DELETE" || state === "deleting"}
            onClick={deleteAccount}
          >
            {state === "deleting" ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />} permanently delete my account
          </button>
        </section>
      )}

      {message && (
        <p role={state === "error" ? "alert" : "status"} className={state === "error" ? "form-error" : "settings-status"}>
          {message}
        </p>
      )}
    </div>
  );
}
