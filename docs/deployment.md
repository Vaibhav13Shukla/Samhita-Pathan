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

## Free-tier Supabase + Vercel launch

The app uses PostgreSQL through Drizzle, so it connects directly to Supabase Postgres. Do **not** add `NEXT_PUBLIC_SUPABASE_URL`, an anon key, or a service-role key: this release does not use the Supabase JavaScript client and those values would add unnecessary secret-management risk.

1. Create a Supabase project, keep its database password private, and copy the **Transaction pooler** connection string from **Connect**. Replace `[YOUR-PASSWORD]` with the password you chose. Use this as `DATABASE_URL` in Vercel and locally for the next step.
2. From a local shell in the repository, set `DATABASE_URL` only for that shell and run `npm run db:push`. This creates the required tables in your Supabase database; never run database schema changes as a Vercel build step.
3. In Vercel, set `AUTH_SECRET` to a newly generated random value of at least 32 characters. Set `APP_URL` only after Vercel assigns the production URL, then redeploy once.
4. Add `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-2.5-flash`. Keep both server-only.
5. R2 settings are optional until recording uploads/reference-audio delivery are enabled. Without them, the main study and explanation features work; recording upload returns a safe configuration error instead of exposing a secret.

## Rollback and recovery

Keep database migrations backward compatible. Roll back the application image first; do not reverse data migrations without a tested backup and explicit change approval. Restore PostgreSQL from provider backups. Private recordings are deleted by the account-deletion flow; verify storage lifecycle rules separately and alert on deletion failures.
