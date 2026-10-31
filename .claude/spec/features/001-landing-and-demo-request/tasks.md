# 001 · Landing v1 + demo request — Tasks

## Phase 0 · Governance (orchestrator)
- [x] `CLAUDE.md`, constitution (`mission.md`, `tech-stack.md`, `roadmap.md`)
- [x] Agents: business, uxui, frontend, backend, qa, cybersecurity
- [x] Skill `nyamia-web-design`; `packages/brand` (tokens + assets)
- [x] Monorepo root (`package.json`, `pnpm-workspace.yaml`, `Makefile`, `.gitignore`)
- [x] Feature 001 spec / plan / tasks

## Phase 1 · Message & experience
- [x] Business: `copy-review.md` + `apps/web/src/i18n/es.ts`, `en.ts` (2026-10-30; 12 open questions for the founder in `copy-review.md` § 6)
- [x] UX/UI: `ux.md` (storyboard, motion spec, mockups, responsive, reduced motion)

## Phase 2 · Build
- [x] Frontend: Astro scaffold, tokens, layout, header/footer, i18n routing
- [x] Frontend: sections + app mockups + scrollytelling
- [x] Frontend: demo form island + privacy/legal pages + 404
- [x] Frontend: SEO (meta, hreflang, OG image, sitemap, robots, JSON-LD) + `vercel.json`
- [x] Frontend: Vitest (i18n parity, colour guard, form) + Playwright (smoke, form, reduced motion, axe, no third-party requests)
- [x] Backend: uv project, domain + ports, command/handler, Postgres repo + Alembic, rate limit, router, settings
- [x] Backend: tests (domain, handler with fakes, router), Dockerfile, `.env.example`, docker-compose (5433)

## Phase 3 · Verify
- [x] QA: all suites green, screenshots 390/1440 ES/EN, JS budget, report (2026-10-30, `qa-report.md`: web 89 unit + 62 e2e, api 94; Lighthouse 100×4 on `/` and `/en/`; JS 116.6 KB gzip worst case)
- [x] Cybersecurity: review + verdict, fixes applied (API pass + web pass 2026-10-30, `security-review.md`; verdict ship with mitigations, go-live items for 003)
- [x] UX/UI: visual review vs `ux.md`, deltas fixed (review `ux-review.md`; Frontend fix round 2026-10-30: all P1 and most P2/P3 fixed, skips listed under Resolution)

## Phase 4 · Close
- [x] Root `README.md`, roadmap updated, open questions for the founder listed
