---
name: nyamia-web-design
description: >-
  Design system and motion rules for the Nyamia website (apps/web): shared brand
  tokens from the product app, typography scale for marketing, scroll/motion
  patterns, mockup fidelity rules and accessibility checks. Use when designing,
  building or reviewing any section, animation, mockup, image or style on the site.
---

# Nyamia Web Design

The site must feel like the **front door of the app**: same palette, same Inter, same window chrome, same compliance colours. Marketing adds scale, rhythm and motion — never a different brand.

## Source of truth

| Layer | Path |
|-------|------|
| Tokens (`@theme`) | `packages/brand/tokens.css` — copied from `../NutriBot/frontend/src/index.css`; keep in sync |
| Logo | `packages/brand/assets/logo-original.png` (original art; do not redraw without the founder's OK) |
| Loader frames | `packages/brand/assets/frame-*.svg` (the app's cookie loader) |
| App UI reference | `../NutriBot/frontend/src/presentation/features/{workspace,menu,clients,recipes}/`, `../NutriBot/.claude/skills/nutribot-frontend-ui/` |

## Palette semantics (same as the app)

- **Green `brand-*`** — brand, primary CTA (`brand-600`, hover `brand-700`), success / day in target.
- **Orange `accent-*`** — attention, AI at work, "needs review"; use sparingly as the spark in a viewport (`accent-500` non-text, `accent-600/700` text).
- **Red `danger-*`** — only for the "out of target" compliance state in mockups and form errors.
- **Neutrals** — `canvas` page background, `surface` cards/windows, `surface-muted` sunken, `text`/`text-muted`.
- Deep contrast sections may use `brand-900` background with `on-solid` text (still the brand palette).
- **Forbidden:** raw hex/rgb/Tailwind palette colours in components, purple/indigo, neon gradients, cream+terracotta, stock food/people photos.

Contrast pairs ≥ 4.5: `on-solid` on `brand-600`/`accent-600`/`danger-600`/`brand-900`; `brand-700` on `brand-50`; `accent-700` on `accent-50`; `text-muted` on `surface`/`canvas`.

## Typography

Inter Variable only. Marketing scale (fluid with `clamp`):
- Display (hero): 48→88 px, weight 650–700, tracking −0.035em, line-height 1.02.
- H2 section statement: 36→60 px, weight 650, tracking −0.03em.
- H3: 22→28 px, weight 600. Body: 17–19 px, `text-muted` for secondary.
- Numbers (macros, kcal, %) always `tabular-nums`.

## Layout

- Max content width 1200 px; section vertical rhythm 120–180 px desktop, 72–96 px mobile.
- One strong idea per viewport. No cards wrapping plain text in the hero.
- Radii: controls `rounded-control`, cards `rounded-card`, product windows `rounded-window`, pills `rounded-pill`.

## Motion rules

- Reward each scroll step: a reveal, a counter settling, a state turning green, a piece snapping into place.
- Patterns: (1) fade-up reveal on enter (y 24px → 0, opacity 0 → 1, 600 ms `--ease-expressive`, stagger 60–90 ms); (2) **sticky scrollytelling** — a pinned product window whose content changes with scroll progress while text steps scroll beside it; (3) scroll-linked progress rail; (4) number count-up on enter; (5) hover micro-interactions (≤150 ms, `--ease-ui`).
- Animate `transform`/`opacity` only; no layout thrash; no scroll hijacking — native scroll position always reflects the page.
- `prefers-reduced-motion: reduce` → render the final state, no movement, no smooth scroll; content and order unchanged.
- Video/loops: muted, `playsinline`, paused off-screen, poster image, pause control.

## Mockup fidelity

- Reproduce real app pieces: command bar ("Escribe lo que necesitas…"-style input), window frame with title + icon, client ficha, weekly menu grid (7 days × meal slots) with green/orange/red compliance, macro bars vs target, PDF preview.
- Fictitious data only (e.g. client "Laura M.", recipes with Spanish names). Never real client names.
- Mockups are `aria-hidden` decorative illustrations with an adjacent text explanation, or have a concise `aria-label`.

## Checklist

- [ ] Tokens only (guard test green)
- [ ] Reduced-motion and no-JS states readable
- [ ] 390 px and 1440 px screenshots reviewed
- [ ] Focus visible on every interactive element
- [ ] No third-party requests in the network panel
