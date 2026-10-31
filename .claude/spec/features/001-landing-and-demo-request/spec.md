# 001 · Landing v1 + demo request — Spec

## Problem

Nyamia has an MVP in production (`app.nyamia.com`) and a business milestone (N1 · public launch) blocked on a landing page. Nutritionists who hear about Nyamia (LinkedIn, referrals) have nowhere to understand the product and ask to see it.

## Goal

A bilingual landing at `nyamia.com` that makes a dietitian-nutritionist understand in < 60 s what Nyamia does for them, enjoy scrolling through it, and **request a demo**.

Success metric (once analytics exist, backlog): demo requests / unique visitors. For v1: the form works end to end, the page meets the performance/a11y budgets, and the founder approves the copy.

## Users

Primary: D-N in private practice (sports / body composition). Secondary: generalist clinical D-N, small clinics. See `mission.md`.

## Scope

### Pages
- `/` (ES) and `/en/` (EN) — the landing.
- `/privacidad` and `/en/privacy` — privacy notice (lead data only; no cookies).
- `/aviso-legal` and `/en/legal` — legal notice (LSSI-CE) with `[PENDIENTE]` placeholders for the controller's identity.
- `/gracias` is **not** a page: success is shown inline.
- 404 page in brand style.

### Landing sections (order may be refined by UX/UI in `ux.md`)
1. **Header** — logo + "Nyamia", anchors (Cómo funciona · Funciones · Preguntas), language switch, "Entrar" (→ `https://app.nyamia.com`), primary CTA "Solicitar demo" (→ `#demo`). Sticky, condenses on scroll.
2. **Hero** — promise + "La IA propone, los macros se calculan, tú decides." + CTA; animated product window: command bar types a request → a week menu assembles.
3. **Problem** — the manual work (grams, spreadsheets, recalculating every swap), shown visually.
4. **How it works (scrollytelling)** — pinned app window changing with scroll: client ficha with targets → prompt in the command bar → AI picks recipes from the nutritionist's Favoritas → deterministic fit to ±10 % kcal/protein/carbs/fat (days turn from red/orange to green) → the professional adjusts (drag & drop, edit grams, Recalcular) → branded PDF export.
5. **Features** — only shipped capabilities (product roadmap 038–042): client ficha with macro targets, allergens & disliked foods, recipe library (Favoritas) + search + import by link, weekly menu with compliance colours, same grams per recipe within the week, recipe adjusted per client, PDF with the professional's logo, multi-client workspace with prompt history.
6. **Control & trust** — "Tú decides": nothing is final until the professional approves; Nyamia is a planning tool, not a medical device; fictitious data in every illustration; one founder behind the product (link to founder profile `[PENDIENTE URL]`).
7. **Demo request** (`#demo`) — form (see contract) + what happens next.
8. **FAQ** — 5–7 questions (who it's for, what the AI does / doesn't do, data, languages, price status — "beta; pricing shared in the demo", device support).
9. **Footer** — logo, legal links, language, "Entrar", © year.

### Out of scope (v1)
Analytics, cookies, booking calendar, pricing table, blog, testimonials, real-video capture (002), production DNS/deploy execution (003), lead email notification (004).

## Demo-request contract

`POST /api/v1/demo-requests` — same-origin (`nyamia.com/api/*` rewrite → API). JSON, max body 8 KB.

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | required, trimmed 2–100 chars |
| `email` | string | required, valid email, ≤ 254, normalised lowercase |
| `role` | enum | required: `dietitian_private`, `dietitian_clinical`, `clinic`, `coach`, `other` |
| `practice_name` | string \| null | optional, ≤ 120 |
| `client_volume` | enum \| null | optional: `1-15`, `16-40`, `41-80`, `80+` (active clients per month) |
| `message` | string \| null | optional, ≤ 1000, stored as plain text |
| `locale` | enum | required: `es`, `en` |
| `consent` | boolean | required, must be `true` |
| `privacy_version` | string | required, matches the current notice version (e.g. `2026-10-30`) |
| `website` | string | honeypot; must be empty. If filled → respond 202, persist nothing |

Unknown fields → 422.

| Response | Body | When |
|----------|------|------|
| `202` | `{"status":"received"}` | Accepted (also for honeypot hits and duplicate email within 24 h — no enumeration; duplicates are not stored twice) |
| `422` | `{"detail":"invalid_request","fields":["email",...]}` | Validation failure (field names only, no values echoed) |
| `413` | `{"detail":"payload_too_large"}` | Body > 8 KB |
| `429` | `{"detail":"too_many_requests"}` + `Retry-After` | > 5 requests / hour from one client IP, or > 3 / 24 h for one email |
| `500` | `{"detail":"internal_error"}` | Anything else; no stack traces |

`GET /api/v1/health` → `{"status":"ok"}` (+ DB connectivity).

Stored per request: id (UUID v7), the fields above (minus honeypot), `consent_at` (server time), `privacy_version`, `ip_hash` (HMAC-SHA256 of client IP with a server secret — for rate limiting only), `user_agent` truncated to 200 chars, `created_at`. Retention: 12 months, then deleted (documented in the privacy notice; deletion job in backlog).

## Acceptance criteria

1. `/` and `/en/` render all sections with copy from `src/i18n/{es,en}.ts` only; both files have identical keys (test).
2. Hero, scrollytelling and features show app-faithful animated mockups using tokens only; with `prefers-reduced-motion` they render final states without movement (e2e).
3. Content is readable with JS disabled (static HTML for all copy; islands enhance).
4. The form validates client-side, submits to the contract, shows inline success ("Solicitud recibida…") and error states, and disables double submission (unit + e2e with mocked API).
5. API accepts valid requests, rejects invalid ones per the table, enforces rate limits and honeypot, never logs PII (tests).
6. No request to any third-party origin on page load (e2e network assertion). No cookies set.
7. Security headers configured in `vercel.json` (CSP without `unsafe-inline` scripts if Astro allows; HSTS, nosniff, frame-ancestors none, Referrer-Policy, Permissions-Policy).
8. SEO: title/description per locale, canonical, hreflang, OG image, sitemap, robots, JSON-LD.
9. axe: no serious/critical violations on `/`, `/en/`, privacy pages.
10. Budgets from `tech-stack.md` checked on the production build (JS size measured; Lighthouse if available).
11. No claim of health outcomes, unbuilt features, fake social proof or a team (Business claims review in `copy-review.md`).
