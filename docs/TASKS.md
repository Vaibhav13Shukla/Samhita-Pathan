# Delivery Board

## Phase Gates
- [x] Phase 0 — Bootstrap/docs skeleton
- [ ] Phase 1 — PRD approved (`/approve prd`)
- [ ] Phase 2 — Architecture approved (`/approve architecture`)
- [ ] Phase 2 — Design approved (`/approve design`)
- [ ] Phase 2.5 — Audio content approved (`/approve audio-content`)
- [ ] Phase 6 — Production deploy approved (`/approve deploy`)

| ID | Feature | Owner | Status | Evidence / next gate |
|---|---|---|---|---|
| 0001 | Account registration/login | backend + frontend + security | In Review | Secure vertical slice implemented; validation tests green; Playwright journey still required |
| 0002 | Samhita library/progress | frontend + backend | In Review | Curated DB/UI implemented; persistent progress endpoint/e2e remains |
| 0003 | Listen & Recite | TTS + AI + fullstack | In Review | Recorder/upload/evaluation path built; approved-only test green; real WAV launch blocked on `/approve audio-content` |
| 0004 | Understanding layer | AI + content QA | In Dev | Curated fallback + schema-validated Gemini enrichment implemented; full spec/evals pending |
| 0005 | Visualize | AI + design | In Dev | Curated concept map vertical slice; generation/caching spec pending |
| 0006 | Connect & Apply | PM + AI + safety | In Dev | Educational cards/disclaimer vertical slice; generation spec pending |
| 0007 | Quiz & repeat | AI + fullstack | In Dev | Interactive recall slice; persistence/spaced review spec pending |
| 0008 | Settings/About/privacy | frontend + security | In Review | Attribution UI included; recording deletion/retention spec required before beta |

Allowed states: Backlog · Spec Draft · Spec Approved · Tests Red · In Dev · In Review · Done.
