# Samhita Pathan

A mobile-first Charaka Saṃhitā learning platform for listening, recitation practice, Padaccheda/Anvaya, multilingual understanding, conceptual connections and active recall.

## Architecture at a glance
- Next.js 16 App Router + React 19 + TypeScript + Tailwind v4
- PostgreSQL via Drizzle ORM
- Secure email/password sessions with bcrypt + signed httpOnly cookies
- Google Gemini, server-side only, for structured understanding and post-hoc user-recitation feedback
- Cloudflare R2 for reference and private user audio
- Human-QC-reviewed Sanskrit reference chant assets only

See `docs/PRD.md` for product requirements and `docs/ARCHITECTURE.md` for detailed architecture and data flows.

## Local setup
1. Copy `.env.example` to `.env` and configure PostgreSQL plus a 32+ character `AUTH_SECRET`.
2. Install: `npm install`
3. Apply schema: `npx drizzle-kit push`
4. Seed curated content: `node --env-file=.env --import tsx src/db/seed.ts`
5. Start: `npm run dev`

Gemini and R2 are optional for browsing the curated learning experience, but required for AI enrichment and submitted recitation feedback. The UI shows explicit unavailable states when they are not configured.

## Validation
```bash
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```

## Deployment
Deploy the Next.js app to Vercel (or another server-capable Next.js host) with a pooled managed PostgreSQL URL and all keys in `.env.example`. Use R2/CDN for audio. GitHub Pages is static-only and cannot host this app's auth, database, server-only Gemini key or uploads. See `docs/deployment.md`.

Reference audio is never generated during application deployment. Review every file, upload it as pending, and explicitly approve it before learner access.

## Reference audio
Reference chant assets are published only after meter, pronunciation, and pada-boundary review. Keep any third-party source or model notices required by assets you choose to ship in `docs/ATTRIBUTIONS.md`.

## Safety
Samhita Pathan is educational software. AI-assisted explanations and clinical-study connections may be incomplete or incorrect and are not medical advice.
