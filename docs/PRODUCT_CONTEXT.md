# Product Context Pack — Samhita Pathan

## Product
**Samhita Pathan** is a modern interactive learning layer for Ayurveda Samhitas, beginning with Charaka Samhita. Tagline: **Where every shloka comes alive.** It is not another digital textbook: it connects recitation, Sanskrit analysis, conceptual understanding, practical context, and retention.

## Student Problem
The current loop is Read → Memorize → Exam → Forget. BAMS students repeatedly ask:
- How do I pronounce this correctly?
- What does the dense Sanskrit mean word by word?
- Why is this relevant to present-day study or clinical context?

## Complete Learning Loop
1. **Choose** a Samhita, Sthana/chapter, and shloka.
2. **Listen** to an authentic metrically-aware reference chant.
3. **Recite** into the browser microphone and receive post-hoc feedback.
4. **Break down** with Padaccheda, word meanings, and Anvaya.
5. **Understand** in English, Hindi, or Marathi.
6. **Visualize** Hita/Ahita and related conceptual relationships.
7. **Connect & Apply** through educational lifestyle, mental-wellbeing, and clinical-study notes.
8. **Repeat / Quiz** for retrieval practice, then continue to the next shloka.

## MVP
### Must have
- Register, login/logout, secure session, profile and preferred language
- Charaka Samhita library by Sthana/chapter and progress
- Approved reference audio, accessible player, user recording and feedback
- Padaccheda, Anvaya, word meanings, and preferred-language explanation
- Responsive onboarding, dashboard, settings/about, clear empty/error states

### Fast follow in the same product
- Hita/Ahita visualization
- Connect & Apply cards with medical-education disclaimer
- MCQ quiz and retention loop

### Out of scope for MVP
- Sushruta Samhita and Ashtanga Hridaya content
- Institutional admin and payments
- Native apps
- Live/on-demand reference-audio generation
- Real-time pronunciation coaching or medical advice

## Persona and Business Model
Primary persona: a BAMS student preparing for exams who needs to recite, understand, and retain Charaka Samhita. Plans are `free`, `premium`, and future `institutional`. Build entitlements from day one; payment is initially a stub. Free users receive a useful sample; premium unlocks complete chapters, deeper content, feedback, and quizzes.

## Safety and Content Quality
- Clinical material is educational and never diagnostic/prescriptive.
- Sanskrit source, edition, AI-generation status, and human review state should be visible where practical.
- AI may assist but does not become an authority. Content requires provenance and correction pathways.

## Gemini Responsibilities
Google Gemini is the sole general AI provider for Padaccheda/Anvaya assistance, translation/explanation, structured visualization, Connect & Apply, quiz generation, and evaluation of the user's own recitation. Calls are server-side, schema validated, bounded, cached, and failure-aware.

## Reference audio policy

Reference audio is a reviewed content asset, not a runtime generation feature. The application resolves only approved static URLs. Each file must be traceable to a source and license, match the displayed shloka, pass meter/pronunciation/pada-boundary review, and carry its reviewer decision before release. Gemini never generates reference chanting.

## Visual Product Direction
Adapt the supplied Superr system into a mature study notebook:
- Warm cream paper, cocoa/charcoal ink, marker orange accent, matte surfaces.
- Rounded editorial display face; clean grotesk for UI; Noto/Tiro Devanagari for Sanskrit.
- Outlined pill controls and cards, 12–20px radii, minimal shadows.
- Hand-drawn arrows/stickers are sparing decoration, never system icons.
- Sanskrit verses, study notes, waveform/progress, and chapter labels are the primary visual objects.
- Mobile-first bottom navigation: Home, Library, Practice, Settings.
