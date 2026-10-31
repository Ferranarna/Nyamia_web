# Tech stack and conventions

_How the site is built and the rules all code must respect. No feature `plan.md` should contradict this file._

## Monorepo layout

```
apps/
  web/        Astro static site + React islands (nyamia.com)
  api/        FastAPI service: demo-request intake (served under nyamia.com/api via Vercel rewrite)
packages/
  brand/      logo, loader frames, shared design tokens (tokens.css) — copied from the product, single source for the site
.claude/      agents, skills, spec (constitution + features)
```

- **JS workspace:** pnpm workspaces (`pnpm-workspace.yaml`); root scripts delegate with `pnpm --filter`. No Turborepo/Nx until build times justify it.
- **Python workspace:** `apps/api` is a standalone `uv` project (`pyproject.toml` + `uv.lock`).

## Technologies

### Web (`apps/web`)
- **Framework:** Astro (latest stable), `output: 'static'`. Pages are `.astro`; interactivity only in React 19 islands (`client:visible` preferred over `client:load`).
- **Language:** TypeScript (strict).
- **Styles:** Tailwind CSS v4 via `@tailwindcss/vite`. Tokens imported from `packages/brand/tokens.css` (`@theme`), identical names/values to the product (`brand-*`, `accent-*`, `danger-*`, `surface*`, `border*`, `text*`, radii, shadows).
- **Fonts:** Inter variable, self-hosted (`@fontsource-variable/inter`). No font CDN.
- **Motion:** `motion` (motion.dev) in React islands for scroll-linked and layout animations; CSS transitions/scroll-driven animations for simple reveals. Optional smooth scrolling (Lenis) must be disabled under `prefers-reduced-motion`. Animate `transform`/`opacity` only.
- **i18n:** Astro i18n routing — Spanish at `/`, English at `/en/`. All copy lives in `src/i18n/{es,en}.ts` with an identical key shape (type-checked); no hard-coded copy in components.
- **SEO:** per-page `<title>`/description, canonical, `hreflang` alternates, Open Graph/Twitter image, `@astrojs/sitemap`, `robots.txt`, JSON-LD `SoftwareApplication`.
- **Media:** product visuals are (in order of preference) real app screen recordings (`.webm`/`.mp4`, muted, `playsinline`, poster image), real screenshots (`.webp`/`.avif` via `astro:assets`), or faithful coded mockups of the app UI. All with fictitious data.
- **Tests:** Vitest + Testing Library (islands, i18n parity, form logic); Playwright (`apps/web/e2e/`) for smoke, form submission (API mocked via route interception), reduced-motion, and accessibility (`@axe-core/playwright`).
- **Lint/format:** ESLint (+ `eslint-plugin-astro`), Prettier (+ `prettier-plugin-astro`).
- **Deploy:** Vercel, project root `apps/web`, domain `nyamia.com` (+ `www` → apex redirect). `vercel.json` holds security headers and the `/api/*` rewrite to the API service.

### API (`apps/api`)
- **Language/runtime:** Python ≥ 3.12, FastAPI + Uvicorn, Pydantic v2 + pydantic-settings.
- **Package manager:** uv. **Lint:** Ruff (`E`, `F`, `S`, `I`, `B`). **Tests:** pytest + pytest-asyncio + httpx `AsyncClient`.
- **Architecture:** hexagonal + CQRS-lite, same conventions as the product backend: `domain/` (entities, ports as `Protocol`, exceptions — no FastAPI/SQLAlchemy/vendor imports) → `application/commands/` → `infrastructure/` (api, persistence, notification, config).
- **Persistence:** PostgreSQL via SQLAlchemy 2 async (`asyncpg`); schema only via Alembic (`alembic upgrade head`). Local: `docker compose` Postgres on a port that does **not** clash with the product's dev DB (5433).
- **IDs:** UUID v7.
- **Notifications:** `LeadNotifierPort`; v1 ships a no-op/log-free adapter. A real email adapter (Resend) only after the provider DPA/SPF/DKIM checks the product repo already tracks (029-D).
- **Deploy:** Railway (Dockerfile), own managed Postgres. Public only through the Vercel rewrite `nyamia.com/api/*` → same-origin for the browser, no CORS needed. Pre-deploy command: `alembic upgrade head`.

## Commands

From the repo root:
- `pnpm install` — install JS workspaces
- `pnpm dev` — web dev server (Astro, http://localhost:4321)
- `pnpm build` — web production build (`astro check && astro build`)
- `pnpm test` — web unit tests (Vitest)
- `pnpm test:e2e` — Playwright against the built site (`astro preview`)
- `pnpm lint` — ESLint + Prettier check
- `make api-db-up` / `make api-db-migrate` / `make api-dev` / `make api-test` / `make api-lint` — API tasks (see root `Makefile`)

## Conventions

- **Naming:** English identifiers; Python `snake_case`; React components and Astro components `PascalCase`.
- **Agent chat language:** match the user (default Spanish). Site copy: ES + EN files.
- **Copy:** only in `apps/web/src/i18n/`; Business owns wording; Frontend never invents marketing copy.
- **Sections:** one component per landing section in `apps/web/src/components/sections/`; reusable UI in `components/ui/`; app mockups in `components/mockups/`.
- **Tokens only:** no raw hex/`rgb()`/Tailwind palette colours (`bg-green-500`) in components — enforced by a Vitest guard (same rule as the product).
- **Validation:** demo-request payload validated in the browser (UX only) **and** at the API edge (Pydantic) **and** in the domain entity.
- **New features:** `features/NNN-slug/` with `spec.md`, `plan.md`, `tasks.md` before coding.

## Performance & accessibility budgets

- Lighthouse (mobile) ≥ 90 performance, ≥ 95 accessibility/best-practices/SEO on `/` and `/en/`.
- JS shipped on first load ≤ 120 KB gzip; LCP ≤ 2.5 s on simulated 4G; CLS ≤ 0.05.
- WCAG 2.2 AA: contrast (token pairs as in the product), visible focus, keyboard-operable form, `prefers-reduced-motion` honoured everywhere (content fully readable with motion off).

## Hard limits

- **Never** read, open, cite, or ask for `.env`, secret files, API keys, passwords or connection strings. Document variable **names** only (`DATABASE_URL`, `ALLOWED_ORIGINS`, `TRUSTED_PROXY_HOP_COUNT`, …).
- **Never** commit `.env*` or weaken `.gitignore`.
- **No third-party requests from the browser** in v1 (no analytics, no tag managers, no external fonts/CDNs, no embedded YouTube). Any exception needs a spec with Cybersecurity + Business sign-off and an updated privacy notice.
- **No cookies** in v1. Lead form is the only personal-data surface.
- **Never** log lead PII (name, email, message) in the API; log ids and outcomes only.
- **Never** concatenate user input into SQL; repositories/ORM only.
- **Never** render user-supplied text as HTML.
- **Never** claim health outcomes, clinical/medical use, unbuilt features, fake social proof, or a team.
- Flag proactively any change that could leak PII, keys or internal URLs.
