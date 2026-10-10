# Implementation plan and status

## Completed in this pass

1. **P0 foundation:** authenticated, database-backed learning-progress API with unique per-user/per-shloka upsert semantics.
2. **P0 cost/security:** authenticated, published-content-only AI explanations with bounded request payloads, per-user local throttling, strict schema validation, and cache reuse.
3. **P1 privacy:** settings UI, language preference endpoint, deliberate account deletion confirmation, and deletion of tracked private recording objects before database deletion.
4. **P1 user journey:** registration → study → save/resume progress → language settings → deletion. Anonymous learners can preview but are told when persistence requires signing in.
5. **P2 quality:** removed misleading player action and legacy runtime branding; added keyboard/accessibility foundations.

## Next authorized release work

- Import only reviewed Charaka content and approved reference audio through the content pipeline.
- Replace development-only rate limiting with an environment-configured shared store.
- Add integration tests against provisioned PostgreSQL/R2 and browser journeys against a staging deployment.
- Add password-reset/email-verification only after selecting a transactional email provider and defining recovery policy.

## Ownership/dependencies

The app does not need a second backend service. Content operations own source provenance and audio QC; application engineering owns schema/API/UI; operations owns secrets, database migrations, R2 lifecycle rules, and staging verification. Public deployment is blocked on those environment owners, not on a client-side feature toggle.
