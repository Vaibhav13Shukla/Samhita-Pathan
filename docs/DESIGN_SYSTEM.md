# Samhita Pathan Design System — Warm Study Notebook

This system adapts the supplied “Superr” reference to a serious Sanskrit learning product. Preserve tactile warmth and playful annotations without making sacred/academic material childish.

## Principles
1. **The shloka is the hero.** Devanagari receives generous space and excellent line height.
2. **One obvious next action.** Every screen advances the learning loop.
3. **Tactile, not ornamental.** Paper surfaces, ink borders, restrained marker notes.
4. **Calm confidence.** Decoration never competes with study content.
5. **Inclusive by construction.** WCAG 2.2 AA, keyboard, reduced motion, 44px targets.

## Tokens
- Cream Paper `#fdfbf9`: canvas and controls
- Dew Drop `#f7efe9`: secondary surfaces
- Charcoal `#171717`: text, borders, structural ink
- Cocoa Ink `#2b1a07`: display headings
- Marker Orange `#ff6f1e`: selected states, handwritten emphasis, progress and footer
- Burnt Sienna `#ce500a`: accessible accent text
- Decorative only: Sky `#3b82f6`, Bubblegum `#ff66cf`, Sprout `#22c55e`

No gradients, glassmorphism, neon, or heavy shadows. Orange is the only functional accent. Decorative colors never indicate status or actions.

## Typography
- Display: Fraunces or a licensed Gelica substitute, weight 600, lowercase where natural; desktop max 88–104px, mobile 48–60px.
- UI/body: Geist/Inter/system sans, 16–20px.
- Sanskrit: Noto Serif Devanagari or Tiro Devanagari Sanskrit, 26–38px, line-height 1.65.
- Do not force lowercase on proper nouns, Sanskrit, labels, or accessibility text.

## Shape and Elevation
- Inputs 8px; cards 12px; buttons/tags 20px; footer cap 56px.
- Cards: 1–1.5px charcoal border, `0 2px 20px rgb(0 0 0 / 0.06)`.
- Buttons: cream fill, charcoal border, `0 1px 2px rgb(0 0 0 / 0.22)`.
- Hover uses small translation and border/accent changes, not filled orange buttons.

## Core Components
- `PaperCard`: bordered cream/dew surface, 12px radius, 24–32px padding.
- `InkButton`: 44px minimum outlined pill with icon and label.
- `MarkerTag`: concise orange annotation or selected step.
- `ShlokaPanel`: verse reference, meter, Devanagari, transliteration and provenance.
- `ChantPlayer`: accessible play/pause, seek, 0.75/1/1.25x, time, transcript context; approved assets only.
- `LoopRail`: seven numbered steps with active/completed states; horizontally scrollable on mobile.
- `ChapterCard`: progress, next shloka, plan lock and clear continuation action.
- `Recorder`: microphone state via text + icon + aria-live, timer, discard/submit.
- `BottomNav`: four top-level destinations on small screens.

## Layout
Maximum content width 1200px. Desktop home uses editorial two columns; study mode uses a 280px context rail and fluid learning workspace. Mobile becomes one column with sticky/bottom actions. Section gap 48–64px and element gap 12px.

## Motion
150–220ms ease-out. Respect `prefers-reduced-motion`. Waveform animation stops when paused and is never the only playback indicator.

## Empty, Error, and Loading States
Use plain language, next action, and no blame. Missing approved audio says “Reference chant is being reviewed” with the other study steps still available. AI failures show Retry and preserve previously approved/cached content. Skeletons match final geometry.

## Product Voice
Warm, concise, studious. Prefer “Continue studying,” “Practice this shloka,” and “Reference chant.” Avoid gamified shame, medical promises, or declaring imperfect recitation “wrong.”
