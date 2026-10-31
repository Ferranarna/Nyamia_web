# 001 · Landing v1 + demo request — Plan

## Orchestration (agents and order)

| Phase | Agent | Output |
|-------|-------|--------|
| 1a | `@nyamia-web-business` | `copy-review.md` (message hierarchy, claims review, open questions) + `apps/web/src/i18n/es.ts` / `en.ts` |
| 1b | `@nyamia-web-uxui` (parallel with 1a) | `ux.md` — storyboard per section, motion spec, mockup inventory, responsive + reduced-motion variants |
| 2a | `@nyamia-web-frontend` | `apps/web` (Astro + islands + mockups + form + SEO + `vercel.json`) + web tests |
| 2b | `@nyamia-web-backend` (parallel with 2a) | `apps/api` (FastAPI hexagonal, Postgres, Alembic, rate limit, Dockerfile) + api tests |
| 3 | `@nyamia-web-qa` | runs all suites, e2e + axe + screenshots, budget check, report |
| 4 | `@nyamia-web-cybersecurity` | review of headers, form/API abuse, PII, privacy notice; verdict |
| 5 | `@nyamia-web-uxui` + orchestrator | visual review vs `ux.md`, fixes routed back |

The API contract in `spec.md` is frozen for phase 2 so web and api can be built in parallel.

## Key decisions

- **Astro static + React islands** over a SPA: the landing is content, SEO matters, and hydration is limited to animated mockups and the form → small JS budget. React keeps parity with the product's frontend skills.
- **Tokens copied from the app** into `packages/brand/tokens.css` (not imported cross-repo): the two repos deploy independently; a sync note in the file names the source.
- **Coded mockups first, real media next (002)**: faithful, lightweight, animatable, localisable (ES/EN text inside the "screens"), no recording dependency. Real recordings will complement them.
- **Separate API service** (not Astro server endpoints): keeps the site 100 % static on Vercel, reuses the founder's FastAPI/hexagonal conventions, and gives leads a proper Postgres home with migrations.
- **Same-origin via Vercel rewrite** (`/api/*` → Railway): no CORS, CSP `connect-src 'self'`. The form endpoint is short-lived, so Vercel's 120 s external-rewrite timeout (the reason the product used two subdomains) does not apply.
- **Rate limiting in Postgres** (count by `ip_hash`/email over a window) rather than in memory: survives restarts and multiple instances; volume is tiny.
- **IP handling:** client IP taken from `X-Forwarded-For` with an explicit `TRUSTED_PROXY_HOP_COUNT`; only an HMAC hash is stored (`IP_HASH_SECRET`).
- **No notification in v1**: `LeadNotifierPort` with a no-op adapter; founder reads leads in the DB console until 004.

## Risks

- Scroll animations hurting performance/LCP on mobile → islands `client:visible`, transform/opacity only, budgets in QA.
- Mockups drifting from the real app → UX/UI reviews against the product source; 002 adds real recordings.
- Legal identity data missing for privacy/legal notice → visible `[PENDIENTE]`, blocking for go-live (003), not for v1 build.
- Copy claims → Business claims review + Cybersecurity on privacy wording.
