import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import { chapters, samhitas, shlokas } from "./schema";
import { demoShloka } from "../data/demo-content";

async function seed() {
  await db.insert(samhitas).values({
    slug: "charaka-samhita",
    title: "Charaka Saṃhitā",
    titleSanskrit: "चरकसंहिता",
    description: "A foundational compendium of Ayurveda, beginning with a curated Sūtrasthāna study set.",
    published: true,
  }).onConflictDoNothing({ target: samhitas.slug });
  const [samhita] = await db.select().from(samhitas).where(eq(samhitas.slug, "charaka-samhita")).limit(1);

  await db.insert(chapters).values({
    samhitaId: samhita.id,
    slug: "sutrasthana-1-dirghanjivitiya",
    title: "Dīrghañjīvitīya Adhyāya",
    titleSanskrit: "दीर्घञ्जीवितीय अध्याय",
    sthana: "Sūtrasthāna",
    order: 1,
    published: true,
  }).onConflictDoNothing({ target: [chapters.samhitaId, chapters.slug] });
  const [chapter] = await db.select().from(chapters).where(eq(chapters.slug, "sutrasthana-1-dirghanjivitiya")).limit(1);

  await db.insert(shlokas).values({
    chapterId: chapter.id,
    stableKey: demoShloka.id,
    reference: demoShloka.reference,
    sanskritText: demoShloka.sanskrit,
    padas: ["अथातो दीर्घञ्जीवितीयमध्यायं व्याख्यास्यामः ।", "इति ह स्माह भगवानात्रेयः ॥"],
    transliteration: demoShloka.transliteration,
    meter: "anushtubh",
    sourceEdition: "Curated demo; source edition must be confirmed before public content release",
    order: 1,
    premium: false,
    contentReviewed: false,
  }).onConflictDoNothing({ target: shlokas.stableKey });

  console.log("Seeded curated Charaka study content.");
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
