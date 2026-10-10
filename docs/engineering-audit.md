# Engineering audit — October 10, 2026

## Confirmed architecture

Samhita Pathan is a single Next.js 16 App Router application using React 19, TypeScript, PostgreSQL/Drizzle, bcrypt password hashes, signed httpOnly sessions, Cloudflare R2-compatible storage, and server-only Gemini calls. The app intentionally keeps its web/API process as one deployable unit; audio rendering is not part of its request path.

## Confirmed working implementation surfaces

- Email/password registration, login, logout, and `/api/auth/me` use server-side validation and signed httpOnly cookies.
- The schema has user ownership for progress, recordings, and recitation attempts; attempt reads are constrained to the owner.
- Reference-audio lookup only returns approved reference assets.
- Browser recording has explicit unsupported, denied, upload, processing, and failure states.
- The study workspace now hydrates and saves authenticated progress, and account settings supports language preference and account-data deletion.

## Gaps found and addressed in this completion pass

- The study UI previously claimed progress was saved while keeping it only in React state. `GET/PATCH /api/progress` now persists and restores it.
- AI explanation previously accepted only a hard-coded content key and was unauthenticated. It now requires a user, resolves a published database shloka, rate-limits requests, and caches canonical output by language and prompt version.
- Account settings, language preference updates, and deletion were missing from the user journey. They are now implemented with server authorization; private recording objects are removed before the database account deletion succeeds.
- The public experience contained legacy vendor-facing reference-audio branding. It is now product-neutral and describes the actual QC contract instead.
- A non-functional landing-page player was replaced with a real study-preview link. Skip navigation, a page-level study heading, selected-language semantics, and Escape-to-close library behavior were added.

## Remaining release blockers

- The curated release currently has one shloka. Adding chapters requires source-reviewed Sanskrit, translations, quiz material, and audio assets; this must not be fabricated.
- No production database, R2 credentials, Gemini credentials, reviewed audio asset, or deployment access was available in this workspace. Those integrations are implemented but cannot be exercised here.
- In-memory rate limiting is acceptable for local development only. Production requires a shared KV/Redis-compatible limiter before public launch.
- Browser-level E2E testing needs a configured database and real storage/provider test environment.

## Deployment status

GitHub Pages is not suitable because this application requires server-side sessions, database routes, storage credentials, and AI keys. Deploy the Next.js server to a server-capable host such as Vercel; see `docs/deployment.md`.
