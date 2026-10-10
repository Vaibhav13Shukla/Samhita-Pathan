"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, AudioLines, BookOpenText, Check, ChevronRight, CircleUserRound,
  Headphones, Home, Library, LoaderCircle, LockKeyhole, Menu, Mic2, Pause, Play, RotateCcw,
  Settings, Sparkles, Square, Volume2, X,
} from "lucide-react";
import { demoShloka, sthanas } from "@/data/demo-content";
import type { SafeUser } from "@/lib/auth/validation";
import { percentageForCompletedSteps } from "@/lib/study";

type Step = "listen" | "recite" | "break-down" | "understand" | "visualize" | "connect" | "quiz";
const steps: { id: Step; label: string; short: string }[] = [
  { id: "listen", label: "Listen", short: "listen" },
  { id: "recite", label: "Recite", short: "recite" },
  { id: "break-down", label: "Break down", short: "words" },
  { id: "understand", label: "Understand", short: "meaning" },
  { id: "visualize", label: "Visualize", short: "map" },
  { id: "connect", label: "Connect", short: "apply" },
  { id: "quiz", label: "Recall", short: "quiz" },
];

type AudioAsset = { url: string; meter: string | null; durationSeconds: number | null } | null;
type AiContent = { summary: string; keyIdeas: string[]; studyQuestion: string };

export function StudyWorkspace({ user }: { user: SafeUser | null }) {
  const [active, setActive] = useState<Step>("listen");
  const [complete, setComplete] = useState<Step[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [audio, setAudio] = useState<AudioAsset>(null);
  const [audioLoading, setAudioLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi" | "mr">(user?.preferredLanguage ?? "en");
  const [aiContent, setAiContent] = useState<AiContent | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error">("idle");
  const [progressState, setProgressState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let live = true;
    fetch(`/api/shlokas/${demoShloka.id}/audio`).then((response) => response.json()).then((body) => {
      if (live) setAudio(body.audio ?? null);
    }).catch(() => undefined).finally(() => { if (live) setAudioLoading(false); });
    if (user) {
      fetch(`/api/progress?shlokaId=${encodeURIComponent(demoShloka.id)}`, { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((body: { progress: { currentStep: number; completedSteps: number[] } | null } | null) => {
        if (!live || !body?.progress) return;
        const savedStep = steps[body.progress.currentStep - 1];
        setComplete(body.progress.completedSteps.map((step) => steps[step - 1]?.id).filter((step): step is Step => Boolean(step)));
        if (savedStep) setActive(savedStep.id);
        setProgressState("saved");
      }).catch(() => undefined);
    }
    return () => { live = false; };
  }, [user]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") setDrawer(false); }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function moveTo(step: Step) {
    setActive(step); setDrawer(false);
  }
  async function saveProgress(nextComplete: Step[], nextActive: Step, quizScore?: number) {
    if (!user) return;
    setProgressState("saving");
    try {
      const response = await fetch("/api/progress", {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shlokaId: demoShloka.id,
          currentStep: steps.findIndex((step) => step.id === nextActive) + 1,
          completedSteps: nextComplete.map((step) => steps.findIndex((item) => item.id === step) + 1),
          ...(quizScore === undefined ? {} : { quizScore }),
        }),
      });
      if (!response.ok) throw new Error("save_failed");
      setProgressState("saved");
    } catch { setProgressState("error"); }
  }
  function continueNext() {
    const nextComplete = complete.includes(active) ? complete : [...complete, active];
    const index = steps.findIndex((step) => step.id === active);
    const nextActive = index < steps.length - 1 ? steps[index + 1].id : active;
    setComplete(nextComplete); setActive(nextActive);
    void saveProgress(nextComplete, nextActive);
  }
  async function enrich() {
    setAiState("loading");
    try {
      const response = await fetch("/api/ai/explain", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ shlokaId: demoShloka.id, language }) });
      if (!response.ok) throw new Error("unavailable");
      const body = await response.json() as { content: AiContent };
      setAiContent(body.content); setAiState("idle");
    } catch { setAiState("error"); }
  }

  return (
    <div className="study-app">
      <header className="study-header">
        <button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label="Open library" aria-expanded={drawer} aria-controls="study-library"><Menu size={20} /></button>
        <Link className="study-brand" href="/"><BookOpenText size={22} /><span>samhita <strong>pathan</strong></span></Link>
        <div className="study-context"><span>Charaka Saṃhitā</span><ChevronRight size={14} /><span>Sūtrasthāna</span><ChevronRight size={14} /><strong>1.1</strong></div>
        {user ? <span className="user-chip"><CircleUserRound size={17} /> {user.name.split(" ")[0]}</span> : <Link className="ink-button compact-button" href="/login">sign in</Link>}
      </header>

      <aside className={`library-rail ${drawer ? "open" : ""}`} id="study-library" aria-label="Samhita library" aria-hidden={!drawer && undefined}>
        <div className="rail-title"><div><p className="eyebrow">your library</p><h2>Charaka Saṃhitā</h2></div><button className="icon-button mobile-only" onClick={() => setDrawer(false)} aria-label="Close library"><X size={20} /></button></div>
        <div className="overall-progress"><div><span>this shloka</span><strong>{percentageForCompletedSteps(complete.map((step) => steps.findIndex((item) => item.id === step) + 1))}%</strong></div><div className="progress-track"><i style={{ width: `${percentageForCompletedSteps(complete.map((step) => steps.findIndex((item) => item.id === step) + 1))}%` }} /></div></div>
        <nav className="sthana-list">{sthanas.map(([title, sanskrit, done, total], index) => <button className={index === 0 ? "active" : ""} key={title} disabled={index > 1}><span className="sthana-index">{String(index + 1).padStart(2, "0")}</span><span><strong>{title}</strong><small lang="sa">{sanskrit}</small></span>{index > 1 ? <LockKeyhole size={14} /> : <small>{done}/{total}</small>}</button>)}</nav>
        <div className="rail-note"><span>curated release</span><strong>one reviewed shloka available</strong><p>More chapters appear only after content review.</p></div>
      </aside>

      {drawer && <button className="drawer-backdrop" onClick={() => setDrawer(false)} aria-label="Close library overlay" />}

      <main className="study-main" id="main-content">
        <h1 className="sr-only">Charaka Samhita shloka study</h1>
        <div className="study-topline"><Link href="/" className="back-link"><ArrowLeft size={16} /> exit study</Link><span>{complete.length} of 7 steps complete</span></div>
        <section className="shloka-card">
          <div className="shloka-meta"><span>{demoShloka.reference}</span><span>{demoShloka.meter}</span></div>
          <blockquote lang="sa">{demoShloka.sanskrit}</blockquote>
          <p className="transliteration">{demoShloka.transliteration}</p>
        </section>

        <nav className="step-rail" aria-label="Learning steps">{steps.map((step, index) => <button className={`${active === step.id ? "active" : ""} ${complete.includes(step.id) ? "complete" : ""}`} onClick={() => moveTo(step.id)} key={step.id}><span>{complete.includes(step.id) ? <Check size={14} /> : index + 1}</span><small>{step.label}</small></button>)}</nav>

        <section className="learning-panel" aria-live="polite">
          {active === "listen" && <ListenStep audio={audio} loading={audioLoading} />}
          {active === "recite" && <ReciteStep signedIn={Boolean(user)} />}
          {active === "break-down" && <BreakdownStep />}
          {active === "understand" && <UnderstandStep language={language} onLanguageChange={(value) => { setLanguage(value); setAiContent(null); setAiState("idle"); }} aiContent={aiContent} aiState={aiState} enrich={enrich} />}
          {active === "visualize" && <VisualizeStep />}
          {active === "connect" && <ConnectStep />}
          {active === "quiz" && <QuizStep />}
          <div className="panel-footer"><div><span className="marker-note">step {steps.findIndex((step) => step.id === active) + 1} of 7</span><p aria-live="polite">{!user ? "Sign in to save your progress." : progressState === "saving" ? "Saving your progress…" : progressState === "error" ? "Progress was not saved. Try again." : "Your progress is saved."}</p></div><button className="ink-button" onClick={continueNext}>{active === "quiz" ? "complete this shloka" : "continue"} <ArrowRight size={17} /></button></div>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation"><Link href="/"><Home size={19} /><span>home</span></Link><button className="active" onClick={() => setDrawer(true)}><Library size={19} /><span>library</span></button><button onClick={() => moveTo("recite")}><Mic2 size={19} /><span>practice</span></button><Link href="/settings"><Settings size={19} /><span>settings</span></Link></nav>
    </div>
  );
}

function ListenStep({ audio, loading }: { audio: AudioAsset; loading: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  function toggle() { const player = ref.current; if (!player) return; if (player.paused) void player.play(); else player.pause(); }
  function changeSpeed() { const next = speed === 1 ? 0.75 : speed === 0.75 ? 1.25 : 1; setSpeed(next); if (ref.current) ref.current.playbackRate = next; }
  if (loading) return <div className="step-copy"><p className="eyebrow">authentic reference</p><h2>preparing the player…</h2><div className="audio-skeleton" /></div>;
  return <div className="step-layout"><div className="step-copy"><p className="eyebrow">authentic reference</p><h2>listen for the shape of the verse.</h2><p>Follow the long vowels, pada boundaries, and measured cadence before you begin to imitate it.</p><div className="tip-note"><Headphones size={20} /><span>Headphones help you hear duration and conjuncts more clearly.</span></div></div>{audio ? <div className="chant-player"><audio ref={ref} src={audio.url} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} /><div className="player-label"><Volume2 size={18} /><span>reviewed reference · approved</span></div><div className="wave-large" aria-hidden="true">▂▃▅▇▅▃▂▆▇▅▃▂▃▆▅▇▃▂▅▇▆▃▂</div><div className="player-controls"><button className="play-button" onClick={toggle} aria-label={playing ? "Pause reference chant" : "Play reference chant"}>{playing ? <Pause /> : <Play />}</button><span>approved reference</span><button className="speed-button" onClick={changeSpeed} aria-label={`Playback speed ${speed}`}>{speed}×</button></div></div> : <div className="audio-review-state"><span className="audio-seal"><AudioLines size={30} /></span><p className="eyebrow">quality check in progress</p><h3>reference chant is being reviewed.</h3><p>We only publish a reference chant after a listener confirms meter, pronunciation, and pada boundaries. The other study steps are ready now.</p><Link href="/about">why review matters <ArrowRight size={15} /></Link></div>}</div>;
}

function ReciteStep({ signedIn }: { signedIn: boolean }) {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);
  const [state, setState] = useState<"idle" | "recording" | "ready" | "denied" | "unsupported">("idle");
  const [submitState, setSubmitState] = useState<"idle" | "uploading" | "processing" | "completed" | "failed">("idle");
  const [seconds, setSeconds] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<{ score: number | null; summary: string; strengths: string[]; improvements: string[] } | null>(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => () => {
    mounted.current = false;
    stream.current?.getTracks().forEach((track) => track.stop());
    if (timer.current) clearInterval(timer.current);
  }, []);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setState("unsupported"); return; }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media; chunks.current = [];
      const instance = new MediaRecorder(media); recorder.current = instance;
      instance.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      instance.onstop = () => {
        const blob = new Blob(chunks.current, { type: instance.mimeType || "audio/webm" });
        setRecordedBlob(blob); setPreview(URL.createObjectURL(blob)); setState("ready");
        media.getTracks().forEach((track) => track.stop());
      };
      instance.start(); setSeconds(0); setState("recording");
      timer.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    } catch { setState("denied"); }
  }
  function stop() { recorder.current?.stop(); if (timer.current) clearInterval(timer.current); }
  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setRecordedBlob(null); setFeedback(null); setSubmitError("");
    setSubmitState("idle"); setSeconds(0); setState("idle");
  }
  async function poll(attemptId: string) {
    for (let count = 0; count < 24 && mounted.current; count += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const response = await fetch(`/api/recitation-attempts/${attemptId}`, { cache: "no-store" });
      if (!response.ok) continue;
      const body = await response.json() as { attempt: { status: "processing" | "completed" | "failed"; score: number | null; feedback: { summary: string; strengths: string[]; improvements: string[] } | null } };
      if (body.attempt.status === "completed" && body.attempt.feedback) {
        setFeedback({ score: body.attempt.score, ...body.attempt.feedback }); setSubmitState("completed"); return;
      }
      if (body.attempt.status === "failed") { setSubmitState("failed"); setSubmitError("Feedback could not be completed. Your recording was saved privately; record again or retry later."); return; }
    }
    if (mounted.current) { setSubmitState("failed"); setSubmitError("Feedback is taking longer than expected. Return to Practice shortly to check again."); }
  }
  async function submit() {
    if (!recordedBlob) return;
    setSubmitError(""); setSubmitState("uploading");
    const form = new FormData();
    form.append("audio", recordedBlob, `recitation.${recordedBlob.type.includes("webm") ? "webm" : "audio"}`);
    try {
      const response = await fetch(`/api/shlokas/${demoShloka.id}/recitation-attempts`, { method: "POST", body: form });
      const body = await response.json() as { attemptId?: string; error?: { message?: string } };
      if (!response.ok || !body.attemptId) throw new Error(body.error?.message || "We could not submit this recording.");
      setSubmitState("processing"); await poll(body.attemptId);
    } catch (error) { setSubmitState("failed"); setSubmitError(error instanceof Error ? error.message : "We could not submit this recording."); }
  }

  return <div className="recite-step">
    <div className={`recorder-orb ${state === "recording" ? "recording" : ""}`}>{state === "recording" ? <span>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span> : submitState === "uploading" || submitState === "processing" ? <LoaderCircle className="spin" size={38} /> : <Mic2 size={38} />}</div>
    <div className="step-copy centered"><p className="eyebrow">your recitation</p><h2>{state === "recording" ? "we’re listening." : submitState === "processing" ? "listening closely to your attempt." : submitState === "completed" ? "your practice note is ready." : state === "ready" ? "listen back before you send." : "recite at your own pace."}</h2><p>{state === "idle" && "Find a quiet place. Your recording is private and is never used as the reference voice."}{state === "recording" && "Speak the complete shloka, then stop when you are ready."}{submitState === "processing" && "Gemini is preparing post-hoc feedback. This may take a few moments."}</p></div>
    {state === "idle" && <button className="ink-button" onClick={start}><Mic2 size={17} /> start recording</button>}
    {state === "recording" && <button className="ink-button" onClick={stop}><Square size={16} /> stop recording</button>}
    {state === "ready" && preview && submitState !== "completed" && <><audio className="recording-preview" controls src={preview} /><div className="recorder-actions"><button className="text-link" onClick={reset}><RotateCcw size={15} /> record again</button>{signedIn ? <button className="ink-button" onClick={submit} disabled={submitState === "uploading" || submitState === "processing"}>{submitState === "uploading" ? "uploading…" : submitState === "processing" ? "preparing feedback…" : "send for feedback"} <Sparkles size={16} /></button> : <Link className="ink-button" href="/login">sign in to get feedback <ArrowRight size={16} /></Link>}</div></>}
    {submitError && <div className="permission-message" role="alert" aria-live="assertive"><h3>feedback is unavailable.</h3><p>{submitError}</p><button className="text-link" onClick={() => setSubmitState("idle")}>try submission again</button></div>}
    {submitState === "completed" && feedback && <div className="feedback-card" role="status" aria-live="polite"><span className="feedback-score">{feedback.score ?? "—"}<small>/100</small></span><div><h3>{feedback.summary}</h3>{feedback.strengths.length > 0 && <p><strong>What carried well:</strong> {feedback.strengths.join(" · ")}</p>}{feedback.improvements.length > 0 && <p><strong>Try next:</strong> {feedback.improvements.join(" · ")}</p>}<button className="text-link" onClick={reset}><RotateCcw size={15} /> practice once more</button></div></div>}
    {state === "denied" && <div className="permission-message" role="alert" aria-live="assertive"><h3>microphone access is off.</h3><p>Open your browser&apos;s site settings, allow Microphone, then try again. You can still use every reading step.</p><button className="text-link" onClick={() => setState("idle")}>try again</button></div>}
    {state === "unsupported" && <div className="permission-message" role="alert" aria-live="assertive"><h3>recording is not supported here.</h3><p>Try a current version of Chrome, Safari, Firefox, or Edge on a secure connection.</p></div>}
  </div>;
}

function BreakdownStep() { return <div><div className="step-copy"><p className="eyebrow">padaccheda · word by word</p><h2>see how the sentence opens.</h2><p>Tap or focus a word to connect the Sanskrit form with its working meaning.</p></div><div className="word-grid">{demoShloka.pada.map((item, index) => <article key={item.word}><span>{String(index + 1).padStart(2, "0")}</span><h3 lang="sa">{item.word}</h3><p>{item.meaning}</p></article>)}</div><div className="anvaya-card"><span className="marker-note">anvaya · prose order</span><p lang="sa">{demoShloka.anvaya}</p></div></div>; }

function UnderstandStep({ language, onLanguageChange, aiContent, aiState, enrich }: { language: "en" | "hi" | "mr"; onLanguageChange: (value: "en" | "hi" | "mr") => void; aiContent: AiContent | null; aiState: "idle" | "loading" | "error"; enrich: () => void }) { const shown = aiContent?.summary ?? demoShloka.explanation; return <div className="understand-layout"><div className="step-copy"><p className="eyebrow">meaning in context</p><h2>what is this opening doing?</h2><div className="language-switch" aria-label="Explanation language" role="group">{(["en", "hi", "mr"] as const).map((item) => <button className={language === item ? "active" : ""} aria-pressed={language === item} onClick={() => onLanguageChange(item)} key={item}>{item === "en" ? "English" : item === "hi" ? "हिन्दी" : "मराठी"}</button>)}</div><p className="explanation-text" lang={language === "en" ? "en" : language}>{shown}</p>{aiContent && <ul className="idea-list">{aiContent.keyIdeas.map((idea) => <li key={idea}>{idea}</li>)}</ul>}<button className="text-link" onClick={enrich} disabled={aiState === "loading"}><Sparkles size={16} /> {aiState === "loading" ? "asking Gemini…" : "enrich this explanation with Gemini"}</button>{aiState === "error" && <p className="inline-error" role="alert" aria-live="assertive">AI enrichment is unavailable. The reviewed study note remains here.</p>}</div><aside className="source-note"><p className="eyebrow">reading note</p><blockquote>“Atha” is more than “now”; it signals an auspicious, prepared beginning.</blockquote><p>Keep AI assistance secondary to the source text and a qualified teacher.</p></aside></div>; }

function VisualizeStep() { return <div><div className="step-copy"><p className="eyebrow">concept map</p><h2>from a prepared beginning to a clear purpose.</h2></div><div className="concept-map"><article><span>01</span><h3>अथ</h3><p>a prepared beginning</p></article><i>→</i><article><span>02</span><h3>अतः</h3><p>therefore, with continuity</p></article><i>→</i><article><span>03</span><h3>दीर्घञ्जीवित</h3><p>the inquiry’s purpose</p></article></div><p className="map-caption">A visual study aid—not a replacement for the verse or commentary.</p></div>; }

function ConnectStep() { return <div><div className="step-copy"><p className="eyebrow">connect & apply</p><h2>carry the inquiry beyond a definition.</h2></div><div className="connection-grid">{demoShloka.connections.map((item, index) => <article key={item.title}><span>0{index + 1} · {item.label}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div><div className="disclaimer">Educational context only. Not diagnosis, treatment, or individualized medical advice.</div></div>; }

function QuizStep() { const [answer, setAnswer] = useState<number | null>(null); const options = ["A list of prescriptions", "A prepared beginning and the chapter’s purpose", "A biographical detail about Ātreya", "A conclusion to the chapter"]; return <div className="quiz-layout"><div className="step-copy"><p className="eyebrow">active recall</p><h2>what does the opening establish?</h2><p>Choose the best reading based on this study session.</p></div><div className="quiz-options">{options.map((option, index) => <button className={answer === index ? (index === 1 ? "correct" : "incorrect") : ""} onClick={() => setAnswer(index)} key={option}><span>{String.fromCharCode(65 + index)}</span>{option}{answer === index && index === 1 && <Check size={18} />}</button>)}</div>{answer !== null && <div className="quiz-feedback" role="status" aria-live="polite"><strong>{answer === 1 ? "yes — hold onto that." : "not quite. look at the purpose words again."}</strong><p>The phrasing announces a prepared inquiry into long and wholesome life; it orients the chapter before the details begin.</p></div>}</div>; }
