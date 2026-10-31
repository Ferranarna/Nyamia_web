# 001 · Landing v1 + demo request — Security review (API + privacy copy)

_Owner: `@nyamia-web-cybersecurity`. Date: 2026-10-30. Scope of this pass: `apps/api` (code, Alembic revision, Dockerfile, `railway.json`, `docker-compose.yml`, `.env.example`, README, tests) and the privacy notice / legal copy in `apps/web/src/i18n/{es,en}.ts`. The rest of `apps/web` (headers in `vercel.json`, CSP, form island, third-party requests) is **not reviewed yet**: it gets a separate pass once Frontend is done. `.env` was not read._

Not legal advice: the RGPD / LSSI-CE notes check the copy against what the code actually does; the founder's lawyer signs off the final texts.

## Verdict

**API: ship with mitigations.** The code is fit for the v1 build and a staging deploy. Go-live (roadmap 003) is **blocked** until the items in § Go-live blockers are done. The main one is H1: the Vercel → Railway chain has to be measured and the Railway origin has to be protected.

## What was checked and holds

| Control | Evidence |
|---------|----------|
| Strict edge validation | `DemoRequestIn` uses `extra="forbid"`, `StrictStr`/`StrictBool`, enums, length limits and syntax-only email checks (no DNS). The domain entity checks the same rules again. |
| No value echo / no oracles in errors | 422 returns field names only (unknown keys are echoed only if they look like identifiers, else `unknown_field`). 413/429/500 bodies are generic. Honeypot and duplicate both return the same 202. The per-email 429 can't be reached: the duplicate window (24 h) equals the email window, so there is at most 1 stored lead per email per 24 h, which means no enumeration through 429. |
| No PII in logs | Logs carry the request id, the outcome, the server UUID and field names. Unhandled errors log the class name only and are not re-raised. Uvicorn runs with `--no-access-log`. SQLAlchemy has `hide_parameters=True` and `echo=False`. A test covers this (`test_no_pii_in_logs`). |
| Body-size DoS | ASGI guard checks `Content-Length` and also counts streamed or chunked bodies (stops reading at 8 KB + 1). Tests cover it. |
| SQL injection | ORM / Core expressions only. No raw SQL built from input. |
| CORS / cross-site abuse | No CORS middleware: `OPTIONS` returns 405 with no `Access-Control-*` headers. Verified: `text/plain`, form-urlencoded and missing `Content-Type` all get 422. A third-party page therefore cannot use visitors' browsers to submit spam leads through "simple" cross-origin requests (those would spread the requests over many IPs). |
| Response headers | `nosniff`, `no-store`, `no-referrer`, `X-Frame-Options: DENY`, CORP `same-origin`, CSP `default-src 'none'`, and a server-generated `X-Request-ID` (the client's value is never trusted). |
| Session / unit of work | One engine per process. The session is request-scoped with `scope="function"`, so the commit happens before the 202. Rollback on error. Pool is 5 + 5. |
| Secrets | `SecretStr` for `DATABASE_URL` and `IP_HASH_SECRET`. Production refuses to start with a missing, short or `change-me` secret (fail-closed; correct). `.env` is git-ignored and docker-ignored, and is not tracked. `.env.example` holds placeholders only. Compose binds Postgres to `127.0.0.1:5433`. |
| Docs surface | `/docs` and `/openapi.json` are off when `ENVIRONMENT=production`, which is the image default. Verified on a built container: `/docs` returns 404. |
| Supply chain | `uv.lock` is present. The image uses `uv sync --frozen --no-dev`. The uv binary is pinned (`0.9.26`). Tests and README are excluded from the image. |
| Container | Multi-stage build, slim base, non-root uid 10001, `--no-proxy-headers` (the app parses XFF itself with the rightmost-N rule; correct). |
| Migration | One additive `create_table` plus two composite indexes. A `CHECK (consent)` constraint backs the consent invariant. Pre-deploy runs `upgrade head` only. |

## Findings

### Critical
None.

### High

**H1 · Proxy chain: forgeable client IP via the direct Railway origin; hop count not measured** *(go-live blocker)*
- **Asset:** per-IP rate limit, which is the only real throttle on stored leads; integrity of the lead table; DB storage.
- **Threat:** the Railway public domain (`*.up.railway.app` or a custom one) can be reached directly, without going through Vercel. With `TRUSTED_PROXY_HOP_COUNT = N ≥ 2`, a direct caller sends `X-Forwarded-For: <random>`, Railway's edge appends the caller's real IP, and the app takes `hops[-N]`, which is the forged value. The caller gets a fresh rate-limit bucket on every request, so it can store unlimited junk leads: real-looking names and emails that pollute the founder's lead list and fill the DB. The direct origin also skips Vercel's edge, which buffers requests and protects against volumetric traffic, so slow-body requests reach uvicorn as well. Separately, if Railway **replaces** XFF instead of appending to it, every lead resolves to Vercel's egress IP. That makes 5 leads per hour site-wide, a self-inflicted DoS.
- **Mitigation (003):**
  1. Measure the real chain. Deploy a temporary build that logs the **count** of XFF entries (not their values) and compare it with a known client IP. Then set `TRUSTED_PROXY_HOP_COUNT` and add the result to the README.
  2. Protect the origin. Have Vercel add a secret header on the `/api/*` path to Railway (Vercel Routing Middleware or a rewrite header, whichever Vercel supports for external rewrites; verify). The API rejects requests without it with a generic 404 (new setting, e.g. `ORIGIN_SHARED_SECRET`, compared with `hmac.compare_digest`). If Vercel cannot inject headers, the fallback is a **global** cap on stored leads per hour as a circuit breaker. That is a contract and Business decision: legitimate leads would get a 429 during an attack.
- **Residual risk:** low after 1 and 2. Without 2, it is medium: the attack costs an attacker one script, and the damage is junk leads and storage, not a data leak.

### Medium

**M1 · IPv6 rotation escaped the per-IP limit** — **fixed**
- **Asset:** per-IP rate limit. **Threat:** the limit keyed on the full /128. One IPv6 subscriber controls at least a /64 (2⁶⁴ addresses), so changing the source address each request gave a fresh bucket each time. **Mitigation:** `rate_limit_key()` hashes the /64 network for IPv6, and IPv4-mapped IPv6 is normalised to IPv4. Tests cover this (`test_ipv6_clients_share_a_limit_per_64`, `test_client_ip.py`). **Residual:** low. A /48 holder can still rotate /64s; accepted (5 leads/h per /64 is a small amount of junk).

**M2 · Unthrottled DB work on non-stored paths** — accept for v1, mitigate at 003
- **Asset:** API availability (pool of 10 connections, 30 s pool timeout). **Threat:** rate limits count *stored* leads only, so duplicates (3 indexed SELECTs each) and `GET /health` (1 connection each) are never throttled. A flood of concurrent duplicates or health checks fills the pool, and genuine leads then get 500s after waiting. Honeypot and malformed requests never touch the DB, which is good. **Mitigation:** at 003, enable a Vercel Firewall rate-limit rule on `/api/*` (plan permitting). Combined with H1.2, all traffic then goes through it. Backlog: an in-process per-IP attempt limiter in front of the handler, and a lower `pool_timeout` (≈ 5 s) so the API fails fast. **Residual:** low once H1 is closed. The impact is a temporarily unavailable form, with no data exposure.

**M3 · Retention promise not enforced** *(must be scheduled at 003)*
- **Asset:** lawfulness of the notice ("12 meses … después se eliminan", art. 5.1.e). **Threat:** no deletion job exists, so the notice becomes false from the first lead's 12-month anniversary. Database backups (`pg_dump` routine planned in 003) keep data beyond that unless they are rotated. **Mitigation:** before go-live, record a dated backlog item with a due date before the first lead reaches 12 months. The item covers a deletion job (or at minimum a documented monthly `DELETE … WHERE created_at < now() - interval '12 months'` run) and backup rotation of ≤ 12 months plus the backup window. Data minimisation (recommended): null `ip_hash` and `user_agent` after about 30 days. They are only needed for the 1 h and 24 h windows and for short-term abuse forensics. If adopted, the notice must say so. **Residual:** low once scheduled.

**M4 · Privacy notice accuracy (art. 13)** — wording **fixed**; processors and transfers remain **[PENDIENTE] (go-live blocker)**
- "huella **cifrada**" was inaccurate: an HMAC is a keyed, one-way pseudonymisation, not encryption. It is still personal data, and anyone holding the key can brute-force the IPv4 space. The user-agent was stored but had no stated purpose. Both are fixed (see § Changes). The legitimate-interest basis (art. 6.1.f) that Business added is **correct and needed**: abuse protection is not covered by the consent purpose. The interest is stated ("mantener el servicio seguro", art. 13.1.d), and "oposición" is listed among the rights (art. 21). OK.
- The notice matches what the API stores: the form fields, locale, `consent_at`/consent date, `privacy_version`, the IP code, the user-agent (≤ 200), and `created_at`. The honeypot is not stored, and neither is the raw IP. "Datos obligatorios" matches the required fields.
- Still open, and blocking for 003: controller identity and contact, and the processors (Vercel, Railway) with their regions and transfer safeguards. Both are US-headquartered, so the sentence "No se hacen otras transferencias internacionales" must be checked against the DPF/SCC status once the processors are named. The hosting providers' own request logs **do** process the raw IP. "La dirección IP como tal no se guarda con tu solicitud" is now precise about that. The processors paragraph should mention the providers' technical logs when it is completed.

### Low

| # | Finding | Decision |
|---|---------|----------|
| L1 | NUL in `name`/`message`/`practice_name` passed validation, and Postgres rejects it (verified: `DBAPIError`), giving a 500. C0/C1 controls and bidi override characters could be stored and display misleadingly in the DB console, a future CSV export or the 004 email. | **Fixed**: the domain and the edge reject Unicode `Cc` (newline, CR and tab allowed in `message`) and bidi controls. The user-agent is stripped of them before truncation. |
| L2 | Code and venv were owned by the runtime user (`--chown=app`), so a compromised process could rewrite its own code. The `server: uvicorn` header was sent. | **Fixed**: root-owned, read-only for uid 10001 (verified: `touch` gets permission denied). `--no-server-header` added (verified). |
| L3 | (Backend 2) Limits count stored leads, and the email limit is effectively unreachable. | **Accept.** It is unreachable *because* duplicate window = email window, and that equality is what prevents a 429-by-email enumeration oracle. **Keep `duplicate_window >= per_email_window`** if the policy is ever tuned. Attempt-level throttling: see M2. |
| L4 | (Backend 3) Concurrent requests can slightly exceed a limit or store a same-email duplicate. | **Accept.** It is bounded by concurrency, and the impact is one or two extra rows. |
| L5 | (Backend 4) Validation runs before the honeypot, so a bot that fills the honeypot with malformed fields gets 422. | **Accept.** It reveals nothing about the honeypot, because a well-formed honeypot hit gets the same 202 as a real lead, and it saves no DB work. |
| L6 | Timing difference between the duplicate path (no INSERT) and the accepted path could reveal "this email requested in the last 24 h". | **Accept.** Low-value information, noisy over the network. |
| L7 | Base images are pinned by tag, not digest. No dependency audit in CI. `pyproject` uses `>=` ranges (the lock pins them). | **Backlog:** Dependabot/Renovate for `uv.lock` and the Dockerfile, plus `uvx pip-audit` in CI. |
| L8 | `downgrade()` drops `demo_request`, losing all leads. | **Accept.** Never run a downgrade in production. Pre-deploy is `upgrade head` only. |
| L9 | If the peer address is missing, all such requests share the `unknown` bucket. | **Accept.** Doesn't happen behind a proxy. |
| L10 | (Backend 6) Production refuses to start without `IP_HASH_SECRET` ≥ 32 characters. | **Accept as designed** (fail-closed). Set it in Railway variables only. Rotating it simply resets the rate-limit buckets. |
| L11 | Consent covers "contactarte sobre Nyamia (acceso a la beta y condiciones)" together with replying to the request. | **Accept for v1:** the scope is narrow and directly linked to the request. Any newsletter or promotional email needs a **separate, unticked** opt-in (LSSI-CE art. 21) and an unsubscribe link in every message (art. 22). Applies to 004 and later. |

## Backend residual risks: decisions

| # | Risk | Decision |
|---|------|----------|
| 1 | Hop count unmeasured; Railway reachable directly | **Fix at 003, go-live blocker** (H1) |
| 2 | Limits count stored leads; honeypot/duplicate never throttled; email limit rarely reached | **Accept + edge rate limit at 003** (M2, L3) |
| 3 | Concurrency can slightly exceed limits | **Accept** (L4) |
| 4 | Validation before honeypot → 422 for bots | **Accept** (L5) |
| 5 | 12-month deletion not built | **Backlog with due date, scheduled at 003** (M3) |
| 6 | Production refuses to start without strong `IP_HASH_SECRET` | **Accept**, correct behaviour (L10) |
| — | `--no-proxy-headers`, `--no-access-log`, own XFF parsing | **Correct.** Kept; `--no-server-header` added. |

## Changes made in this pass

`apps/api`:
- `src/domain/models/demo_request.py`: new `has_forbidden_characters()` (Unicode `Cc` and bidi controls; newline, CR and tab allowed when `multiline`). Applied to `name`, `email`, `practice_name` and `message`. The user-agent is sanitised before truncation.
- `src/infrastructure/api/schemas.py`: the same check at the edge (`_single_line` for name, practice name and privacy version; `_multiline` for message).
- `src/infrastructure/security/client_ip.py`: new `rate_limit_key()` (IPv6 → /64, IPv4-mapped → IPv4).
- `src/infrastructure/api/dependencies.py`: hashes `rate_limit_key(ip)`.
- `Dockerfile`: runtime `COPY` without `--chown` (root-owned code); `--no-server-header`.
- `README.md`: deploy and privacy notes updated to match.
- Tests: `tests/domain/test_demo_request.py` (+8 cases), `tests/infrastructure/api/test_demo_requests_router.py` (+4 cases), new `tests/infrastructure/test_client_ip.py`.
- Result: `uv run ruff check src tests` clean, `ruff format --check` clean, `uv run pytest` **94 passed** (local Postgres up; repository tests ran). The Docker image was built and run in production mode: non-root, read-only code, no server header, `/docs` 404, no access log.

`apps/web/src/i18n` (same keys, minimal edits; `privacy.version` unchanged because no lead has been collected under the old wording):
- `es.ts` `privacy.sections[1].paragraphs[1]`: "huella cifrada (hash) … no permite leer la dirección directamente" → "un código seudónimo calculado a partir de tu dirección IP con una clave secreta (hash), que no permite conocer la dirección sin esa clave, … La dirección IP como tal no se guarda con tu solicitud."
- `es.ts` `privacy.sections[2].paragraphs[1]`: purpose now covers the user-agent too: "Ese código de la IP y el identificador del navegador se usan solo para limitar el número de envíos y evitar abusos."
- `en.ts`: the same two paragraphs ("pseudonymous code derived from your IP address with a secret key (a keyed hash, which does not reveal the address without that key) … The IP address itself is not stored with your request." / "The IP code and the browser identifier are used only to …").

## Go-live blockers (roadmap 003)

1. **H1**: measure the Vercel → Railway XFF chain and set `TRUSTED_PROXY_HOP_COUNT`. Protect the origin with a shared-secret header, or with a global circuit breaker if Business accepts it.
2. **M2**: Vercel Firewall rate-limit rule on `/api/*` (or the in-process attempt limiter).
3. **M3**: dated deletion job / procedure and backup rotation of ≤ 12 months recorded before launch.
4. **M4 / legal**: controller identity and contact (privacy + legal notice), processors with regions and transfer safeguards, mention of hosting technical logs. All `[PENDIENTE]` resolved.
5. Railway variables: `ENVIRONMENT=production`, `IP_HASH_SECRET` (≥ 32 random characters), `DATABASE_URL` over Railway private networking (or TLS if it goes over the public proxy). Nothing in the repo.
6. Web-side security review (headers/CSP in `vercel.json`, form island, no third-party requests). Pending; not covered here.

## Abuse tests proposed to QA

- Direct-origin spoof (after H1.2): request to the Railway domain without the secret header → 404. Through Vercel with a forged `X-Forwarded-For` → the same bucket as the real IP (6th lead → 429).
- Six leads from addresses in the same IPv6 /64 → 6th returns 429 (unit test exists; repeat end to end on staging if IPv6 is available).
- `name` containing `\u0000` or `‮` → 422 `["name"]`, never 500.
- Cross-origin `fetch(…, {mode:'no-cors', body: JSON, headers: text/plain})` from another origin → 422, nothing stored.
- 9 KB chunked body without `Content-Length` → 413.
- Production container: `/docs` → 404; no `server` header; no access-log lines; logs contain no email or IP after a full submission.

---

# Web-side review (`apps/web`) + overall verdict

_Owner: `@nyamia-web-cybersecurity`. Date: 2026-10-30. Scope: `apps/web/vercel.json`, `scripts/csp.mjs`, `scripts/brand-assets.mjs`, `astro.config.mjs`, the built output in `apps/web/dist` (rebuilt by QA in parallel; checked after it finished), the demo form island (`DemoForm.tsx`, `submit.ts`, `validation.ts`, `lib/privacy.ts`), i18n injection points, links, sitemap/robots, the supply chain (`package.json`, `pnpm-lock.yaml`, pnpm build-script policy) and repo hygiene. `.env` was not read. No files in `apps/web` were changed in this pass (see § Changes)._

## Verdict

- **Web: ship with mitigations.** Headers and CSP are strict, the built site makes no third-party requests, sets no cookies and ships no source maps, and the form is clean. One Medium (W-M1) has to be verified on a Vercel preview before go-live. It can break lead intake and expose the Railway origin.
- **Feature 001 overall (web + api): ship with mitigations.** Fit for the v1 build and a staging/preview deploy. **Go-live (roadmap 003) is blocked** until the combined list in § Go-live items (003) below is closed.

## What was checked and holds

| Control | Evidence |
|---------|----------|
| CSP, scripts | `script-src 'self'` plus 2 SHA-256 hashes, with no `'unsafe-inline'` and no `'unsafe-eval'`. The two inline scripts are Astro's island runtime and the `client:visible` directive. `scripts/csp.mjs --check` is part of `pnpm build` (and so of Vercel's `buildCommand`). It fails the build when an inline script's hash is not allowed, and it refuses `'unsafe-inline'` in `script-src`. This is fail-closed: an Astro upgrade that changes the runtime breaks the build, not the page. Run on the fresh `dist`: `ok (2 hashes, 2 inline <style>)`. JSON-LD (`type="application/ld+json"`) is correctly excluded because it is not executed. `assetsInlineLimit: 0` and `inlineStylesheets: 'never'` keep everything else external. |
| CSP, other directives | `default-src 'self'`, `connect-src 'self'` (the form only posts same-origin), `font-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`. |
| `style-src 'unsafe-inline'` (justified) | Required by Astro's `<style>astro-island,…{display:contents}</style>` and by around 190 `style="--d:…;--stagger:…"` attributes in the SSR HTML. These are custom properties that drive motion. Attributes cannot be hashed without `'unsafe-hashes'` and a hash per value, which would be brittle. CSSOM writes from `motion` are not governed by `style-src` anyway. CSS injection would first need HTML injection, which the code does not allow (see the injection row). Accepted. |
| Clickjacking / isolation | `frame-ancestors 'none'` + `X-Frame-Options: DENY` + `COOP: same-origin`. |
| Transport | HSTS `max-age=63072000; includeSubDomains; preload`. See W-L3 before submitting to the preload list. |
| Other headers | `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (app.nyamia.com receives only the origin), Permissions-Policy denies camera, microphone, geolocation, payment and USB. |
| Caching | `/_astro/*` (content-hashed) is `immutable` for 1 year. `/api/*` is `no-store`. HTML uses Vercel's default revalidation. Nothing personal is ever cacheable. |
| Third parties | In the built HTML/CSS/JS the only absolute origins are `nyamia.com` and `app.nyamia.com` (links), plus inert strings: XML/SVG namespaces, `schema.org` in JSON-LD, React's `react.dev/errors` message URLs (never fetched), and `example.com` as mockup text. Fonts are self-hosted and preloaded from `/_astro`. The e2e test `privacy-a11y.spec.ts` asserts no third-party requests and no cookies on every page, and `form.spec.ts` asserts no cookies after submitting. |
| Source maps / internal URLs | No `.map` files and no `sourceMappingURL` in `dist`. No `localhost`, `8020`, `railway` or placeholder host in `dist`. The dev proxy lives only in `vite.server`. |
| Injection (XSS) | The only `set:html` is JSON-LD built from `JSON.stringify` of trusted copy. No `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`/`new Function`. `{privacyLink}` is handled by `splitAround()`, which renders text nodes around a React `<a>`, never HTML. `[PENDIENTE]` markers in `LegalPage` are split into text nodes. Island props are serialised copy only. API error text is never rendered: the 422 response maps `fields[]` names through `API_FIELD_MAP` to local copy, and unknown names fall back to the generic message. |
| JSON-LD content | `SoftwareApplication` with name, url, description, category, OS, language and image. No ratings, offers, reviews or authors, so no fake social proof. |
| Form island: privacy | No `localStorage`/`sessionStorage`/cookies/IndexedDB. No `console.*`. Same-origin `fetch` with `credentials: 'same-origin'` and `cache: 'no-store'`, JSON body (POST, never in the URL). The JS submit path calls `preventDefault()`. The SSR submit button is `disabled` until hydration, so no native GET submission puts PII in the URL (see W-L1 for the defence in depth). |
| Form island: robustness | An in-flight ref plus `disabled`/`readOnly` stop double submission. Network errors and non-JSON 422 bodies are caught. `Retry-After` parsing is bounded. Every status maps to localised copy. Success is shown inline, with no redirect and no query string. |
| Honeypot | `website` sits inside an `aria-hidden` off-screen wrapper with `tabindex=-1` and `autocomplete=off`. Its label says "Deja este campo vacío", so it is safe even if assistive tech reaches it. It is sent as `""` and the API returns 202 without storing anything when it is filled. |
| Consent | An unticked checkbox is required. The link to the privacy notice opens same-origin in a new tab (`rel="noopener"`). `privacy_version` is `2026-10-30` in `lib/privacy.ts`, in both i18n files (`privacy.version`) and as the API `Settings.PRIVACY_VERSION` default, and `parity.test.ts` checks this. |
| Links | `app.nyamia.com` links are same-tab (no opener exposure). The founder link (not yet live) has `rel="noopener noreferrer"`. |
| Sitemap / robots | The sitemap lists only the 6 public pages (404 excluded, `noindex` on 404). `robots.txt` allows all and exposes nothing internal. |
| Supply chain | `pnpm-lock.yaml` (v9) is present. `packageManager: pnpm@11.21.0` is pinned. All packages come from `registry.npmjs.org`, with no git or tarball dependencies. pnpm ≥ 10 blocks dependency build scripts by default, and none are allow-listed (`pendingBuilds: []`), so no `postinstall` script runs. `pnpm audit --prod` reported no known vulnerabilities (2026-10-30). `scripts/brand-assets.mjs` is a manual dev script: local `sharp` + Playwright with every non-`data:`/`about:` request aborted, using only committed copy and tokens. |
| Repo hygiene | `.gitignore` covers `.env` and `.env.*` (keeping `!.env.example`), `*.pem`, `*.key`, `node_modules/`, `dist/`, `.astro/`, `.vercel/`, `test-results/`, `playwright-report/`, `coverage/`, `.venv/` and the Python caches (verified with `git check-ignore`). The untracked tree contains no `.env`, key or pem files. A grep for key-shaped strings (cloud/API tokens, private keys, credentialed DSNs, JWTs) found only test placeholders (`user:pw@127.0.0.1:1`, `u:p@h`) and the documented local-only DSN in `.env.example`. |

## Findings

### Critical / High
None on the web side. (API H1 still stands; see the first section.)

### Medium

**W-M1 · `trailingSlash: true` + FastAPI `redirect_slashes` can break the form and leak the Railway origin** *(verify on a Vercel preview, go-live blocker)*
- **Asset:** lead intake (the site's only business goal), confidentiality of the Railway origin hostname (which is what H1 is about), and lead PII in transit.
- **Threat:** Vercel documents that with `trailingSlash: true`, any path without a file extension gets a **308** to the slashed path. That covers `/api/v1/demo-requests` → `/api/v1/demo-requests/`. If the rewrite then forwards the slash, the API's default `redirect_slashes` answers **307 `Location: http://<railway-host>/api/v1/demo-requests`**. This was reproduced locally against `create_app()`, and the scheme is `http` because of `--no-proxy-headers`. In the browser, CSP `connect-src 'self'` blocks the cross-origin redirect, so the payload does not leave the site (good), but every submission ends in the "network" error and is lost. The `Location` header also hands the direct origin to anyone who runs `curl`, which makes H1 easier to exploit. `astro preview` and Playwright cannot see this because both run without Vercel routing.
- **Mitigation:** on the first preview deploy, run `curl -si -X POST https://<preview>/api/v1/demo-requests -H 'content-type: application/json' -d '{}'`. It **must** return the API's 422 `invalid_request`, not 308/307, and no response may carry a `Location` header that points at Railway. If it fails, pick one fix, in order of preference:
  1. API (Backend): `FastAPI(redirect_slashes=False)` and accept both `""` and `"/"` on the router (never emit a `Location`).
  2. Web (Frontend): replace `rewrites` with an explicit `routes` entry for `/api/(.*)` that runs before the trailing-slash handling.
  3. Web (Frontend + SEO): drop `trailingSlash` and rely on the canonical tags.

  Option 1 is recommended in any case, as hardening.
- **Resolution (2026-10-30, Backend): option 1 implemented in `apps/api`.** `FastAPI(redirect_slashes=False)` in `src/main.py` (and on both routers), so the app never emits a slash redirect. `/api/v1/demo-requests` and `/api/v1/demo-requests/` (and `/api/v1/health` + `/health/`) are two decorators on the same handler; the slashed alias is `include_in_schema=False`, so OpenAPI shows each operation once. New `tests/infrastructure/api/test_trailing_slash.py`: POST to both paths → 202 (and `{}` → 422) with no 3xx and no `Location`; GET health on both → 200; unknown paths (`/api/v1/leads/`, `/api/v1/`, `/docs/`, `//`, …) → JSON 404 `not_found` with no redirect; wrong method → 405 with no redirect; OpenAPI lists only the unslashed paths. `make api-lint` and `make api-test` (113 passed) are green. **Still open (roadmap 003):** run the `curl` check above on the first real Vercel preview to confirm Vercel's own 308 (if any) stays same-origin and that the rewrite reaches the API with either form.
- **Residual:** low after the check passes.

### Low

| # | Finding | Decision |
|---|---------|----------|
| W-L1 | The `<form>` has no `method`, so a native submission would be a GET with the name and email in the URL (and so in Vercel logs and browser history). Today this is unreachable: the submit button is `disabled` in the SSR HTML, which also blocks implicit (Enter) submission, and JS always calls `preventDefault()`. | **Backlog (Frontend):** add `method="post"` as defence in depth. |
| W-L2 | `img-src 'self' data:`: there are no `data:` URLs in the built HTML, CSS or JS. | **Backlog:** drop `data:` (test with e2e + CSP console check on preview). |
| W-L3 | HSTS has `includeSubDomains; preload`. Preloading commits every current and future `*.nyamia.com` host (app, api, mail-related hosts) to HTTPS, and removal from the list takes months. | **Go-live:** confirm every subdomain serves HTTPS and that `www` → apex also sends HSTS before submitting to hstspreload.org. Otherwise keep the header and do not submit yet. |
| W-L4 | Permissions-Policy contains `interest-cohort`, which Chrome no longer recognises. It logs a console error that can cost Lighthouse best-practices points. | **Backlog:** remove `interest-cohort` (`browsing-topics=()` already covers it). |
| W-L5 | JSON-LD is injected with `set:html={JSON.stringify(…)}`. If the copy ever contained `</script>`, the block would end early. The copy is trusted (Business-owned), so this is not exploitable. | **Backlog:** serialise with `.replace(/</g, '\\u003c')`. |
| W-L6 | The CSP is not exercised by e2e (`astro preview` sends no `vercel.json` headers). The hash guard covers scripts but not runtime violations (for example a future `data:` image or a blocked fetch). | **Go-live:** open `/`, `/en/` and the privacy pages on the preview with DevTools and expect zero CSP violations; submit one test lead. |
| W-L7 | The `/api` rewrite points at `API_HOST_PLACEHOLDER`. If deployed as-is, the form fails (DNS error, so a 5xx): an availability problem, not a leak. Preview deployments use the same `vercel.json`, so once it is set they would send test leads to whatever API it names. | **Go-live:** set the real host. Point previews at a staging API or keep previews behind Vercel Deployment Protection, so tests do not pollute the production lead table. |
| W-L8 | No explicit pnpm build-script or release-age policy. The defaults are safe (builds blocked), but the behaviour is implicit. Caret ranges are pinned by the lockfile. | **Backlog:** add `minimumReleaseAge` (for example 1 day) to `pnpm-workspace.yaml`. Dependabot/Renovate plus `pnpm audit --prod` in CI (pairs with API L7). |

## Changes made in this pass

None in code or config. The only Medium (W-M1) needs a decision between an API change and a routing change, and has to be verified on real Vercel routing, so it is recorded as a go-live check rather than patched blind. *Update 2026-10-30:* W-M1 option 1 (API hardening) was then applied by Backend, see the W-M1 resolution; the Vercel preview check remains a go-live item. Because nothing changed, `pnpm lint && pnpm test && pnpm build` was not re-run. QA's parallel run covers the current tree, and `csp.mjs --check` passed on QA's fresh `dist`.

## Web fix round (Frontend, 2026-10-30)

| # | Status | Change |
|---|---|---|
| W-M1 | Not changed in web | Being handled API-side (Backend: `redirect_slashes=False`). `trailingSlash` and the rewrite are untouched. The preview `curl` check stays a go-live item. |
| W-L1 | **Fixed** | `<form method="post" noValidate>`. It is still submitted via `fetch` with `preventDefault()`, so a native fallback can never put PII in a query string. |
| W-L2 | **Fixed** | `img-src 'self'` (`data:` dropped). Verified on a fresh `dist`: no `data:` URL in HTML, CSS or JS (the only `data:` matches are JS object keys). e2e is green. Still confirm zero CSP violations on the preview (W-L6). |
| W-L4 | **Fixed** | `interest-cohort=()` removed from Permissions-Policy (`browsing-topics=()` kept). |
| W-L5 | **Fixed** | JSON-LD serialised as `JSON.stringify(jsonLd).replace(/</g, '\\u003c')`. |
| W-L3, W-L6, W-L7 | Open (go-live) | Unchanged: these are preview or deploy checks. |
| W-L8 | Open (backlog) | Not in scope of this round. |

Inline scripts did not change: `csp.mjs --check` reports ok with the same 2 hashes, so `vercel.json` needed no regeneration.

## Note for H1 (origin protection)

The Vercel docs (`vercel.json` → `routes[].transforms`, `type: "request.headers"`, `op: "set"`, with an `env` allowlist) describe how to add a request header whose value comes from a Vercel environment variable. That is the mechanism H1.2 needs (for example `X-Origin-Auth: $ORIGIN_SHARED_SECRET`). Verify that it applies to an external destination on the first preview. The secret lives only in the Vercel and Railway dashboards.

## Go-live items (roadmap 003): combined web + api

1. **H1:** measure the XFF hop count and set `TRUSTED_PROXY_HOP_COUNT`. Protect the Railway origin with a shared-secret header via `routes[].transforms` (or a global circuit breaker).
2. **W-M1:** POST without a trailing slash on the preview returns the API's 422 with no `Location` header. (`redirect_slashes=False` + slash aliases are already in the API since 2026-10-30.)
3. **M2:** Vercel Firewall rate-limit rule on `/api/*` (or the in-process attempt limiter).
4. **M3:** dated 12-month deletion procedure and backup rotation.
5. **M4 / legal:** every `[PENDIENTE]` resolved (controller identity and contact, processors and regions, transfer safeguards, hosting logs, founder URL). They are currently visible in `dist` on `/privacidad`, `/aviso-legal`, `/en/privacy`, `/en/legal` and the founder block on `/` and `/en/`.
6. **W-L7:** real API host in `vercel.json`. Previews either go to a staging API or are protected.
7. **W-L6:** preview smoke test with zero CSP violations in the console and one end-to-end lead; check the response headers (`curl -sI`) for CSP, HSTS, XFO and COOP.
8. **W-L3:** HSTS preload submission only after confirming that every subdomain is HTTPS.
9. Railway variables (`ENVIRONMENT=production`, `IP_HASH_SECRET`, private `DATABASE_URL`). Nothing in the repo.

## Abuse / verification tests proposed to QA (web)

- On the preview: the trailing-slash POST (W-M1). Also `curl -si https://<preview>/api/v1/health/`, which must not return a `Location` header that points at Railway.
- On the preview: from the DevTools console, `fetch("https://example.org")` must be blocked by `connect-src`, and an element with an inline `onclick` added via DevTools must not run (`script-src` without `unsafe-inline`).
- No-JS run (Playwright `javaScriptEnabled: false`): the form is visible, the submit button is disabled, pressing Enter in the email field navigates nowhere and puts no query string on the URL.
