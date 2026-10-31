# 001 · Landing v1 + demo request — QA report

_Owner: `@nyamia-web-qa`. Date: 2026-10-30. Everything was run from scratch on the local machine (WSL2, Chromium 1243 from Playwright). `.env` was not read. The product's Postgres (5432) was not touched; the API used its own container on 5433._

## 1 · Suite results (final run, after the Cybersecurity and UX passes)

| Command | Result |
|---------|--------|
| `pnpm lint` (ESLint + Prettier) | clean |
| `pnpm test` (Vitest) | **89 passed** (5 files) |
| `pnpm build` (`astro check` + build + `csp.mjs --check`) | 0 errors / 0 warnings / 0 hints, 7 pages, `csp: ok (2 hashes, 2 inline <style>)` |
| `pnpm test:e2e` (Playwright, desktop 1440 + mobile 390) | **62 passed, 9 skipped** (the skipped ones are the opt-in screenshot specs). Before QA: 32 passed / 9 skipped. |
| `SHOTS_DIR=… pnpm test:e2e` | **71 passed** (screenshots included) |
| `make api-lint` (Ruff) + `ruff format --check` | clean, 50 files formatted |
| `make api-test` (pytest, Postgres on 5433 up) | **94 passed** |

### New tests: `apps/web/e2e/qa-gaps.spec.ts` (30 test runs across both projects)
- **JS disabled** (`javaScriptEnabled: false`), `/` and `/en/`: the h1 and every h2 are visible; story step titles, feature items and FAQ `<details>` work natively; there are 0 `[data-reveal]`/`.trick-pop` elements with opacity < 1; the noscript notice holds the exact `demo.form.noScript` copy and has a rendered height; the form labels are server-rendered and submit is disabled. The four legal pages (`/privacidad/`, `/en/privacy/`, `/aviso-legal/`, `/en/legal/`) have a visible h1 and h2.
- **413**: shows the `errors.tooLarge` banner (`role=alert`) with no retry button. Values are kept and submit is enabled again.
- **500 / 502 / 503**: shows the `errors.server` banner, then Retry, then a 202, then inline success. Exactly 2 requests.
- **Network failure** (`route.abort`): shows the `errors.network` banner with Retry.
- **Keyboard only**: Tab from `<body>` to name, email, role (Space), consent (Space) and submit (Enter), then success with the heading focused. The payload matches the contract. On every Tab stop inside the form the test checks that the outline or box-shadow differs between the focused and unfocused state (for the sr-only radios, on their `<label>`).
- **390 px** on `/`, `/en/` and the four legal pages: after a full scroll, `scrollWidth ≤ innerWidth`, and no element extends past the right edge, apart from decorative layers clipped by an `overflow: hidden/clip` ancestor.

### Failures met and how they were resolved (failure protocol)
1. `qa-gaps` "JS disabled" › `getByText(noScript).toBeVisible()`: element not found. **Cause: the test.** Chromium did parse `<noscript>` as DOM (`(scripting: enabled)` is false and the `<p>` child is present), but Playwright's text engine skips `<noscript>` content. **Fix:** the test reads the `<noscript> p` text and height through the DOM. The assertion is no weaker.
2. `qa-gaps` 390 px › "elements past the right edge" reported `DIV.pointer-events-none absolute -top-24 …`. **Cause: the test.** It is a decorative glow that its section clips. The page's `scrollWidth` overflow was 0. **Fix:** elements clipped by an overflow-hidden/clip ancestor are excluded. The page-level overflow assertion is unchanged.
3. `screenshots.spec.ts` › `screenshot es/en 1440 @mobile`: timed out at 30 s (took 39 s) only when run in parallel with the full suite; alone it takes 15 s. **Cause: the test.** A full-page 1440 shot under the high-DPR Pixel 7 project is slow. **Fix:** `test.describe.configure({ timeout: 120_000 })` in that visual-aid spec. It has no assertions.

**No implementation code was changed by QA.**

## 2 · True end-to-end check (outside the suite)

Steps: `make api-db-migrate` (already at head), `make api-dev` (:8020) and `pnpm dev` (:4321, Vite proxy `/api` → 8020). `GET /api/v1/health` returned `{"status":"ok"}`, both directly and through the proxy. Playwright filled the real form with fictitious data (`qa-e2e-<ts>@example.com`).

| Check | Result |
|-------|--------|
| Response | **202** `application/json`, inline success shown |
| Postgres `demo_request` | 0 rows before, **1** after (count only) |
| Second submit, same email | **202**, still 1 row (24 h duplicate rule holds end to end) |
| API log | `outcome=accepted id=<uuid>`; 0 occurrences of the email or name |
| Cleanup | the row was deleted (`DELETE 1`, table back to 0); API, dev server and preview stopped; ports 4321/4329/4330/8020 free |

Note: in dev, `make api-dev` prints uvicorn access lines (they carry the peer IP, no PII). Production uses `--no-access-log` (see `security-review.md`).

## 3 · Acceptance matrix (spec.md)

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | All sections in ES/EN, copy only from i18n, same keys | **Verified** | `src/i18n/parity.test.ts`; e2e `smoke` › `landing es/en › renders every section from i18n` |
| 2 | Animated mockups use tokens only; reduced motion shows final states | **Verified** | `colour-guard.test.ts`; e2e `motion.spec.ts` (hero, stage steps 3/4 with `timeout: 250`, mobile frames) |
| 3 | Readable with JS disabled | **Verified** | `qa-gaps` › `JavaScript disabled` (6 tests × 2 projects) |
| 4 | Client validation, contract payload, success and error states, no double submit | **Verified** | Vitest `DemoForm.test.tsx`, `validation.test.ts`; e2e `form.spec.ts` (202 single request, 422, 429, empty submit) and `qa-gaps` (413, 500/502/503 with retry, network, keyboard-only); plus the real 202 run in § 2 |
| 5 | API validation, rate limits, honeypot, no PII in logs | **Verified** | `make api-test` 94 passed (incl. `test_no_pii_in_logs`, `test_ipv6_clients_share_a_limit_per_64`, Postgres repository tests); § 2 log check |
| 6 | No third-party requests, no cookies | **Verified** | e2e `privacy-a11y` › `no third-party requests and no cookies on / and /en/`; `form` 202 test (no cookies, no storage); Lighthouse found no third-party requests |
| 7 | Security headers in `vercel.json` | **Verified (config)** / **Partially (served)** | `vercel.json` has CSP (`script-src 'self'` + 2 hashes, no `unsafe-inline` for scripts), HSTS preload, nosniff, `frame-ancestors 'none'` + XFO DENY, Referrer-Policy, Permissions-Policy, COOP; `csp.mjs --check` runs in the build. `astro preview` does not apply `vercel.json`, so the headers as actually served still need checking on a Vercel preview (also W-M1 in `security-review.md`) |
| 8 | SEO: title/description, canonical, hreflang, OG, sitemap, robots, JSON-LD | **Verified** | e2e `smoke` › `SEO: …` (both locales) and `legal pages, 404, robots and sitemap`; Lighthouse SEO 100 |
| 9 | axe: no serious/critical on `/`, `/en/` and the privacy pages | **Verified** | e2e `privacy-a11y` › `axe: …` on 4 URLs (wcag2a/aa, 21a/aa, 22aa); Lighthouse a11y 100 |
| 10 | Budgets on the production build | **Verified** | § 4 |
| 11 | No health claims, unbuilt features, fake social proof or team | **Verified (document review)** | Business claims checklist in `copy-review.md` § 5 and features vs product roadmap in § 4; e2e asserts JSON-LD has no `aggregateRating`/`review`/`offers`. QA did not re-audit the copy against `../NutriBot` |

## 4 · Budgets

**JS (gzip -9, every script reachable from the page: `<script src>`, island component/renderer URLs, their static imports, inline scripts; no dynamic imports exist):**

| Page | JS gzip | vs 120 KB |
|------|---------|-----------|
| `/`, `/en/` (worst case: both islands hydrated) | **116.6 KB** (react-dom client 64.2, StoryStage + motion 38.2, DemoForm 6.1, react 3.2, appUi 2.2, inline 2.0, layout 0.8) | pass, **3.4 KB headroom** |
| `/`, `/en/`, true first load (both islands are `client:visible`, below the fold) | ≈ 2.8 KB (layout script + inline) | pass |
| legal pages, 404 | 0.8 KB | pass |

HTML: 24.9 KB gzip (es) and 24.3 KB (en). CSS: 10.9 KB gzip.

**Lighthouse 13.6.0** (`pnpm dlx lighthouse`, headless Chromium 1243, mobile form factor, default simulated throttling, against `astro preview` on :4330):

| Page | Perf | A11y | Best practices | SEO | LCP | CLS | TBT | FCP |
|------|------|------|----------------|-----|-----|-----|-----|-----|
| `/` | 100 | 100 | 100 | 100 | 0.9 s | 0 | 0 ms | 0.9 s |
| `/en/` | 100 | 100 | 100 | 100 | 0.9 s | 0 | 0 ms | 0.9 s |

Budgets: Perf ≥ 90, others ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.05. All pass. Caveat: this was localhost with no CDN and no `vercel.json` headers. Re-run it on the Vercel preview (003).

## 5 · Visual check

Full-page screenshots at reduced motion, generated by `screenshots.spec.ts` into `apps/web/test-results/qa-shots/` (git-ignored, so regenerate with `SHOTS_DIR=<abs path> pnpm test:e2e e2e/screenshots.spec.ts`): `es-390.png`, `es-1440.png`, `en-390.png`, `en-1440.png`, `stage-step-0…5.png`. QA did not review them visually; that is part of the UX pass in `ux-review.md`.

## 6 · Residual risks

1. **JS headroom of 3.4 KB** on the landing (worst case). Any new island or dependency (for example Lenis) breaks the 120 KB budget. Recommendation: add a size check to CI (the script used here can become `scripts/js-budget.mjs`).
2. **Headers and CSP as served are untested.** Preview does not apply `vercel.json`. Check them on the Vercel preview with `curl -I`, together with the `/api/*` rewrite (W-M1) and the real XFF chain (H1).
3. **Lighthouse ran on localhost.** Real 4G latency and CDN effects are not covered, so repeat on the preview.
4. **Rate limits end to end:** covered by API tests only. The proxy-chain IP behaviour (H1) and the IPv6 /64 rule can only be confirmed on staging.
5. **No-JS users cannot submit the form** (by design; the noscript notice tells them). Accepted by spec.
6. **Copy claims** (criterion 11) rest on the Business review. Re-check them whenever `copy-review.md` § 6 open questions are answered (founder URL, `[PENDIENTE]` legal identity).
7. **Browsers:** only Chromium was run (desktop + Pixel 7 emulation). Safari/iOS (scroll-driven motion, `has()` selectors on the radio cards) is untested.
8. The 12-month retention deletion job (M3) does not exist yet, so nothing tests it.
