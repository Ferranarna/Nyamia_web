# Nyamia Web

Public website of **Nyamia** — the AI meal-planning assistant for dietitians-nutritionists — served at **[nyamia.com](https://nyamia.com)**. Its goal: help professionals understand the product and **request a demo**.

The product itself lives in a separate repository and runs at `app.nyamia.com`.

## Monorepo

```
apps/
  web/        Astro static site + React islands + Tailwind v4 (nyamia.com)
  api/        FastAPI service for demo requests (nyamia.com/api/* via Vercel rewrite)
packages/
  brand/      Brand tokens (copied from the product app) and assets
.claude/      Claude Code agents, skills and specs (constitution + features)
```

## Prerequisites

- Node.js ≥ 22 with Corepack (`corepack enable pnpm`)
- Python ≥ 3.12 and [uv](https://docs.astral.sh/uv/)
- Docker (local Postgres for the API, port 5433)

## Web

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # production build (apps/web/dist)
pnpm test         # Vitest
pnpm test:e2e     # Playwright (builds + previews the site)
pnpm lint
```

## API

```bash
make api-env         # creates apps/api/.env from .env.example (local placeholders only)
make api-db-up       # Postgres on localhost:5433
make api-db-migrate  # alembic upgrade head
make api-dev         # http://localhost:8020  (POST /api/v1/demo-requests)
make api-test
make api-lint
```

In local development the Astro dev server proxies `/api` to `http://localhost:8020`.

## Deploy (planned — roadmap 003)

- **Web:** Vercel, project root `apps/web`, domain `nyamia.com`. `apps/web/vercel.json` sets security headers and rewrites `/api/*` to the API service.
  - The rewrite destination `https://API_HOST_PLACEHOLDER/api/:path*` is a placeholder: the Railway API host is set in roadmap 003 (JSON allows no comments, so the note lives here).
  - `www.nyamia.com` → `nyamia.com` is a **Vercel domain setting** (add `www` as a redirect domain to the apex), not a `vercel.json` rule.
  - CSP: `script-src 'self'` plus the SHA-256 hashes of Astro's two inline island-runtime scripts (no `'unsafe-inline'` for scripts). `pnpm build` fails if the built HTML has an unlisted inline script; after an Astro upgrade run `node scripts/csp.mjs --write` in `apps/web`. `style-src` keeps `'unsafe-inline'` (inline `style` attributes from Astro/React SSR).
  - Brand derivatives (favicons, `og-es.png`, `og-en.png`) are committed in `apps/web/public/`; regenerate with `pnpm --filter @nyamia/web brand:assets` (local Chromium, no network).
  - Visual review screenshots: `SHOTS_DIR=/some/dir pnpm --filter @nyamia/web exec playwright test e2e/screenshots.spec.ts --project=desktop`.
- **API:** Railway (Dockerfile in `apps/api`) + managed Postgres; pre-deploy `alembic upgrade head`.
- Secrets live only in the Vercel/Railway dashboards. See `apps/api/.env.example` for variable **names**.

## Working with Claude Code

`CLAUDE.md` routes work to the subagents in `.claude/agents/` (business, uxui, frontend, backend, qa, cybersecurity). Source of truth: `.claude/spec/constitution/` (`mission.md`, `tech-stack.md`, `roadmap.md`). Each feature lives in `.claude/spec/features/NNN-slug/` with `spec.md`, `plan.md`, `tasks.md`.
