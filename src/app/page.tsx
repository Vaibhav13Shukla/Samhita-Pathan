import Link from "next/link";
import { ArrowDownRight, ArrowRight, AudioLines, BookOpenCheck, Brain, Mic2, Quote, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { demoShloka } from "@/data/demo-content";

const loop = [
  ["01", "listen", "A reviewed, metrically-aware reference chant."],
  ["02", "recite", "Record in your own time and receive constructive feedback."],
  ["03", "break down", "See Padaccheda, word meanings, and Anvaya together."],
  ["04", "understand", "Build meaning in English, Hindi, or Marathi."],
  ["05", "connect", "Relate concepts carefully to the wider study context."],
  ["06", "recall", "Answer a focused question, then return at the right time."],
];

export default function HomePage() {
  return (
    <><SiteHeader /><main id="main-content">
      <section className="hero page-shell">
        <div className="hero-copy">
          <span className="marker-note">a living study notebook for Ayurveda</span>
          <h1>every shloka,<br /><em>held a little longer.</em></h1>
          <p className="hero-lede">Hear authentic chant. Practice your recitation. Open up the Sanskrit. Understand why the verse matters—then remember it.</p>
          <div className="hero-actions"><Link className="ink-button" href="/study">begin with Charaka <ArrowRight size={17} /></Link><Link className="text-link" href="/study">explore the learning loop <ArrowDownRight size={17} /></Link></div>
          <p className="quiet-note">Open access · English, हिन्दी, मराठी · educational use only</p>
        </div>
        <div className="hero-object" aria-label="Preview of the Samhita Pathan study notebook">
          <span className="sticker sticker-spark"><Sparkles size={24} /></span>
          <span className="scribble-label">today&apos;s shloka <span aria-hidden="true">↘</span></span>
          <article className="study-notebook">
            <div className="notebook-top"><span>samhita pathan</span><span>01 / 30</span></div>
            <p className="mini-reference">{demoShloka.reference}</p>
            <blockquote lang="sa">अथातो दीर्घञ्जीवितीयम्<br />अध्यायं व्याख्यास्यामः ।</blockquote>
            <div className="mini-player"><Link href="/study" aria-label="Open the study preview"><AudioLines size={19} /></Link><span className="wave" aria-hidden="true">▂▅▃▇▄▆▂▅▇▃▆▂</span><span>study preview</span></div>
            <div className="mini-tabs"><span className="active">listen</span><span>recite</span><span>understand</span></div>
            <div className="notebook-note"><span>दीर्घञ्जीवितीयम्</span><p>concerning a long and wholesome life</p></div>
          </article>
          <span className="sticker sticker-quote"><Quote size={23} /></span>
        </div>
      </section>

      <section className="trust-strip"><p><strong>one verse.</strong> one complete learning loop.</p><div><span><AudioLines size={18} /> reviewed chant</span><span><Mic2 size={18} /> guided practice</span><span><BookOpenCheck size={18} /> Sanskrit breakdown</span><span><Brain size={18} /> active recall</span></div></section>

      <section className="method page-shell" id="method">
        <div className="section-heading"><span className="marker-note">from sound to understanding</span><h2>not more content.<br />a better way through it.</h2><p>Move through one clear step at a time. Your place is saved, the source remains visible, and every generated layer stays secondary to the text.</p></div>
        <div className="loop-grid">{loop.map(([number, title, description]) => <article className="loop-card" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="reference-section page-shell">
        <div className="reference-quote"><span className="marker-note">begin at the source</span><blockquote lang="sa">{demoShloka.sanskrit}</blockquote><p>{demoShloka.transliteration}</p></div>
        <div className="reference-copy"><p className="eyebrow">Charaka Saṃhitā first</p><h2>small, curated, and useful from day one.</h2><p>We begin with a focused set of Sūtrasthāna verses—not a vast library of unchecked output. Each reference chant passes listening review before it appears in the player.</p><Link className="ink-button" href="/study">open the library <ArrowRight size={17} /></Link></div>
      </section>

      <section className="cta-section page-shell"><span className="scribble-label">your next study session →</span><h2>read less like an exam is tomorrow.<br /><em>learn like the verse should stay.</em></h2><Link className="ink-button" href="/study">open your study space <ArrowRight size={17} /></Link></section>
    </main><footer className="brand-footer"><div><strong>samhita pathan</strong><p>Where every shloka comes alive.</p></div><div className="footer-links"><Link href="/study">library</Link><Link href="/about">about & attributions</Link></div><span>Educational use only · not medical advice</span></footer></>
  );
}
