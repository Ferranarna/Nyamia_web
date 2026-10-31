# Nyamia Web

Marketing website for **Nyamia** (AI meal-planning assistant for dietitians-nutritionists), served at **nyamia.com**. Its single business goal: **turn visitors into demo requests**. The product itself lives in a separate repository (`../NutriBot`, deployed at `app.nyamia.com` / `api.nyamia.com`); this repo only presents it.

Monorepo: `apps/web` (Astro + React islands + Tailwind v4) and `apps/api` (FastAPI, hexagonal, demo-request intake). Shared brand assets and tokens live in `packages/`.

This file is the versioned orchestrator for Claude Code. Role packs live as native subagents in **`.claude/agents/`**. Procedural skills live in **`.claude/skills/`**. Product/tech source of truth lives in **`.claude/spec/constitution/`**; per-feature contracts live in **`.claude/spec/features/`**. If `.claude/spec/` is missing, say so — do not invent product rules.

**Roles (do not conflate):**
- This file — **orchestrator**: role routing, session workflow, hard agent rules.
- `.claude/agents/nyamia-web-*.md` — specialized subagents. Claude auto-delegates by description, or invoke explicitly (`@nyamia-web-frontend`, etc.).
- `.claude/spec/constitution/` — **source of truth** (`mission.md`, `roadmap.md`, `tech-stack.md`). Prefer these over duplicating details here.
- `.claude/skills/` — on-demand procedural skills (`nyamia-web-design`).

**Product facts come from the product repo, not from imagination.** Before describing a feature on the site, check that it exists in `../NutriBot/.claude/spec/constitution/roadmap.md` (Done) — never market an unbuilt feature as available. Brand voice, ICP, pricing and language policy come from `../NutriBot/.claude/spec/business/roadmap.md`; regulatory limits from `../NutriBot/.claude/spec/regulatory/eu-snapshot.md`. If those files moved, ask.

---

## Role routing

| Task type (examples) | Primary subagent | Also involve |
|----------------------|-------------------|---------------|
| Astro pages, React islands, Tailwind, scroll/motion, i18n, SEO markup, Vitest/Playwright for web | `@nyamia-web-frontend` | UX/UI; Business (copy); QA |
| Scroll narrative, section storyboard, motion spec, visual hierarchy, accessibility, app-coherent visuals | `@nyamia-web-uxui` | Frontend; Business |
| Demo-request API, persistence, Alembic, rate limiting, notifications, deploy config of `apps/api` | `@nyamia-web-backend` | QA; Cybersecurity |
| Test plans, running suites, a11y/perf budgets, CI gates | `@nyamia-web-qa` | Frontend/Backend; Cybersecurity |
| Headers/CSP, form abuse, PII of leads, privacy notice, secrets, third-party requests | `@nyamia-web-cybersecurity` | Backend/Frontend; Business |
| Copy (ES/EN), positioning, CTA strategy, claims review, conversion metrics, roadmap priority | `@nyamia-web-business` | UX/UI; Cybersecurity (privacy wording) |

### Multi-role sequences

1. **New feature / section:** Business (problem, copy, acceptance) → UX/UI (storyboard + motion spec) → Frontend and/or Backend → QA (implements + runs suites, reports) → Cybersecurity (if forms, data, third parties, headers).
2. **Copy change:** Business → Frontend (wire) → QA (i18n parity + visual check).
3. **Bugfix:** primary eng subagent → QA if regression risk → Cybersecurity if security-relevant.
4. **Ambiguous:** ask; else start with Business, then UX/UI.

Model/effort per role is pinned in each subagent's frontmatter.

---

## Pointers (do not fork these here)

| Need | Read |
|------|------|
| Why the site exists, audience, principles, non-goals | [`.claude/spec/constitution/mission.md`](.claude/spec/constitution/mission.md) |
| Done / next / backlog + feature folders | [`.claude/spec/constitution/roadmap.md`](.claude/spec/constitution/roadmap.md) |
| Stack, commands, layout, conventions, hard limits | [`.claude/spec/constitution/tech-stack.md`](.claude/spec/constitution/tech-stack.md) |
| Feature contract / design / checklist | `.claude/spec/features/NNN-slug/{spec,plan,tasks}.md` |
| Tokens, motion rules, visual coherence with the app | skill `nyamia-web-design` |

---

## Do not

Essentials (full list in [`tech-stack.md`](.claude/spec/constitution/tech-stack.md) § Hard limits):

- Never read/cite `.env` or secrets; document env var **names** only; never echo pasted keys (ask to rotate).
- Never claim health outcomes, clinical use, or features not yet built in the product.
- Never add third-party scripts, fonts, trackers or cookies without a Cybersecurity + Business decision recorded in a spec.
- Never invent testimonials, customer logos, metrics or a "team" — Nyamia speaks with a neutral product voice.
- Never use real client/patient data in mockups, screenshots or videos — fictitious data only.
- Never install deps silently (`pnpm add`, `uv add` only after stating why).

---

## Workflow

1. **Route** → delegate to the matching subagent (or adopt its role directly); state which role is acting.
2. **Constitution check** on non-trivial work: mission fit + roadmap priority + tech-stack constraints.
3. **Plan** → **wait for OK** (unless the user already approved the plan in this session).
4. **One task**; summarize what/where for review.
5. If confidence < ~80%, ask — do not invent product rules, legal identities, prices or vendor behavior.
6. **Tests:** QA runs `pnpm test`, `pnpm test:e2e` (web) and `uv run pytest` (api); on failure reports which test failed and the suspected cause before fixing; once green reports what made it pass.
7. **Security check** before finish on anything touching forms, headers, data or third parties.
8. **Close:** update the feature's `tasks.md` and `roadmap.md`.
9. Commits/PRs only when the user explicitly asks.
