# [0003] — Pathana Engine: Listen & Recite

## Status
Approved from product context; audio content gate remains external.

## Links
- PRD: Core Journey — Listen and Recite
- API: `GET /api/shlokas/:id/audio`, `POST /api/shlokas/:id/recitation-attempts`, `GET /api/recitation-attempts/:id`
- DB: AudioAsset, RecitationAttempt
- Dependency: Phase 2.5 reviewed-audio content pipeline

## Summary
Listen plays a QC-approved, pre-rendered reference recitation. Recite lets an authenticated student record their own voice, upload it privately, and receive schema-validated post-hoc Gemini pronunciation feedback stored as a RecitationAttempt.

## Acceptance Criteria
### Scenario: Play reference audio
Given a shloka has a reference AudioAsset with `qcStatus=approved`
When the student opens the shloka and activates Play
Then audio streams from its CDN URL with play/pause/seek/speed controls and keyboard-operable labels.

### Scenario: No approved reference
Given no approved reference exists
When the student opens Listen
Then a clear “Reference chant is being reviewed” state appears, without a broken player or silent failure.

### Scenario: Record and submit
Given an authenticated student granted microphone access
When they record and submit supported audio within the size/duration limit
Then the private file is stored, an owned attempt is created as `processing`, and the UI polls with an aria-live status
And validated Gemini feedback eventually changes it to `completed` with score and constructive text.

### Scenario: Microphone denied
Given microphone permission is denied
When recording is requested
Then the UI explains how to enable access and provides no fake recording state.

### Scenario: Evaluation fails
Given Gemini times out, refuses, or returns invalid output
When processing finishes
Then the attempt is `failed` with a user-safe retry; provider details are logged server-side only.

### Scenario: Cross-user access
Given user A owns an attempt
When user B guesses its ID
Then the API returns 404 without revealing existence.

### Scenario: Malicious/oversized upload
Given a mismatched MIME, unsupported audio type, or excessive payload
When submitted
Then it is rejected before provider processing/storage persistence, with a safe validation error.

## Non-functional Requirements
- Reference first byte target <300ms via CDN; lazy-load waveform code.
- Signed short-lived URLs for private recordings; authz on every attempt route.
- Player and speed controls are keyboard accessible; recorder state uses aria-live and color-independent cues.
- Reference launch requires approved AudioAsset rows for the curated set.
- Quotas bound Gemini/storage cost; reference audio is never generated in request handling.

## Test Plan
- [ ] Unit: approved-only lookup; attempt state machine; MIME/size validator; Gemini schema/failure mapping.
- [ ] Integration: audio happy/empty; submission happy/failure; owner lookup; cross-user 404; unsupported upload.
- [ ] Component: player controls, coming-soon state, permission denial, processing/retry.
- [ ] E2E: approved playback; fake-media record → submit → feedback; denied permission.
- [ ] Security: signed URL TTL, upload key randomization, logs contain no recording/token.

## Rollout
Release approved static references first. Gate recording evaluation behind quotas and a feature flag. Roll back by disabling submissions while preserving playback and existing attempts.

## Out of Scope
- On-demand reference-audio generation
- Real-time streaming feedback
- Automatic audio approval
