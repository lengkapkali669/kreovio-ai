# Kreovio AI v1.1 — Cloudflare Pages

Bilingual AI Caption Generator. Dark Purple Neon UI, individual copy buttons, three separate result cards, regenerate action, and stricter factual prompt.

## Deploy update
1. Extract this ZIP.
2. In the existing GitHub repository `kreovio-ai`, replace the matching files with these updated files. Preserve the root structure.
3. Commit to branch `main`. Cloudflare Pages should automatically deploy the new commit.
4. Keep the existing Pages Workers AI binding named `AI`; do not add a duplicate binding.
5. Test the live website on desktop and mobile.

## Important backend note
The endpoint is `POST /api/generate`. It uses the existing Workers AI binding `AI` and model `@cf/meta/llama-3.1-8b-instruct-fp8`. If your Cloudflare account no longer offers this model, choose an available text-generation model in Cloudflare's model catalog and update `MODEL` in `functions/api/generate.js`.

## Test request
```json
{
  "topic": "Sneakers hitam untuk aktivitas sehari-hari",
  "platform": "Instagram",
  "tone": "Casual and friendly",
  "outputLanguage": "Bahasa Indonesia",
  "details": "Target audiens: mahasiswa. Jangan sebut diskon atau fitur yang tidak diberikan."
}
```

## Before public launch
- Add rate limiting / abuse protection to `/api/generate`.
- Review Workers AI quotas and costs.
- Complete privacy policy and terms for the final service.
- Check brand/domain availability before investing in branding.
- Test copy behavior in supported browsers and mobile devices.


## Version 1.2.0 — Caption quality update
- Reworked the copywriting prompt for more natural, platform-aware captions.
- Enforces three distinct creative angles: relatable, short/punchy, and action-oriented.
- Stronger factual guardrails to reduce invented product claims, prices, discounts, and deadlines.
- More robust JSON response parsing and clearer server errors.
- Frontend labels now communicate each caption's creative direction.

Deployment: replace the repository files with this ZIP's contents, commit to `main`, and let Cloudflare Pages deploy. Keep the existing Workers AI binding named `AI`.
