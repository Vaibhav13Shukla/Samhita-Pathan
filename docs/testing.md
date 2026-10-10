# Testing and verification

## Local commands

```powershell
npm run lint
npm run typecheck
npm run build
npm test
python C:\Users\LENOVO\.agents\skills\a11y-audit\scripts\a11y_scanner.py . --format table
```

## Coverage in this repository

- `auth-validation.test.ts`: password and normalized-email validation.
- `gemini-schema.test.ts`: strict educational output contract.
- `audio-assets.integration.test.ts`: approved-audio visibility; run with `RUN_DATABASE_TESTS=true` and a disposable PostgreSQL database.
- `study-progress.test.ts`: progress normalization and state invariants.
- `reference-audio.test.ts`: approved-audio provenance, QC gates, and HTTPS/versioned object-key requirements.

## Required staging checks before release

1. Register, select a language, complete a step, refresh, and confirm resume state.
2. Confirm a user cannot fetch another user’s attempt or private recording.
3. Confirm account deletion removes user data and recording objects.
4. Validate a reviewed audio asset plays, and an unavailable asset renders the no-audio state.
5. Test microphone deny/unsupported/upload/provider-failure cases.
6. Test AI unavailable, malformed provider response, cache hit, and rate limit.
7. Run keyboard-only and screen-reader smoke tests for skip navigation, study-step selection, language controls, recorder, and settings.

The results of commands run in this environment are recorded in the delivery report; external-service tests must not be claimed green without a configured environment.

## Verification completed October 10, 2026

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- Focused unit suite: 8 passed, 0 failed.
- `npm run build`: passed using a non-production placeholder database URL for route discovery; no database connection was made.
- `npm run audio:validate -- tools/audio-studio/example-approved-assets.json`: passed.
- The database integration test remains opt-in because no disposable PostgreSQL service was provided.
