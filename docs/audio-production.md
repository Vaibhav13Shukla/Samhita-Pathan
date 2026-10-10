# Reference audio production

## Outcome

Samhita Pathan publishes clear, meter-aware reference chants for Ayurveda study. The learner app never synthesizes audio during a request: it plays only approved, versioned CDN assets associated with the displayed shloka.

## Engine boundary

Use a licensed Sanskrit chant renderer in a separate GPU environment. The renderer must preserve Sanskrit phonology, handle meter, and use a reviewable reference bank. It is a production tool, not a user-facing dependency or product brand. Do not use generated chant for Vedic material, do not imply an unconsenting speaker’s identity, and do not treat generated audio as verified until review is complete.

## Production workflow

1. Create a release manifest from source-reviewed Sanskrit text and split it into padas.
2. Render in the isolated GPU environment using a meter-matched reference style.
3. Listen-review every file for exact text match, meter, pronunciation, pada boundaries, and non-impersonation.
4. Upload approved WAV/MP3 files to a versioned `reference/` key in the approved CDN bucket.
5. Fill the provenance, license, reviewer, and timestamp in the manifest.
6. Validate then import; the importer writes only `approved` reference assets.

```powershell
npm run audio:validate -- tools/audio-studio/example-approved-assets.json
npm run audio:import -- tools/audio-studio/charaka-audio-2026-10.json
```

The example file is intentionally not importable production content. Replace every placeholder with a real source record, license, CDN URL, reviewer, and dated review.

## Operating requirements

- Keep the renderer, weights, reference clips, and GPU credentials outside the web runtime and repository.
- Store source/license records with the release manifest; retain review notes with each imported AudioAsset.
- Keep user recordings private. They must never become reference material or training data without explicit, separate consent.
- Roll back audio by disabling or replacing the affected `objectKey`; the web app resolves the latest approved asset only.
