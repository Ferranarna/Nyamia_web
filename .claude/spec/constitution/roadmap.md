# Roadmap

_Order and status of website features. Each done/in-progress entry points at its folder under `features/`. Business priority comes from the product's business roadmap (`../NutriBot/.claude/spec/business/roadmap.md`): the landing is on the critical path of milestone **N1 · public launch of Nyamia** (needs: bilingual landing, demo/waitlist capture, basic privacy notice, demo video)._

## Done

1. **001 · Landing v1 + demo request** — bilingual (ES/EN) scroll-narrative landing at `nyamia.com`, coherent with the app's design system; animated product mockups (command bar → weekly menu → macro fit → compliance → PDF); demo-request form backed by `apps/api` (FastAPI + Postgres); privacy notice; security headers; SEO basics; test suites. Done 2026-10-30 as a **build** (not deployed): web Vitest 89 + Playwright 62, API pytest 113, Lighthouse mobile 100×4 locally, security verdict "ship with mitigations" (go-live items in 003). Founder questions in `copy-review.md` § 6 — answered 2026-10-31 (demo request kept; no founder block, no "beta", no price; demos in English OK; no response-time promise). → [`features/001-landing-and-demo-request/`](../features/001-landing-and-demo-request/)

## In progress

_Nothing._

## Next

_Candidates, to be specced one at a time._

- **002 · Real product media** — replace/complement coded mockups with real screen recordings of `app.nyamia.com` (demo account, fictitious clients): 60–90 s demo video (ES voice/subtitles, per business roadmap target 2026-11-15) + short loops per feature. Needs: recording script (Business), capture + compression pipeline (Frontend), poster frames.
- **003 · Production go-live** — Vercel project + `nyamia.com` DNS, Railway API service + Postgres, `/api` rewrite, uptime check, `pg_dump` routine for leads, real privacy-notice controller data. **Go-live blockers from 001's security review** (`features/001-…/security-review.md`): H1 — measure the real Vercel→Railway `X-Forwarded-For` chain, set `TRUSTED_PROXY_HOP_COUNT`, and make the API reject requests that bypass Vercel (shared-secret header; fallback: global hourly lead cap, Business decision); M2 — Vercel Firewall rate limit on `/api/*`; M3 — dated plan for the 12-month lead deletion job + backup rotation; M4 — legal identity, processors and transfer safeguards in the privacy/legal notices: the pages now show "Nyamia" + farnausgar@gmail.com only (founder decision 2026-10-31); **NIF, address and legal-entity name (and registry data if a company) are still required by LSSI-CE art. 10 / RGPD art. 13 before go-live** — not shown on the page until provided; then bump `privacy.version` with the API default.
- **004 · Lead notification** — email to the founder on each demo request (Resend), after the provider DPA/SPF/DKIM/DMARC checks.

## Backlog / ideas

- Cookieless analytics (e.g. Vercel Web Analytics or self-hosted Plausible) — needs Cybersecurity + privacy-notice update; measures the north-star conversion.
- Calendar booking after the form (self-hosted or embedded scheduler) — third-party request, needs review.
- Pricing section (Founder plan) — once D3 (list vs Founder price) is decided in the business roadmap.
- Testimonials / case study — only with real, consented quotes (business milestone: 2 testimonials).
- FAQ expansion: data protection (RGPD, health data handled by the professional), AI Act transparency.
- Content/blog for SEO (ES), LinkedIn post landing variants.
- Leads admin view or export (today: read from the DB console).
- Dark sections / dark mode — only if UX/UI proves it helps the narrative without breaking app coherence.

> Every new feature is created as `features/NNN-feature-slug/` with `spec.md`, `plan.md`, and `tasks.md` **before** touching application code.
