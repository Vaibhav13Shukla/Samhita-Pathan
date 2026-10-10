# Product Requirements Document — Samhita Pathan

**Status:** Draft for human approval  
**Owner:** Principal Product Manager  
**MVP:** Curated Charaka Samhita learning loop

## Vision
Turn each Charaka Samhita shloka from an item to memorize into a complete, repeatable learning experience: hear it, say it, parse it, understand it, connect it, and retain it.

## Target User
A mobile-first BAMS student who studies in English, Hindi, or Marathi; has limited access to expert pronunciation help; and needs trustworthy, exam-relevant support without unsupported medical claims.

## Jobs to Be Done
- When I encounter a shloka, help me hear and practice its pronunciation.
- When Sanskrit compounds are dense, show Padaccheda, meanings, and Anvaya.
- When I can translate but not interpret, explain the concept in my preferred language.
- When exams approach, help me retrieve and revisit what I studied.

## Goals
1. A student reaches meaningful study content within two minutes of registration.
2. The curated MVP set completes the full learning loop with quality-reviewed Sanskrit and audio.
3. Students can resume the next incomplete step/shloka across devices.
4. AI augmentation is transparent, validated, resilient, and educational.

## Non-goals
Payments, institutional administration, all Charaka content, other Samhitas, native mobile apps, live GPU synthesis, real-time coaching, medical diagnosis, or prescriptions.

## Core Journey
1. Land on value proposition and preview a real shloka.
2. Register, select preferred language, and enter the Library.
3. Continue a chapter or choose Sthana → chapter → shloka.
4. Complete Listen, Recite, Break Down, Understand, Visualize, Connect & Apply, Quiz.
5. Progress saves at each step; completion suggests the next shloka and spaced review.
6. Settings manages language, plan display, privacy, and required attributions.

## MVP Requirements
### Account and onboarding
- Email/password register, login, logout, session renewal.
- Password policy: at least 8 characters including a number.
- Preferred language: English, Hindi, Marathi.
- Generic login errors, duplicate registration guidance, rate-limited auth.

### Library and progress
- Charaka Samhita and eight Sthanas represented; curated chapters/shlokas clearly marked.
- Search by title/reference and resume current study.
- Chapter progress and per-step progress stored per user.
- Free/premium entitlements enforced server-side, with a friendly locked state.

### Study workspace
- High-quality Devanagari, reference, meter, transliteration and provenance.
- Approved reference WAV playback with seek, speed, keyboard support.
- Browser microphone recording; upload; processing/failed/completed feedback state.
- Padaccheda chips, word meanings, Anvaya, preferred-language explanation.
- Structured Hita/Ahita and connection cards with educational disclaimer.
- MCQ quiz with explanation and next-step action.

### Settings and trust
- Update preferred language.
- See plan and entitlement explanation.
- About page surfaces reference-audio provenance and Gemini disclosure.
- Privacy copy explains recordings; deletion control is required before public beta.

## User Stories and Acceptance Summary
- As a new student, I can register and select a language so content fits my study context.
- As a returning student, I can securely resume where I stopped.
- As a learner, I only hear human-QC-approved reference chants.
- As a learner, I can record and receive constructive post-hoc feedback with retryable failures.
- As a learner, I can see Padaccheda/Anvaya and explanations without trusting unvalidated model output.
- As a learner, I can test recall and understand why an answer is correct.
- As a user, I can identify AI-generated content, the reference voice, and educational limitations.

## Content Operations
Each shloka needs stable ID/reference, edition/source, padas, meter, transliteration, review state, and entitlement. Reference audio moves pending → approved/rejected with reviewer notes. Only approved audio and approved/cached educational content should be publicly featured.

## Success Metrics
- Activation: ≥60% of registrants complete one Listen + Understand loop in 24 hours.
- Learning-loop completion: ≥35% of activated users finish one full loop in week one.
- Return: ≥30% week-one retention for activated students.
- Audio: <1% broken playback; CDN first byte target <300ms in target regions.
- AI: ≥95% schema-valid after retry; user-visible failure <3%; no raw provider errors.
- Quality: 100% launched reference assets explicitly QC approved.

## Safety, Privacy and Accessibility
- “Educational, not medical advice” on clinical context.
- Recordings are private user data; object-level authorization on every attempt.
- Define retention/deletion policy before beta. Never train on user audio without explicit consent.
- WCAG 2.2 AA target; keyboard player/quiz; recorder aria-live; color-independent status; reduced motion.

## Rollout
1. Internal content preview with 5–10 shlokas and approved audio.
2. Closed prototype with BAMS students and qualitative pronunciation/understanding feedback.
3. Beta after auth security, deletion, observability, content QC, and accessibility gates.
