# API Contract — Samhita Pathan

All JSON errors use `{error: {code, message, fields?}}`. Inputs and AI outputs are Zod validated. Mutating authenticated routes require same-origin requests and CSRF hardening before beta.

## Auth
- `POST /api/auth/register` public — `{email,password,name,preferredLanguage}` → `201 {user}` + httpOnly session. Errors 400/409/429.
- `POST /api/auth/login` public — `{email,password}` → `200 {user}` + session. Generic 401; rate limited.
- `POST /api/auth/logout` authenticated — clears session, `204`.
- `GET /api/auth/me` authenticated — safe user profile.
- `PATCH /api/profile` authenticated — language/name updates.

## Library
- `GET /api/library` optional auth — Samhita/Sthana/chapter cards with entitlement and user progress.
- `GET /api/chapters/:id` optional auth — chapter metadata and ordered shlokas.
- `GET /api/shlokas/:id` optional auth — source text/metadata and available approved content.
- `PUT /api/shlokas/:id/progress` auth — `{step,completed}`; idempotent.

## Pathana
- `GET /api/shlokas/:id/audio` optional auth — `{audio: {url,meter,durationSeconds}|null}`. Query enforces approved reference only.
- `POST /api/shlokas/:id/recitation-attempts` auth, multipart audio — validates size/MIME, stores private object, creates `processing`; returns `202 {attemptId,status}`.
- `GET /api/recitation-attempts/:id` auth/owner — status and validated feedback. Non-owner receives 404.
- `POST /api/recitation-attempts/:id/retry` auth/owner — retry failed attempt within quota.

## Learning Content
- `GET /api/shlokas/:id/breakdown?language=en|hi|mr` optional auth — approved/cached Padaccheda and Anvaya.
- `GET /api/shlokas/:id/explanation?language=...` optional auth — cached explanation.
- `GET /api/shlokas/:id/visualization?language=...` optional auth — structured Hita/Ahita.
- `GET /api/shlokas/:id/connections?language=...` optional auth — educational cards and disclaimer.
- `POST /api/shlokas/:id/quiz` auth/entitled — returns validated question set.
- `POST /api/quiz-attempts` auth — responses, score, explanations and progress update.

## Current Slice
The starter implementation exposes auth, session, demo content and Gemini enrichment under Next.js `/api`. Remaining routes are delivered feature-by-feature under approved specs; no client should bypass the documented contract.
