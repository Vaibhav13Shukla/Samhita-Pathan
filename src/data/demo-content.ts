export const demoShloka = {
  id: "charaka-sutra-1-1",
  reference: "Charaka Saṃhitā · Sūtrasthāna 1.1",
  meter: "Anuṣṭubh · meter review pending",
  sanskrit: "अथातो दीर्घञ्जीवितीयमध्यायं व्याख्यास्यामः ।\nइति ह स्माह भगवानात्रेयः ॥",
  transliteration: "athāto dīrghañjīvitīyam adhyāyaṃ vyākhyāsyāmaḥ · iti ha smāha bhagavān ātreyaḥ",
  pada: [
    { word: "अथ", meaning: "now; an auspicious beginning" },
    { word: "अतः", meaning: "therefore; after due preparation" },
    { word: "दीर्घञ्जीवितीयम्", meaning: "concerning a long and wholesome life" },
    { word: "अध्यायम्", meaning: "the chapter" },
    { word: "व्याख्यास्यामः", meaning: "we shall explain" },
  ],
  anvaya: "अथ अतः दीर्घञ्जीवितीयम् अध्यायम् व्याख्यास्यामः।",
  explanation: "The text opens by announcing an inquiry into the foundations of a long, wholesome life. The phrasing marks both continuity with prior learning and readiness to examine the subject methodically.",
  connections: [
    { label: "study lens", title: "Purpose before detail", text: "The opening frames the objective before the chapter develops its categories and methods." },
    { label: "clinical learning", title: "Ask what outcome knowledge serves", text: "Read each later concept in relation to health, longevity, and responsible reasoning—not as an isolated definition." },
    { label: "reflection", title: "Readiness matters", text: "Atha signals a prepared beginning: pause, listen, then study with attention." },
  ],
};

export const sthanas = [
  ["Sūtrasthāna", "सूत्रस्थान", 18, 30],
  ["Nidānasthāna", "निदानस्थान", 6, 8],
  ["Vimānasthāna", "विमानस्थान", 0, 8],
  ["Śārīrasthāna", "शारीरस्थान", 0, 8],
  ["Indriyasthāna", "इन्द्रियस्थान", 0, 12],
  ["Cikitsāsthāna", "चिकित्सास्थान", 0, 30],
  ["Kalpasthāna", "कल्पस्थान", 0, 12],
  ["Siddhisthāna", "सिद्धिस्थान", 0, 12],
] as const;
