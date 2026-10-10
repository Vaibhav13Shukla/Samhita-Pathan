# Known limitations

- The shipped content catalog intentionally contains one curated Charaka study item; no unreviewed Sanskrit or medical content is synthesized to inflate coverage.
- Reference audio is absent until a reviewed asset is imported; the app renders an honest no-audio state.
- Gemini enrichment and recitation feedback require configured credentials and are not available in this local workspace.
- The request limiter is process-local and must be replaced by a shared service for multi-instance production.
- Password recovery and email verification await approved email-provider and policy decisions.
- This workspace has no Git repository metadata or deployment credentials, so no commit, remote push, or live deployment was possible.
