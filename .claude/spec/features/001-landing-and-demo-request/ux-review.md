# 001 · Landing v1: UX/UI visual review (phase 3)

_Reviewer: `@nyamia-web-uxui`. Build reviewed: `apps/web/dist` (served with `astro preview`). This was a review only, so no code was changed. Evidence paths are absolute:_
- `SHOTS` = `/tmp/claude-1000/-home-ferra-git/604b03bf-81fd-47fc-aa7a-5b3cb527ef37/scratchpad/shots/`, holding the full-page captures (plus `parts/`) and `stage-step-0..5.png`
- `UXR` = `/tmp/claude-1000/-home-ferra-git/604b03bf-81fd-47fc-aa7a-5b3cb527ef37/scratchpad/ux-review/`, holding the motion frames captured with `capture.mjs` (Playwright, 1440×900 and 390×844, plus reduced motion)

## Verdict

The build is strong. It reads as the front door of the app: the window chrome, command bar, dock, week grid, compliance tints, the ficha and the PDF window are faithful to `NutriBot/frontend/src/presentation`, and even the legend strings are copied verbatim from `ComplianceLegend.tsx`. The type scale and the eyebrow → statement → lead stack are crisp. The header condenses cleanly. The mobile header sheet, the form and the FAQ all work. Under reduced motion every element renders in its final state.

Three defects break the reward loop or look broken. Fix them before the founder sees the page.

### Long empty areas in the full-page captures

On desktop this is an artefact of the capture method. Playwright's `fullPage` mode does not scroll, so the sticky stage stays at its first position next to step 01 and the rest of the right column looks empty. Captured at the real viewport, the stage is pinned beside every step: see `SHOTS/stage-step-0..5.png` and `UXR/stage-s*-*.png`.

On mobile there are no gaps. Every step has its own static frame: `UXR/m-story-00..05.png`, `SHOTS/parts/en-390-p02..p04.png`.

There is one optional tweak (P3-7).

---

## P1: must fix before showing the founder

**P1-1 · At 1440×900 the hero's reward happens below the fold**
- Files: `apps/web/src/components/sections/Hero.astro`, `apps/web/src/components/mockups/HeroProduct.astro`
- Problem: the product window starts at about y=750, so only the command bar and the window title are visible. The 28 cards snapping in and the 7 days turning green (3.4–4.3 s) all play below the fold. The first green is never seen without scrolling. ux.md §2.2 asked for the window top at about 600 px and about 300 px of it peeking above the fold.
- Fix (target: window top ≤ 600 px and the day-header row with "Cumple" visible at 900 px):
  - Hero `lg:pt-20` → `lg:pt-10`
  - H1 `mt-6` → `mt-5`
  - Tagline `mt-6` → `mt-4`
  - Sub `mt-5 max-w-[42rem]` → `mt-4 max-w-[48rem]`, so it fits on 2 lines at 1440
  - CTA row `mt-8` → `mt-7`
  - Note `mt-4` → `mt-3`
  - HeroProduct `mt-14 lg:mt-20` → `mt-10 lg:mt-12`
  - Fallback if that is not enough: shorten `hero.sub` (Business) rather than shrink `text-display`.
- Evidence: `UXR/crop-hero-d-fold.png`, `UXR/hero-d-montage.png`, `UXR/hero-d-montage2.png`

**P1-2 · Step 01's entry sequence never plays**
- File: `apps/web/src/components/mockups/StoryStage.tsx`
- Problem: the targets count-up and the allergen chip `snap` never run. `step` and `prevStep` both start at `0`, and a sequence only plays when `step === prev + 1`. The first beat of the scrollytelling therefore delivers no reward.
- Fix: start in a "not entered" state.
  - `const [step, setStep] = useState(-1)` and `prevStep = useRef(-1)`
  - Render `stageStateFor(Math.max(step, 0))`
  - Keep the SSR markup identical: the server still renders step 0's rest state, so CLS stays at 0.
  - The first IntersectionObserver hit then gives `-1 → 0` and plays sequence 0.
  - Mirror `Math.max(step, 0)` onto `data-step`. Reduced motion is unaffected.
- Evidence: code path. `UXR/stage-enter-s0.png` shows final values only.

**P1-3 · At 390 px (ES) the ficha's target labels collide**
- File: `apps/web/src/components/mockups/ClientFicha.tsx` (line 26, default variant `grid grid-cols-4`)
- Problem: "Carbohidratos" runs into "Grasas", and "2100 kcal" breaks onto two lines in the mobile frame for step 01.
- Fix:
  - Default variant: `grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4`, as the `targets` variant already does.
  - Add `whitespace-nowrap` on the value + unit.
  - Add `min-w-0 truncate` on the label.
- Evidence: `UXR/crop-m-ficha-collision.png`, `UXR/m-story-00.png`

---

## P2: should fix

**P2-1 · Day-header totals wrap into orphans**
- File: `WeekMenu.tsx` (≈ line 178, `t.menu.dayTotal`)
- Problem: in the stage and hero, the totals break as "1780/2100 / kcal · P / 104/140" across 3–4 ragged lines.
- Fix: render the kcal part and the protein part as two `whitespace-nowrap tabular-nums` spans. The line can then break only between them: `2075/2100 kcal` / `P 138/140`.
- Evidence: `SHOTS/stage-step-2.png`, `SHOTS/stage-step-3.png`

**P2-2 · Step 05's floating modal collides with the strip heading**
- File: `StoryStage.tsx`, modal wrapper `absolute bottom-3 left-3 w-[22rem]`
- Problem: "FAVORITAS APTAS · ARRASTRA…" peeks out above the modal's top edge, which looks like a rendering error.
- Fix: keep the float (deviation accepted). Either:
  - anchor it `top-[4.5rem] left-3`, below the toolbar and over the strip, or
  - add a local veil over the menu window only (`absolute inset-0 rounded-window bg-surface/60`, no blur) behind the modal, fading with `ui` at 150 ms.
- Evidence: `UXR/crop-modal-collision.png`, `SHOTS/stage-step-4.png`

**P2-3 · The PDF beat's first frame is blank**
- Files: `CookieLoader.tsx`, `PdfPreview.tsx`
- Problem: at +250 ms the preview is an empty grey box. The cookie `<img>` frames are only fetched when the loader mounts, inside a 650 ms window.
- Fix: decode the frames ahead of time. Either:
  - render a hidden `CookieLoader` (`sr-only`/`opacity-0`) when the stage mounts, or
  - inline the 6 SVGs as a sprite.
- Evidence: `UXR/crop-pdf-loading.png`, `UXR/mont-s35.png`

**P2-4 · The PDF payoff is too small**
- File: `PdfPreview.tsx`
- Problems:
  - The sheet content fills only the top half of the preview.
  - The "Tu logo" slot in the page header is about 9 px, so the "logo stamps in" moment is invisible.
- Fix:
  - Stage variant: increase the sheet type scale (7 → 9 px) or crop the preview to `aspect-[297/150]`.
  - Logo slot in the page header: `h-8 px-3`, with a one-time `snap` at `--duration-snap` and a `ring-2 ring-brand-300` that fades out.
- Evidence: `SHOTS/stage-step-5.png`

**P2-5 · The "Tú decides" room repeats itself and leaves half the width empty**
- File: `apps/web/src/components/sections/Control.astro`
- Problems:
  - The H2 "Tú decides. Siempre." and the three-line tagline ending in "tú decides" sit in the same viewport.
  - Everything is left-aligned at 1440, so the right 45 % is empty.
  - The dot payoff itself works (`UXR/mont-ctrl.png`).
- Fix:
  - Make the three-line tagline the statement (`text-statement`, centred at lg per ux.md §2.6).
  - Demote "Tú decides. Siempre." to the eyebrow, or drop it.
  - Keep the 4 points in a row.
- Evidence: `SHOTS/parts/es-1440-p05.png`, `UXR/control-d-1500.png`

**P2-6 · Weak Features tiles**
- File: `Features.astro`
- Problems:
  - "Mismos gramos toda la semana" shows kcal, not grams, so the claim isn't visible.
  - "Todo en castellano" has no micro-visual, which leaves an empty half-tile.
- Fix:
  - Grams tile: add `· 180 g` (`tabular-nums text-brand-700`) to both cells and draw the connector (`stroke-dashoffset`, 500 ms).
  - Castellano tile: add two chips: `badge.brand` "ES" and `badge.accent` "Sin traducir".
- Evidence: `SHOTS/parts/es-1440-p04.png`, `SHOTS/parts/es-1440-p05.png`

**P2-7 · No hero reward on mobile**
- File: `HeroProduct.astro`, mobile branch
- Problem: the mobile hero uses `CommandBar mode="typed"` and its green days sit below the fold.
- Fix: use `mode="hero"` (the CSS typing animation, zero JS) so the first viewport has motion. Also shorten the frame from `h-[440px]` to `h-[400px]`.
- Evidence: `UXR/hero-m-montage.png`

**P2-8 · Founder link shows `[PENDIENTE: URL…]`**
- File: `Control.astro`
- This is a Business/founder item: provide the URL, or hide the link until it exists. Otherwise the founder will read it as unfinished.
- Evidence: `SHOTS/parts/es-1440-p05.png`

---

## P3: nice to have

| # | Location | What | Fix |
|---|---|---|---|
| 1 | `StoryStage.tsx` seq 4 | The swap is near-instant, with no ✕ or pointer, so "Sunday turns green" is easy to miss | Add the pointer glyph + ✕ fade (400 + 150 ms) before the flight, as specified in ux.md §2.4 |
| 2 | `Problem.astro`, `ProblemSheet.astro` | The Problem viewport has no reward on enter | `tint` the "Total día" red cells from `surface` to `danger-50` 300 ms after reveal, and `count` 1780 |
| 3 | `HowItWorks.astro` step 04 legend vs mockup legend | The step text says "Rojo: calorías fuera", while the mockup says "Rojo = Macros y calorías no encajan" (the app's string) | Align the step copy to the app wording (Business) |
| 4 | `DemoForm.tsx` | The default "Sin especificar" pill looks *selected* (brand border/fill) | Style the null choice neutral: `bg-surface-muted text-text border-border` |
| 5 | `DemoForm.tsx` | On invalid submit all 5 radio cards turn red, which is heavy | Put the error on the fieldset (legend + message red, cards keep `border-border`) |
| 6 | `Faq.astro` | On mobile the secondary CTA sits between the headline and the list | `order-last` below the list at `<lg` |
| 7 | `HowItWorks.astro` | 6 × 78svh plus `pb-[30svh]` makes for a long scroll | Use `lg:min-h-[70svh]` and `lg:pb-[20svh]` |
| 8 | Section seams | About 300 px of empty canvas before and after the dark room and before How it works at 1440 | Halve `py-section` on the side that touches the brand-900 room |

---

## Declared deviations

| Deviation | Verdict | Why / condition |
|---|---|---|
| 6 steps (swap + grams merged into 05) | **Accept** | It tightens the loop and matches "Tú decides". Condition: P3-1 (make the swap legible). |
| Mockup numbers follow the copy (2100/140/230/70) | **Accept** | They are consistent across hero, ficha, features and spreadsheet. |
| Spreadsheet instead of ManualGrid, no "112" counter | **Accept** | It is more recognisable ("menu_laura_v7_FINAL.xlsx" lands) and avoids a pseudo-statistic. Recommend P3-2 for the reward. |
| Mid-page CTA uses `finalCta` keys | **Accept** | The line works mid-page. Revisit only if Business wants distinct wording. |
| Message field always visible; "Sin especificar" pill | **Accept** | Fewer hidden controls and an explicit null. Condition: P3-4 styling. |
| Recipe modal and MacroBars float over the stage, no scrim | **Accept** | It keeps the week visible while editing. Condition: P2-2 (collision). |
| Canonical URLs end in a slash | **Accept** | No UX impact. |

---

## Resolution (Frontend fix round, 2026-10-30)

_Shots in `/tmp/claude-1000/-home-ferra-git/604b03bf-81fd-47fc-aa7a-5b3cb527ef37/scratchpad/shots2/` (`hero-1440x900-{es,en}.png`, `ficha-390-es.png`, `hero-390x844-es.png`, `stage-step-0..5.png`, `stage-swap-*.png`, `stage-pdf-*.png`, `control-1440.png`, `form-1440.png`, full pages `{es,en}-{390,1440}.png` and `mobile/`)._

| # | Status | What was done |
|---|---|---|
| P1-1 | **Fixed** | The spacing from the review, tightened further: hero `lg:pt-6`, H1 `mt-5`, tagline `mt-4`, sub `mt-4 max-w-[48rem]` (2 lines at 1440), CTA row `mt-6`, note `mt-3`, HeroProduct `mt-10 lg:mt-8`. Measured at 1440×900: window top **587 px** (ES and EN), and the day-header row with "Cumple" is visible at the fold. **Extra bug found and fixed:** the hero payoff never played. The 1 ms `steps(1)` one-frame animations (typing chars, "Sin menú" → status swap, form success status) often ended in their `from` state in Chromium, because float rounding of the end time lands short of progress 1. The prompt stopped at "crea el" and 6 of the 7 days stayed "Sin menú" (this is also visible in `UXR/crop-hero-d-fold.png`). They now use `1ms linear` (the same step visually). The caret keyframe also blinks now, where before it was invisible. |
| P1-2 | **Fixed** | `step`/`prevStep` start at `-1`. The stage renders `Math.max(step, 0)` (SSR markup unchanged). `data-step`, the text-list mirror, the grid key and `pulseRecalc` all use the clamped value. Verified: targets count 0 → 2100 and the allergen chip snaps in about 350 ms after step 01 reaches the centre line (after hydration). |
| P1-3 | **Fixed** | Default variant `grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4`, `min-w-0 truncate` label, `whitespace-nowrap` value + unit. At 390 the targets show as 2×2 with no collision (`ficha-390-es.png`). |
| P2-1 | **Fixed** | `dayTotal` is split on " · " into two `whitespace-nowrap` spans, so the line breaks only between kcal and P. |
| P2-2 | **Fixed** | Modal anchored `top-[4.5rem] left-3` (over the strip). The strip heading no longer peeks out. |
| P2-3 | **Fixed** | A hidden `CookieLoader` (`opacity-0`) mounts with the stage, so the frames are decoded before the PDF beat (`stage-pdf-250ms.png` shows the cookie). |
| P2-4 | **Fixed** | `PdfSheet size="lg"` in the stage: the sheet is cropped to `aspect-[297/170]`, type goes from 6–11 px to 10–14 px, and the logo slot is full size (`h-8 px-3`) with a one-time `pop-in` snap plus a `ring-2 ring-brand-300` that fades. Cell clamp moved to an inner span, so the third line no longer peeks. Features and mobile frames keep the small sheet. |
| P2-5 | **Fixed** | The tagline is now the room's statement (`text-statement`, centred at lg) followed by the sub. "Tú decides. Siempre." stays the H2 for document outline and tests, styled as the eyebrow. The "Control" eyebrow is no longer rendered: Business can drop `control.eyebrow`. The 4 points stay in a row. |
| P2-6 | **Partly fixed** | Grams tile: `· 180 g` (`text-brand-700`, tabular) on both cells. The dashed connector already draws (`trick-draw`). **Skipped:** the castellano tile chips. "Sin traducir" / its EN counterpart is new copy, so it needs a key from Business (proposed `features.items[7].chips: ['ES', 'Sin traducir']`). |
| P2-7 | **Fixed** | Mobile hero uses `CommandBar mode="hero"` (CSS typing in the first viewport), the frame is `h-[400px]`, and the compact day pills tint in on the hero timeline (`hero-day`). |
| P2-8 | **Skipped (founder)** | `[PENDIENTE]` founder URL left as is, as instructed. The founder must provide the URL. |
| P3-1 | **Fixed** (deviation condition met) | Swap sequence rebuilt. The cause was bigger than timing: Sunday's dinner cell sat about 160 px *below* the visible window, so the swap was never on screen. The week grid now scrolls up inside its clip (300 ms, measured distance) to bring the dinner row into view. Then the pointer glyph and a red ✕ appear on the card (400 ms), the card fades (150 ms), the Favorita flies in, the column turns green, and the grid scrolls back before the recipe modal opens (`stage-swap-450ms.png`, `stage-swap-1900ms.png`). |
| P3-2 | **Partly fixed** | The red "Total día" cells now `tint` from `surface-muted` to `danger-50` on reveal (`trick-tint`). The 1780 count-up was skipped: it needs JS in a zero-JS section. |
| P3-3 | **Skipped (Business)** | Copy alignment of the step 04 legend to the app wording is a Business copy change. |
| P3-4 | **Fixed** (deviation condition met) | The checked "Sin especificar" pill is neutral (`bg-surface-muted text-text border-border`). The numeric pills keep the brand fill. |
| P3-5 | **Fixed** | On a role error the legend turns `danger-600` and the message shows below. The cards keep `border-border`. |
| P3-6 | **Fixed** | Below lg the FAQ's secondary CTA renders after the list. At lg it stays in the sticky column. |
| P3-7 | **Fixed** | Steps `lg:min-h-[70svh]`, list `lg:pb-[20svh]`. |
| P3-8 | Skipped | Section seam spacing around the dark room. Not done in this round (it touches the `Section` rhythm across the page). Left for the next visual pass. |
