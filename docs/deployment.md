# Deployment and operations

## Hosting decision

Deploy this application to a server-capable Next.js platform. **Do not deploy it to GitHub Pages**: static Pages cannot run route handlers, protect cookie sessions, connect to PostgreSQL/R2, or keep Gemini credentials server-only.

## Required environment variables

`DATABASE_URL`, `AUTH_SECRET` (32+ characters), `APP_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`. Configure `R2_PUBLIC_URL_BASE` only for reviewed public reference audio. Values belong in the host secret store, never the repository.

## Release procedure

1. Provision managed PostgreSQL and apply Drizzle changes in a separate, single-run migration job.
2. Deploy with server secrets configured and verify `/api/health` can reach PostgreSQL.
3. Seed/import source-reviewed content. Upload reference audio only after human QC marks it approved.
4. Run the staging checks in `docs/testing.md`; inspect server logs for failures without recording audio, cookies, tokens, or secrets.
5. Promote only after the checks pass and configure R2 lifecycle/backup policies.

Reference audio is produced and QC-approved separately from deployment. Follow `docs/audio-production.md`; never generate audio in a deployed route handler.

## Rollback and recovery

Keep database migrations backward compatible. Roll back the application image first; do not reverse data migrations without a tested backup and explicit change approval. Restore PostgreSQL from provider backups. Private recordings are deleted by the account-deletion flow; verify storage lifecycle rules separately and alert on deletion failures.
