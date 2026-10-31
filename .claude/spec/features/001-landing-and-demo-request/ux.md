# 001 · Landing v1 + demo request — UX/UI

_Owner: `@nyamia-web-uxui`. Consumers: `@nyamia-web-frontend` (build), `@nyamia-web-business` (copy keys referenced by role), `@nyamia-web-qa` (what to assert). Tokens refer to `packages/brand/tokens.css`; motion names refer to §6. Copy is referenced by **role** ("hero headline"), never written here — final wording lives in `apps/web/src/i18n/{es,en}.ts`. Mockup **data** (client names, recipes, numbers) is proposed here because it must be consistent across mockups; Business may reword it (see §3.0)._

App sources studied (read-only): `NutriBot/frontend/src/presentation/{layout/WorkspaceShell.tsx, pages/Workspace/WorkspacePage.tsx, features/workspace/components/*, features/menu/*, features/clients/components/*, features/calendar/components/ComplianceLegend.tsx}`, `shared/styles/ui.ts`, `shared/components/{BrandMark,LoadingCookie}.tsx`, `index.css`, specs 036/037/038/040/041, product roadmap (Done through 042).

---

## 0. Design stance in one paragraph

The page is a **guided tour of one week of work for one fictitious client (Laura)**, told in the order a nutritionist lives it: the ficha → a sentence in the command bar → a proposed week → the numbers fitting → the professional's own touch → a PDF with her logo. Each viewport shows **one** state change of the real app UI and pays it off immediately (a number lands, a day turns green, a card snaps in). Big typographic statements carry the argument; faithful coded mockups carry the proof. Light canvas, green for "it fits / do it", orange only where the AI is working or something needs a look, red only for "out of target". One dark `brand-900` section gives the eye a breath before the ask.

---

## 1. Narrative arc and "reward per viewport" map

Arc: **Recognition → Curiosity → Proof (in 7 beats) → Breadth → Reassurance → Ask → Remove last doubts.**

| # | Section (anchor) | What the D-N feels / learns | The reward in that viewport | Curiosity gap it opens |
|---|---|---|---|---|
| 1 | Hero | "This is a tool for *my* menus, and it already looks like a real product." | A prompt types itself; a week of 28 meals snaps into the grid; 7 day cards settle into green. First green within ~4.5 s of landing. | "How did it make the numbers fit?" |
| 2 | Problem | "Yes — that's my Sunday evening with a spreadsheet." | Statement words light up as you read (scroll-linked); a 7×4 grid of grams scrambles and a counter lands on the number of figures she balances by hand per week. | "What if the grams balanced themselves?" |
| 3a | How it works · 1 Ficha | "It starts from my client's targets." | Laura's daily targets count up into place (2 200 kcal · 150 g P · 240 g HC · 70 g G); allergen chip appears. Progress rail: 1/7. | "Now what do I ask?" |
| 3b | · 2 Petición | "I just write what I want." | The command bar types the request; the ficha minimizes into a dock chip (`Laura M. · 1`); a history entry appears. 2/7 | — |
| 3c | · 3 Propuesta | "It uses *my* Favoritas, and respects allergens." | Recipe chips fly from the Favoritas strip into the week, column by column; the blocked nut recipe stays greyed. 3/7 | "But are the macros right?" |
| 3d | · 4 Ajuste ±10 % | "The amounts are calculated, not guessed." | Day cards flip red/orange → green one by one with totals counting; MacroBars glide into the ±10 % band. One day honestly stays orange with "Recalcular". 4/7 | "And that orange day?" |
| 3e | · 5 Cambia una receta | "I'm in control." | ✕ removes a recipe, a Favorita is dragged into the slot, Sunday turns green. 5/7 | — |
| 3f | · 6 Retoca gramos | "I can fine-tune, and the week stays consistent." | Grams edited in the recipe modal → the 4 macro tiles update live; the two days that share the recipe pulse. 6/7 | "And for my client?" |
| 3g | · 7 PDF | "I hand over something with my brand." | A PDF page slides in; "Tu logo" stamps into the header; section checkboxes tick; "Descargar" lights up. 7/7 → rail completes, ends on a mid-page CTA. | — |
| 4 | Features (bento) | "It covers the rest of my workflow too." | Each tile performs one tiny trick on entry (chips appear, a link turns into a recipe, dock chips stack); hover lifts. | — |
| 5 | Control & trust (dark) | "The AI proposes; I decide. It's honest about what it is." | Contrast switch to `brand-900`; the tagline assembles in three beats ("La IA propone · los macros se calculan · tú decides") with the green dot landing on the last one. | — |
| 6 | Demo (`#demo`) | "Asking costs me 40 seconds and nothing else." | Each valid field earns a small green check; on submit, a day card flips to "Cumple"-green with a drawn check. | — |
| 7 | FAQ | "My last doubts are answered plainly." | Accordion opens smoothly; chevron rotates. | — |
| 8 | Footer | Closure; links. | Calm. Cookie loader frame as a tiny sign-off illustration (static). | — |

**Ethics guardrails for the loop:** no scroll-jacking (native scroll always moves the page), no fake urgency/countdowns, no autoplay sound, no infinite loops on hero (plays once, ≤ 5 s → WCAG 2.2.2 safe), no "sticky" content that blocks reading, every animated state is also readable as static text next to it.

---

## 2. Section-by-section storyboard

### 2.0 Global layout system

- Content max width `1200px` (`max-w-[75rem]`), gutters `px-6` (desktop) / `px-5` (mobile). The scrollytelling stage and hero window may extend to `1240px`.
- 12-column grid at ≥ 1024 px, gap 24 px; single column < 1024 px.
- Section vertical rhythm `py-section` (token §6.2: 72 px mobile → 176 px desktop). Sections never sit in cards; product visuals sit in window chrome.
- Breakpoints: `sm 640`, `md 768`, `lg 1024` (layout switch: sticky stage on/off), `xl 1280`.
- Eyebrow above every H2: `text-sm font-semibold uppercase tracking-wide text-brand-700` (the app's `ficha.sectionTitle`/`historyItem.group` style, scaled up — instant family resemblance).

Motion vocabulary used below (defined in §6.3): **`reveal`** (fade-up 24 px, 600 ms, `--ease-expressive`), **`snap`** (spring for things landing in place), **`ui`** (150 ms `--ease-ui`, colour/opacity/hover), **`count`** (number tween 700–900 ms `--ease-expressive`, `tabular-nums`), **`tint`** (background/border colour cross-fade 300 ms `--ease-ui`).

---

### 2.1 Header

**1440:**
```
┌───────────────────────────────────────────────────────────────────────────────┐
│ [logo] Nyamia      Cómo funciona   Funciones   Preguntas     ES|EN  Entrar  [Solicitar demo] │  72px → 56px condensed
└───────────────────────────────────────────────────────────────────────────────┘
```
- Left: `BrandMark`-equivalent (logo 32 px `rounded-control` + "Nyamia" `text-lg font-semibold tracking-tight`), links to `/` (or `/en/`).
- Centre: 3 anchor links (`text-sm font-medium text-text-muted`, hover `text-text`, active = `text-brand-700` + 2 px `brand-500` underline bar animated with `scaleX`).
- Right: language switch (`ES · EN`, current = `text-text font-semibold`, `aria-current="true"`, other is a link to the alternate URL with `hreflang`), "Entrar" (tertiary: `button.ghost` sm → `https://app.nyamia.com`), primary CTA (`button.primary` md, `rounded-control`).

**390:**
```
┌──────────────────────────────────────┐
│ [logo] Nyamia     [Solicitar demo] [☰]│  60px → 52px
└──────────────────────────────────────┘
  ☰ opens a sheet below the header (full width, bg-surface, border-b, shadow-md):
  Cómo funciona / Funciones / Preguntas / ── / ES · EN / Entrar
```
- CTA `button.primary` sm (h-8) stays visible; anchors + language + Entrar move into the sheet. Sheet = disclosure (`aria-expanded`, `aria-controls`), closes on link click, `Esc`, or outside tap; focus returns to ☰.

**Behaviour (details in §5.1):** sticky; condenses after 24 px; active anchor tracks section in view; skip link "Saltar al contenido" first in DOM.

**Motion:** condense = height 72→56 & logo 32→28 via `transform: scale` on the inner row, background `transparent → bg-canvas` + `border-b border-border` + `shadow-sm` with `ui` 200 ms. Active underline `ui` 150 ms. Sheet open: `opacity 0→1`, `y −8→0`, 180 ms `--ease-ui`.
**Reduced motion:** state changes instantly (no transitions).
**No-JS:** header is static (not condensed, still sticky via CSS `position: sticky`), anchors work (native `#hash`), mobile ☰ hidden and replaced by an inline horizontal row of the 3 anchors under the header (`<noscript>` styles or `@media (scripting: none)`).

---

### 2.2 Hero

**Content blocks (top→bottom):** eyebrow pill (role: "hero eyebrow", e.g. beta/language status — `badge` style `bg-brand-100 text-brand-700 rounded-pill` with a 6 px `brand-500` dot) → **hero headline** (Display) → **hero tagline** ("La IA propone, los macros se calculan, tú decides." — H3 size, `text-text-muted`, with "tú decides" in `text-brand-700`) → CTA row (primary "hero CTA" → `#demo`; secondary "hero secondary CTA" → `#como-funciona`, `button.secondary` lg) → **hero microcopy** under CTAs (`text-sm text-text-muted`) → **HeroProduct** mockup.

**1440 (900 px tall viewport):**
```
            ( • Beta en español )
     ┌────────────────────────────────────────────┐
     │   Hero headline, two lines, centred,        │   Display 88px
     │   max 14ch per line                         │
     └────────────────────────────────────────────┘
        La IA propone, los macros se calculan, tú decides.     H3 muted
           [ Solicitar demo ]  [ Ver cómo funciona ]
                   hero microcopy (sm, muted)
 ┌──────────────────────────────────────────────────────────────────────────┐  top ≈ 600px
 │ sidebar │  [ Crea el menú de la semana para Laura▍          ] [Enviar]   │  HeroProduct
 │ Nyamia  │  (Laura M. 1)                                                   │  1120px wide
 │ +Nueva  │ ┌ Calendario · Laura Martín Ruiz ───────────────── – ✕ ┐       │  peeks ~300px
 │ HOY     │ │ ‹ Semana del lun, 2 nov ›   Exportar PDF  Menú de hoy │       │  above the fold
 │ · Crea… │ │ lun  mar  mié  jue  vie  sáb  dom   (7 day columns)   │       │
 └─────────┴─┴───────────────────────────────────────────────────────┴───────┘
```
- Text centred, `max-w-[60rem]`. Product window centred, `max-w-[70rem]`, `rounded-window shadow-lg border-window-border`, bottom of it fades into canvas with a 120 px mask (`mask-image: linear-gradient(black 70%, transparent)`) so the hero ends softly and invites scroll.
- Background: canvas + brand radial wash (§6.4) behind the headline; a faint `accent-50` radial (480 px) behind the command bar = the one orange spark.

**390:**
```
( • Beta en español )
Hero headline          ← left-aligned, Display 48px, 3–4 lines
La IA propone, …       ← 19px muted
[ Solicitar demo ]     ← full width, lg
[ Ver cómo funciona ]  ← full width, secondary
microcopy
┌───────────────────────────────┐
│ ☰ [logo] Nyamia               │ ← app's mobile top bar (WorkspaceShell lg:hidden)
│ [Crea el menú de la sem…▍][➤]│
│ ┌ Calendario · Laura M. ─ – ✕┐│
│ │ ● ● ● ● ● ● ●  (L M X J V S D compliance strip)
│ │ [lun 2 nov][mar 3 nov][mi…  │ ← 2.4 day columns, right-edge fade = "scrolls"
└───────────────────────────────┘
```

**Motion — HeroProduct timeline (pure CSS, starts on load, total 4.6 s, plays once):**

| t (ms) | Element | Properties | Duration · easing |
|---|---|---|---|
| 0 | Text block (eyebrow, H1 lines, tagline, CTAs) | `reveal`, stagger 70 ms per line/row | 600 · `--ease-expressive` |
| 250 | Product window | `opacity 0→1`, `y 32→0`, `scale .985→1` | 700 · `--ease-expressive` |
| 700–2 000 | Command bar text | per-character `opacity 0→1` (SSR splits the prompt into `<span style="--i:n">`), delay `700 + n·38 ms`; caret blinks (1 s steps) after last char | 1 · steps |
| 2 050 | "Enviar" button | `scale 1→.96→1` + `bg-brand-700` flash | 160 · `--ease-ui` |
| 2 150 | History entry "Crea el menú…" in sidebar | `opacity`, `x −8→0`; becomes `historyItem.active` | 300 · `--ease-ui` |
| 2 200 | Menu window body | app's own `window-in` (y 6→0, scale .99→1) | 150 · `--ease-ui` (faithful) |
| 2 300–3 300 | 28 recipe cards (4 slots × 7 days) | `opacity 0→1`, `y 6→0`, `scale .96→1`; order: column-major (day by day), delay `2 300 + d·90 + s·30` | 260 · `snap` (CSS `linear()` approx §6.3) |
| 3 400–4 300 | Day cards tint `complianceTint.none → green`; status text "Sin menú" → "Cumple"; totals appear | `tint` + text cross-fade; stagger 110 ms per day | 300 · `--ease-ui` |
| 4 300 | Compliance legend row (green dot) | `opacity`, dot `scale .6→1` | 250 · `snap` |

No loop. Total visible motion ≤ 5 s. **Reduced motion:** final frame rendered statically (prompt fully typed in the bar, history entry active, all 7 days green with totals). **No-JS:** identical to reduced motion if the browser lacks CSS animation; otherwise the CSS animation still runs (it needs no JS). Hero has **zero hydration**.

---

### 2.3 Problem

**Content:** eyebrow ("problem eyebrow") → **problem statement** (H2 statement, 2–3 short sentences, set as one big paragraph) → **ManualGrid** illustration + **problem counter** (number + label) → **problem bridge line** (the curiosity gap; role: "problem bridge", e.g. "¿Y si los gramos se cuadraran solos?" — Business words it).

**1440:**
```
  EL PROBLEMA
  ┌──────────────────────────────────────────────────────┐
  │ Statement in 56px, max-w 22ch, words dim (text-muted │  left 7 cols
  │ at 35% opacity) and light up to text as you scroll   │
  └──────────────────────────────────────────────────────┘
                                         ┌───────────────────────┐
                                         │ ManualGrid 7×4 cells  │  right 5 cols, sticky
                                         │ grams scrambling      │  within the section
                                         │  112  cifras / semana │
                                         └───────────────────────┘
  ──────────────── problem bridge line (H3, centred, brand-700) ────────────────
```
**390:** statement (36 px) → ManualGrid (full width, cells 40 px) → counter → bridge line.

**Motion:**
- Statement word highlight: **scroll-progress** of the paragraph, range `entry 20% → cover 60%` (i.e. from when its top is at 80 % of viewport to when its centre passes 40 %); each word's `opacity .35 → 1` mapped to its index share of the progress. Implementation: CSS scroll-driven animation (`animation-timeline: view()`, per-word `animation-range`) where supported; fallback = whole paragraph `reveal` on enter. No JS.
- ManualGrid (on-enter, threshold .4): cells appear `reveal` stagger 18 ms; their numbers "scramble" (CSS: 3 stacked values cross-fading, 120 ms steps, 900 ms total) and settle with `danger-50`/`accent-50` tints on ~60 % of cells (never green — that reward is saved for later). Counter `count` 0 → final over 900 ms, starts at +400 ms.
- Bridge line: `reveal`, 200 ms after the counter lands.
**Reduced motion:** statement fully opaque; grid shows final tinted state; counter shows final number.
**No-JS:** same as reduced motion (all CSS; scroll-driven animation is progressive enhancement).

> The counter figure must be pure arithmetic from the illustration (e.g. 7 days × 4 meals × 4 macros = 112), not a statistic. Business confirms wording (no claims).

---

### 2.4 How it works — sticky scrollytelling (`#como-funciona`)

**Content:** eyebrow + **how-it-works statement** (H2) + intro line → 7 text steps (each: step number `01`–`07` in `tabular-nums text-brand-700`, step title H3, 1–2 sentence body, optional **detail caption** in `text-sm text-text-muted`) beside the pinned **StoryStage** → closing mid-page CTA band.

**1440:**
```
  CÓMO FUNCIONA
  H2 statement (centred, 60px)            intro line
 ┌────────────── 4 cols ─────┐ ┌──────────────────── 8 cols (sticky) ─────────────────────┐
 │ │                          │ │  top: 88px (header 56 + 32)   height: calc(100svh-120px) │
 │ █ 01  Ficha                │ │ ┌─ StoryStage (760px native) ─────────────────────────┐ │
 │ │  body…                   │ │ │ [ command bar                               ][Enviar]│ │
 │ │                          │ │ │ (Laura M. 1) (General 1)        ← dock               │ │
 │ ░ 02  Petición             │ │ │ ┌ Ficha de cliente / Calendario / PDF del menú ┐  │ │
 │ │                          │ │ │ │      active window body (state per step)        │  │ │
 │ ░ 03  Propuesta            │ │ │ └─────────────────────────────────────────────────┘  │ │
 │ │                          │ │ └──────────────────────────────────────────────────────┘ │
 │ ░ 04 …07                   │ │   [MacroBars floating card, step 4 only, bottom-left]    │
 │ (rail: 2px, border colour, │ └──────────────────────────────────────────────────────────┘
 │  fill brand-500 by scroll) │
 └───────────────────────────┘
 ─────────── mid-page CTA band: "¿Lo vemos con tus recetas?" (role) + [Solicitar demo] ───────────
```
- Inactive step text `opacity .45`; active step `opacity 1`, number turns `brand-600` and its rail dot fills.
- Stage background: `surface-muted` panel `rounded-window` with a faint dot-grid pattern (dots in `border` colour, 20 px pitch, radial mask) — echoes the logo's dots; the app window sits on it with `shadow-lg`.

**390 (and < 1024):** no sticky. Each step = text block followed by its own **static** mockup frame in that step's final state (cropped to the relevant window, e.g. step 4 shows only the 2.4-day crop + MacroBars). Each frame plays a short on-enter sequence (CSS, see §4.4). Rail becomes a step counter chip "3 / 7" on each step.

**Per-step stage states** (desktop; the same states are the mobile frames):

| Step | Stage state at rest | Entry sequence (time-based, starts when the step becomes active) |
|---|---|---|
| 01 Ficha | Window "Ficha de cliente · Laura Martín Ruiz", badge `Activo`; sections Identidad → Objetivos diarios → Alérgenos y comidas favoritas → Planificación (app order). Command bar shows "Laura Martín" (submitted). | Window `window-in`; target values `count` from 0 (stagger 90 ms); allergen chip `Frutos secos` `snap` in; Planificación line `reveal`. ~1.1 s |
| 02 Petición | Command bar typing "Crea el menú de la semana para Laura". Ficha minimizes into dock chip. | Typing 34 chars × 32 ms; ficha window `scale 1→.96, opacity→0, y→−12` (200 ms) while dock chip `Laura M. · 1` `snap`s in from where the window header was; history row appears. ~1.4 s |
| 03 Propuesta | Menu window open: toolbar (‹ Semana del lun, 2 nov › · Exportar PDF · Menú de hoy · **Crear menú de la semana** loading), ComplianceLegend, Favoritas strip (8 chips, "Yogur griego con nueces" blocked 50 % + "Contiene Frutos secos"), week grid filled; day cards show **pre-fit** totals (illustrative base-portion values) with red/orange/green tints. | Primary button shows app spinner (`spinner.sm`) 600 ms; chips in the strip pulse `accent-100` ring one by one (AI "choosing"); 28 cards fly from strip to cells (`snap`, column-major stagger 25 ms; cards repeating in the week share identical text); day tints cross-fade to pre-fit states. ~1.6 s |
| 04 Ajuste ±10 % | Same grid, **fitted**: 6 days green ("Cumple"), Sunday orange ("Macros fuera") with ghost **Recalcular** button. MacroBars card (Wednesday) floats over the bottom-left corner of the stage. | Day by day (stagger 140 ms): kcal/P totals `count` from pre-fit to fitted, tint red/orange → green; MacroBars markers slide into the band (`snap`); Sunday settles orange last and its Recalcular button gets a one-time `accent-500` ring pulse (2 × 600 ms). ~1.6 s |
| 05 Cambia una receta | Sunday Cena: "Revuelto de setas" removed, "Pavo con boniato" placed; Sunday green. | Pointer glyph moves to Sunday Cena ✕ (400 ms); card fades/shrinks (150 ms); cell shows dashed empty + `cellOver` highlight; chip lifts from Favoritas (`shadow-md`, `scale 1.03`), travels along an arc to the cell (500 ms `snap`), lands; Sunday totals `count`, tint orange → green; status "Cumple". ~1.6 s |
| 06 Retoca gramos | Recipe modal (scrim over the menu window) "Salmón al horno con patata y judías": 4 macro tiles + ingredient rows with gram inputs; note "Esta receta también está el sáb, 7 nov…" | Modal `opacity`/`scale .98→1` (180 ms); focus ring moves to "Salmón" input; value ticks 150 → 170 (3 steps, 120 ms each); tiles Kcal/Proteína `count` live; "Guardar cantidades" enables (disabled → primary) and presses; modal closes; Tuesday and Saturday cells pulse `brand-100` ring once. ~2.0 s |
| 07 PDF | Window "PDF del menú · Laura Martín Ruiz": preview (landscape calendar page) left, options panel right (Semana box, **Logo** box, Páginas a descargar with checkboxes, **Descargar**). | "Exportar PDF" press on the menu toolbar; app `LoadingCookie` flipbook plays in the preview box for 600 ms (the real loader frames); A4 page slides up (`y 24→0`, 500 ms); logo slot "Tu logo" `snap`s into the page header and the Logo box thumbnail simultaneously; checkboxes tick (stagger 60 ms); Descargar gets a subtle `brand-500` ring. ~2.0 s |

**Reduced motion:** stage switches state instantly (cross-fade 0 ms) as steps change; all sequences skipped to their end frame; MacroBars static. Rail fill still reflects position (it's informative, not decorative) but without transition.
**No-JS:** desktop shows the 7 text steps with the **mobile pattern** (per-step static final frames) — i.e. the static frames are server-rendered for all widths and the sticky stage is an enhancement that hides them at ≥ 1024 only after hydration (`data-enhanced` on the section). Fully readable.

**Mid-page CTA band** (end of section): `bg-brand-50 border border-brand-100 rounded-window`, one line (role: "mid CTA line") + primary button. Motion: `reveal`; button arrow icon nudges `x 0→3px` on hover (`ui`).

---

### 2.5 Features (`#funciones`)

**Content:** eyebrow + **features statement** (H2) → bento of **8 tiles**, one per shipped capability from `spec.md` § Features. Each tile: icon (24 px, `text-brand-600`) → title (H3 small, 20 px) → one-line body (`text-muted`) → **micro-visual** (built from mockup sub-pieces; never a full window).

| Tile | Micro-visual (reuses) | On-enter trick (≤ 900 ms) | Hover |
|---|---|---|---|
| A · Ficha con objetivos (large, 2×1) | `ClientFicha` compact: Objetivos diarios grid | 4 values `count` | values' units fade to `brand-700` |
| B · Alérgenos y lo que no le gusta | Favoritas chip blocked "Contiene Frutos secos" + chip with "⚠ No le gusta: cilantro" | blocked chip dims to 50 % (`ui` 300 ms) | blocked chip shakes 2 px once (`ui`) |
| C · Favoritas + búsqueda + importar por enlace | input with a fictitious URL (`ejemplo.com/receta/…`) → chip "Ensalada de garbanzos y atún" | URL text `reveal`, then becomes a chip (`snap`) | chip lifts `y −2`, `shadow-md` |
| D · Semana con colores de cumplimiento (large, 2×1) | `WeekMenu` mini (7 day headers only, no cells) + ComplianceLegend | days tint to final mix 5 green / 1 orange / 1 red (stagger 60 ms) | hovered day shows its totals line |
| E · Mismos gramos toda la semana | two cells "Salmón al horno · 170 g" (mar, sáb) linked by a 1 px `brand-300` dashed connector | connector draws (`stroke-dashoffset`, 500 ms) | connector colour `brand-500` |
| F · Receta ajustada por cliente | 2-row ingredient list with gram inputs, "versión de Laura" badge (`badge.brand`) | gram value ticks once | — |
| G · PDF con tu logo | mini A4 thumbnail with "Tu logo" slot | logo `snap`s into slot | page tilts `rotate 0→-1.5deg` |
| H · Varios clientes a la vez + historial | dock chips `Laura M. 2` / `Javier R. 1` / `General 1` + 2 history rows | chips `snap` in (stagger 80 ms) | active chip gets `dock.chipActive` |

**1440:** 4-col bento, 3 rows: `A(2) B C` · `D(2) E F` · `G(2) H(2)` (no "Próximamente" filler — unbuilt features are left out). Tiles `bg-surface border border-border rounded-card p-6 shadow-sm`, gap 16 px.
**390:** single column, all tiles 1×, order A B C D E F G H; micro-visuals keep full width.

**Motion:** tiles `reveal` on enter (threshold .25), stagger 70 ms by DOM order; micro-visual trick starts 250 ms after its tile settles. Hover: `translateY(-2px)`, `shadow-sm → shadow-md`, border → `border-strong`, 150 ms `--ease-ui` (pointer: fine only).
**Reduced motion:** tiles and micro-visuals static in final state; hover keeps colour/shadow change, no translate.
**No-JS:** all static (micro-visuals are SSR-rendered presentational React → HTML; tricks are CSS).

---

### 2.6 Control & trust (deep section)

**Background:** `bg-brand-900`, text `on-solid`; secondary text `brand-100` (check contrast ≥ 4.5 on brand-900 — `brand-100` on `brand-900` passes comfortably; verify with axe). Top and bottom edges: 48 px radius on the inner panel (`rounded-[2.5rem]`, inset 16 px from viewport on desktop, full-bleed on mobile) so it reads as a "room", not a band.

**Content:** **trust statement** = the tagline set as three lines in Display-S (56 → 36 px): "La IA propone" / "los macros se calculan" / "tú decides" (last line in `brand-300`, preceded by a 12 px `brand-400` dot) → 4 trust points in a 2×2 grid (icon in a 40 px `brand-800` circle with `brand-200` stroke; title; one line): (1) nothing goes to the client until you export it / you edit everything (Business words the claim — see §9), (2) planning tool, not a medical device, (3) fictitious data in every illustration on this page, (4) one founder behind the product → link "founder link" (`[PENDIENTE URL]`), styled `text-on-solid underline decoration-brand-400 underline-offset-4`.

**1440:** statement full width (centred), the 4 points in a 4-up row below.
**390:** statement left-aligned, points stacked.

**Motion:** on enter (threshold .35): line 1 `reveal`, +250 ms line 2, +250 ms line 3; then the dot `snap`s (scale 0→1) next to "tú decides" — the payoff. Points `reveal` stagger 80 ms after. Background colour itself does **not** animate (no flash).
**Reduced motion / No-JS:** static.

---

### 2.7 Demo request (`#demo`)

**Content:** eyebrow + **demo headline** (H2) + **demo subline** → left column "what happens next" (3 numbered steps, role: "demo next steps") + privacy reassurance line with lock icon → right column **form card** (`bg-surface rounded-window border border-border shadow-lg p-8`; the one place a card is right: it's an interaction container).

**1440:**
```
 ┌──── 5 cols ───────────────────┐ ┌──── 7 cols ───────────────────────────────────┐
 │ SOLICITA UNA DEMO             │ │ Nombre*            │ Email*                    │
 │ H2 demo headline              │ │ ¿Cuál es tu perfil?*  (5 radio cards, 2 rows)   │
 │ subline                       │ │ Consulta / centro (opcional)                    │
 │ ① …  ② …  ③ … (next steps)    │ │ Clientes activos al mes (opcional) [1-15][16-40]│
 │ 🔒 privacy line + link        │ │                                  [41-80][80+]   │
 └───────────────────────────────┘ │ + Añadir un mensaje (opcional)  ← disclosure    │
                                   │ ☐ consent text with link to /privacidad *      │
                                   │ [ Solicitar demo ]  full width, lg              │
                                   │ helper: "Respuesta en …" (Business)             │
                                   └─────────────────────────────────────────────────┘
```
**390:** headline → next steps (compact, horizontal 3-dot stepper) → form full width, all fields single column, `p-5`.

Background: canvas with a brand radial wash mirrored (bottom-right) so the page "ends where it began".

Form UX is specified in §5.3. **Motion:** columns `reveal`; next-steps numbers `count`-free, just `reveal` stagger 80 ms. **Reduced motion:** static. **No-JS:** see §5.3.

---

### 2.8 FAQ (`#preguntas`)

**Content:** eyebrow + **FAQ headline** → 5–7 `<details>` items (Business). Below: a quiet repeat CTA line + `button.secondary` "Solicitar demo".

**1440:** 2 columns: left 4 cols sticky headline + repeat CTA; right 8 cols accordion list. **390:** single column.
Item: `border-b border-border`, summary `py-5 text-lg font-medium` + chevron (24 px) right; answer `pb-5 text-muted max-w-[62ch]`.

**Motion:** native `<details>`; open/close animated with `interpolate-size: allow-keywords` + `::details-content` `block-size` transition 250 ms `--ease-ui` where supported (progressive); chevron `rotate 0→180deg` 150 ms. Multiple items can be open. **Reduced motion:** instant. **No-JS:** fully works (native).

---

### 2.9 Footer

**1440:** one row: BrandMark + one-line descriptor (role) | links: Privacidad · Aviso legal · Entrar | language switch | `© {year} Nyamia`. Above it, a 1 px `border` line. A small static cookie loader frame (`frame-6.svg`, 28 px, `aria-hidden`) next to © as a wink. `py-12`, `text-sm text-text-muted`.
**390:** stacked: brand → links (wrap) → language → ©.
**Motion:** none. **No-JS:** n/a.

---

### 2.10 Privacy / legal pages (`/privacidad`, `/aviso-legal`, EN equivalents)

- Same header (anchors point back to `/#…`; CTA still "Solicitar demo" → `/#demo`) and footer.
- Single reading column `max-w-[68ch]`, H1 (H2-statement size, 48 px max), "last updated / privacy_version" line (`text-sm text-muted`, `tabular-nums`), a mini table of contents (`<nav aria-label>`, links to H2s) on ≥ 1024 as a sticky left rail (3 cols), inline list on mobile.
- Body 17 px / 1.65, H2 24 px, lists with `brand-500` markers. `[PENDIENTE]` placeholders rendered in an `accent-50` / `accent-700` mark so they are visible in review and can't ship silently.
- Motion: none (legal reading). Reduced motion / No-JS: n/a.

### 2.11 404

- Header + footer. Centred block: the **LoadingCookie** flipbook (the 6 real frames, 3 s cycle, CSS only; static frame 6 under reduced motion) at 112 px → headline (role "404 headline", playful but neutral) → line → `button.primary` back to home + `button.ghost` "Solicitar demo".
- A command bar replica below the headline with the placeholder text (non-interactive, `aria-hidden`), as a nod to the app — optional.
- Canvas + brand wash. No other motion.

---

## 3. Mockup inventory (`apps/web/src/components/mockups/`)

### 3.0 Principles

- **Presentational React components, state via props.** Every mockup takes `state` (a step/keyframe id) and optional `animate` flags. Rendered by Astro **without** a client directive → static HTML (features tiles, mobile frames, no-JS, hero). Only `StoryStage` hydrates and drives them.
- **Faithful class recipes:** copy the relevant maps from `NutriBot/frontend/src/shared/styles/ui.ts` into `apps/web/src/components/mockups/appUi.ts` (`windowFrame`, `commandBar`, `historyItem`, `dock`, `ficha`, `menuGrid`, `complianceTint`, `recipesPane`, `pdfWindow`, `badge`, `button`, `input`, `alert`, `spinner`) with a header comment naming the source + date. Tokens are already identical.
- **Mockup text is localisable data**, not marketing copy: put it in `src/i18n/{es,en}.ts` under a `mockup` namespace (same key shape, parity test covers it). UI labels must match the app's Spanish strings exactly in ES (e.g. "Crear menú de la semana", "Recalcular", "Cumple", "Macros fuera", "Calorías fuera", "Exportar PDF", "Guardar cantidades", "Descargar"); EN uses honest translations with the note "Beta available in Spanish" elsewhere on the page.
- **Accessibility:** each mockup root `aria-hidden="true"` + `inert`, wrapped in a `<figure>` whose `<figcaption class="sr-only">` (or visible caption where useful) states what it shows (role: "mockup caption N"). No focusable elements inside (buttons are `<span>`s styled as buttons).
- **"Ilustración con datos ficticios"** label: a single small caption under the hero window and the stage (`text-xs text-text-muted`), not on every tile.

### 3.0.1 Shared fictitious dataset (single source: `mockup` i18n namespace + `mockups/data.ts` for numbers)

- **Client:** Laura Martín Ruiz (dock/initials "LM", chip label "Laura M."), status `Activo`, email `laura.m@example.com`. Second client for the dock: Javier R. (no data shown).
- **Targets:** Calorías 2 200 kcal · Proteína 150 g · Carbohidratos 240 g · Grasas 70 g. Alérgenos: Frutos secos. Comidas favoritas: salmón, arroz, tortilla. No le gusta: cilantro. Planificación: "4 comidas: Desayuno 1, Comida, Merienda, Cena. Desayunos y meriendas iguales toda la semana."
- **Week:** "Semana del lun, 2 nov" (2026-11-02 Monday). Day labels `lun, 2 nov` … `dom, 8 nov` (app's `toLocaleDateString('es-ES', {weekday:'short', day:'numeric', month:'short'})`).
- **Slots:** Desayuno 1 = *Avena con frutos rojos y yogur* (420 kcal, all week) · Merienda = *Requesón con fruta y canela* (260 kcal, all week).

| Día | Comida | Cena | Pre-fit kcal · P (status) | Fitted kcal · P (status) |
|---|---|---|---|---|
| lun | Bowl de pollo, quinoa y aguacate | Crema de calabaza con huevo poché | 1 840 · 112 (red) | 2 195 · 148 (green) |
| mar | Salmón al horno con patata y judías | Tortilla de espinacas con pan integral | 2 050 · 121 (orange) | 2 210 · 152 (green) |
| mié | Lentejas estofadas con verduras | Merluza con pisto | 1 790 · 98 (red) | 2 180 · 147 (green) |
| jue | Pavo a la plancha con arroz y brócoli | Crema de calabaza con huevo poché | 2 310 · 139 (green) | 2 230 · 149 (green) |
| vie | Pasta integral con atún y tomate | Tortilla de espinacas con pan integral | 2 480 · 131 (red) | 2 205 · 151 (green) |
| sáb | Ensalada de garbanzos y atún | Salmón al horno con patata y judías | 2 120 · 118 (orange) | 2 190 · 146 (green) |
| dom | Bowl de pollo, quinoa y aguacate | Revuelto de setas con tostada | 1 950 · 104 (red) | 2 160 · 126 (**orange**) → after step 05 with *Pechuga de pavo con boniato*: 2 205 · 149 (green) |

Day header line format (app): `2195/2200 kcal · P 148/150`. Status text: `Cumple` / `Macros fuera` / `Calorías fuera`.
- **Favoritas strip** (8 chips, `w-36`): the recipes above + *Pechuga de pavo con boniato* (480 kcal) + *Yogur griego con nueces* (blocked, "Contiene Frutos secos").
- **MacroBars (mié):** pre → fitted: Kcal 1 790 → 2 180 (81 % → 99 %), Proteína 98 → 147 g (65 % → 98 %), Hidratos 214 → 236 g (89 % → 98 %), Grasa 62 → 71 g (89 % → 101 %).
- **Recipe modal (Salmón al horno con patata y judías):** Salmón 150 → 170 g, Patata 200 g, Judías verdes 150 g, Aceite de oliva 10 g. Tiles Kcal 610 → 651, Proteína 38 → 42 g, Hidratos 42 g, Grasa 30 → 32.5 g (display rounded). Note: "Esta receta también está el sáb, 7 nov: al guardar cambian todos los días de la semana, para que tenga las mismas cantidades." (app string, 041).
- **History (sidebar):** HOY: "Exporta el menú de Laura", "Crea el menú de la semana para Laura", "Laura Martín"; AYER: "Recetas con garbanzos".
- **PDF:** filename shown nowhere; page header with "Tu logo" slot (dashed `border-strong` box with a generic leaf-dot monogram drawn in `brand-600`, label "Tu logo"/"Your logo"), "Laura Martín Ruiz · Semana 2–8 nov". Sections list: Calendario · 1 página, Resumen · 1 página, then 3 recipe rows "· 1 página" (+ "…" fade).

### 3.1 The components

| # | Component | Reproduces (NutriBot source) | States / keyframes | Data | Implementation |
|---|---|---|---|---|---|
| P1 | **`AppWindow`** (primitive) | `presentation/features/workspace/components/WindowFrame.tsx` + `ui.ts windowFrame` | `open` · `entering` (window-in) · `minimizing` | title, subtitle | Pure presentational TSX; header `px-4 py-3`, title `text-sm font-semibold`, subtitle `text-xs muted`, "–" / "✕" glyph actions; optional `actions` slot (status badge for ficha). No icon (the real chrome has none). |
| P2 | **`WorkspaceFrame`** (primitive) | `presentation/layout/WorkspaceShell.tsx`, `PromptHistoryList.tsx`, `Dock.tsx` | `variant: 'desktop' \| 'mobile' \| 'stage'` (stage = no sidebar); history `activeIndex`; dock chips list | history entries, dock stacks | Pure TSX. Sidebar `w-60` (scaled from w-72) with logo+Nyamia, "+ Nueva sesión" secondary, group label, rows. Mobile = app's top bar (☰ + BrandMark). |
| 1 | **`CommandBar`** | `features/workspace/components/CommandBar.tsx` + `commandBar` map | `empty` (placeholder "Pídeme algo: busca a un cliente, revisa un menú…") · `typing(progress 0–1)` · `typed` · `sent` (button press) | prompt string | SSR splits prompt into per-char spans with `--i`; CSS `typing` keyframes; in StoryStage the `progress` prop controls how many chars are visible (no timers in render). "Enviar" = `button.primary` md. |
| 2 | **`WeekMenu`** | `features/menu/MenuWindow.tsx` (+ `FavouritesStrip.tsx`, `calendar/components/ComplianceLegend.tsx`, `menuGrid`, `complianceTint`) | `empty` · `generating` (button spinner, chips pulsing) · `placed` (cards in, pre-fit tints) · `fitted` (6 green, dom orange + Recalcular) · `swap` (dom cena removed → dragged chip → green) · `focusDay(date)` (pulse rings) ; `variant: 'full' \| 'compact'` (compact = 7-dot strip + 2.4-day crop with fade, for mobile/hero-mobile) ; `headersOnly` (features tile D) | §3.0.1 week + strip | Static TSX + CSS transitions on `data-state`/`data-status` (tints, opacity). The chip-to-cell flight uses `motion` (`m.div` with `layout`/`layoutId` or explicit `x/y` from measured rects) — only inside StoryStage. Grid keeps app geometry: `grid-cols-7 gap-1.5`, `min-w-[42rem]`. |
| 3 | **`MacroBars`** | *Marketing diagram* of the ±10 % compliance rule (`domain` compliance logic, 009/040). The app shows numbers, not bars — label it "Ilustración" in its caption. Number tiles below bars mirror `MenuRecipeModal` tile style. | `before` · `after` ; `animate` | mié values | 4 rows: label (`ficha.term`), track `h-2 rounded-pill bg-surface-muted`, target band = `brand-100` segment from 90 % to 110 % with `brand-300` edge ticks, marker = 10 px dot (`danger-400` / `accent-500` / `brand-500` by status) with value `tabular-nums`. Marker moves with `transform: translateX(%)`; colour `tint`. Pure CSS transitions; values tween with the shared `useCount` hook in the island (static SSR shows `after`). Card: `bg-surface rounded-card shadow-md border p-4 w-72`. |
| 4 | **`ClientFicha`** | `features/clients/components/{ClientWindow,ClientSections,ClientPlanningSection}.tsx` + `ficha`, `badge` | `view` (default) · `counting` · `compact` (Objetivos only, features tile A) | Laura | View mode only (no inputs): sections Identidad / Objetivos diarios / Alérgenos y comidas favoritas / Planificación (omit Metadatos at stage size). Chips `badge.brand`. Actions row Editar (primary) / Eliminar (danger) shown greyed-out-scale for fidelity. |
| 5 | **`RecipeModal`** | `features/menu/MenuRecipeModal.tsx` (+ `RefitModal.tsx` as an alternate `kind`) | `closed` · `open` · `editing(step 0–3)` · `saved` ; `kind: 'quantities' \| 'refit'` (refit shows the checkbox list with locked reasons — used as a static tile/caption option) | salmon recipe | Scrim `bg-scrim` (no `backdrop-blur` — avoid glass), panel `rounded-window max-w-2xl shadow-lg`; 4 tiles `grid-cols-4` (Kcal / Proteína / Hidratos / Grasa); ingredient rows with right-aligned number "inputs" (`input.base w-24 text-right`) + "g". Live values from props. |
| 6 | **`PdfPreview`** | `features/menu/MenuPdfWindow.tsx` + `pdfWindow` map; page content per spec 041 (landscape calendar, branded header, recipe names only, day kcal legend, **no compliance colours**) | `loading` (LoadingCookie) · `page` · `logo` (logo stamped) · `ready` (checkboxes ticked, Descargar emphasised) ; `variant: 'window' \| 'thumb'` (features tile G) | PDF header data, section list | Preview = HTML "A4 landscape" sheet (`aspect-[297/210]`, white, `shadow-md`, 7-col mini table with recipe names at 7–8 px — decorative). Options panel: Semana box, Logo box (thumbnail + "Cambiar logo" secondary + "Sin logo en este PDF" checkbox), Páginas a descargar, Descargar (primary). Cookie loader: `<img>` flipbook of `packages/brand/assets/frame-*.svg` via CSS steps. |
| C1 | **`HeroProduct`** (composite) | WorkspaceShell + CommandBar + MenuWindow | CSS timeline §2.2 | — | **Astro component, zero JS.** Renders `WorkspaceFrame` (desktop / mobile variants by CSS breakpoint, both in DOM, one `hidden`) + `CommandBar` + `AppWindow` + `WeekMenu state="fitted-all-green"` with `.hero-anim` classes and per-element `--delay` custom properties. |
| C2 | **`StoryStage`** (composite, the only scroll island) | All of the above in `WorkspaceFrame variant="stage"` | step 0–6 (§2.4) | all | React island `client:visible`, desktop only (§4). Owns `step`, derives every child's `state` from it; plays entry sequences with `motion` (`LazyMotion` + `domAnimation`, `m.*`), `useCount` hook for numbers, `useReducedMotion()` to jump to end states. |
| I1 | **`ManualGrid`** (illustration, not an app screen) | — (problem section) | `scramble` → `settled` | 28 gram values | Pure CSS/Astro. Neutral "sheet" look (`surface`, `border` hairlines, `tabular-nums` 13 px), deliberately *not* app chrome and not imitating any spreadsheet brand. |

Count: **6 app mockups** (CommandBar, WeekMenu, MacroBars, ClientFicha, RecipeModal, PdfPreview) + 2 primitives + 2 composites + 1 illustration. Drag & drop, edit grams and Recalcular are **states** of WeekMenu/RecipeModal, not separate components.

---

## 4. Scrollytelling technical approach

### 4.1 Structure
```html
<section id="como-funciona" data-story>
  <header>…H2…</header>
  <div class="lg:grid lg:grid-cols-12 lg:gap-6">
    <ol class="lg:col-span-4" data-steps>                <!-- static Astro -->
      <li data-step="0" class="min-h-[72svh] lg:min-h-[78svh] flex items-center"> text + <figure class="lg:hidden-when-enhanced">static frame</figure></li>
      … 7 items …
    </ol>
    <div class="hidden lg:block lg:col-span-8">
      <div class="sticky top-[88px] h-[calc(100svh-120px)]">
        <StoryStage client:visible steps={…} />           <!-- the island -->
      </div>
    </div>
  </div>
  <MidCta />
</section>
```
- **Container height is natural**, not artificial: 7 steps × ~78svh ≈ 5.5 viewports at desktop. No spacer divs, no scroll hijack; the stage simply sticks while the text column scrolls past.
- First and last steps get extra top/bottom padding (`pt-[20svh]`, `pb-[30svh]`) so step 01 activates when the stage is fully pinned and step 07 stays active long enough to see the PDF before the stage un-sticks.

### 4.2 Progress → state
- **Active step** = the step whose box crosses the viewport's horizontal centre line: one `IntersectionObserver` with `rootMargin: '-50% 0px -50% 0px'`, `threshold: 0` over `[data-step]`. On intersect → `setStep(i)`. This is discrete and robust (no per-frame work).
- **Entry sequence** of a step plays **time-based** once when it becomes active (§2.4 table). Sequences are written as *transitions toward the step's target state*, so:
  - Scrolling fast past several steps → state jumps to the latest step; in-flight animations are retargeted (motion handles interruption) and intermediate sequences are skipped (`if (step - prevStep > 1) jumpToEnd`).
  - Scrolling **back** → state reverts to the earlier step's rest state with a quick 200 ms cross-fade, never replaying the long sequence in reverse.
  - Each step's rest state is a pure function `stageStateFor(step)`; animations only decorate the path. This makes it testable (Vitest: `stageStateFor(3)` has 6 green days and dom orange).
- **Scroll-linked (scrubbed) only for the progress rail:** `useScroll({ target: stepsRef, offset: ['start center', 'end center'] })` → `scaleY` of the rail fill (`origin-top`). Rail dots fill on `step >= i`.
- **Stage fit:** stage designed at 760 × 560 px native. A `ResizeObserver` on the sticky box sets `--stage-scale = min(1, w/760, h/580)`; the stage is `transform: scale(var(--stage-scale))` with `transform-origin: top center`. At 1440×900 scale = 1; at 1024×700 ≈ 0.86 (min font in grid ≈ 9.5 px — decorative, captions carry meaning).
- **Enhancement switch (zero CLS, never a blank pane):**
  - `@media (scripting: enabled)` at ≥ lg: the sticky column is shown with the **step 01 rest state** server-rendered (StoryStage SSR output), and the per-step static frames are hidden. Hydration then takes over the same DOM (no layout change) and sets `data-enhanced="true"` on `[data-story]`, which enables inactive-step dimming.
  - `@media (scripting: none)`: the stage column is hidden and the per-step static frames are shown at every width (the mobile pattern) — fully readable without JS.

### 4.3 Reduced motion
`useReducedMotion()` true → no entry sequences, state swaps with 0 ms, rail updates without transition, `useCount` returns the final value immediately. CSS side: `@media (prefers-reduced-motion: reduce)` sets transition/animation durations to `0.01ms` (same global rule as the app's `index.css`).

### 4.4 Mobile fallback (< 1024)
- No island hydrates (the stage column is `display:none`, so `client:visible` never fires).
- Each step's `<figure>` contains the relevant mockup **cropped** to its subject at the step's rest state (e.g. 03 → `WeekMenu compact` + Favoritas strip; 04 → `WeekMenu compact` + `MacroBars`; 06 → `RecipeModal` panel without scrim; 07 → `PdfPreview` page + Logo box).
- On-enter mini-sequences via CSS only: a tiny shared vanilla script (`src/scripts/inview.ts`, ~0.6 KB) adds `data-inview` to `[data-reveal]` elements with one IntersectionObserver (threshold .35, once). CSS transitions keyed on `[data-inview]` run: cards `snap` in, tints change from pre-fit to fitted (for step 04 the SSR markup carries both values; CSS swaps visibility), counters use the CSS `@property --n` integer trick (`counter-reset: n var(--n)`; final value present as text for browsers without `@property`).
- Same `inview.ts` powers `reveal` everywhere on the page (features, trust, demo) — it is the site's only non-island script besides the header script.

---

## 5. Header, CTA hierarchy, form UX

### 5.1 Header behaviour
- `position: sticky; top: 0; z-index: 30`. Initially transparent on the hero wash.
- **Condense** when `scrollY > 24`: a passive-scroll listener throttled with `requestAnimationFrame` toggles `data-condensed` on `<header>` (vanilla, `src/scripts/header.ts`). Condensed: height 56 px (52 mobile), `bg-canvas/95`, `border-b border-border`, `shadow-sm`. No blur.
- **Active anchor:** one IntersectionObserver over the 4 target sections (`rootMargin: '-40% 0px -55% 0px'`); the matching link gets `aria-current="location"` + active style. Hero/problem → none active.
- Anchor click: native jump; `scroll-margin-top: 72px` on sections; `html { scroll-behavior: smooth }` only inside `@media (prefers-reduced-motion: no-preference)`. No Lenis in v1 (not needed; saves JS) — Frontend may revisit.
- Focus: skip link → logo → anchors → language → Entrar → CTA. Visible ring `ring-2 ring-brand-500 ring-offset-2 ring-offset-canvas`.

### 5.2 CTA visual hierarchy
1. **Primary — "Solicitar demo"** (role: primary CTA): the only solid `brand-600` button style on the page (`button.primary`, hover `brand-700`; lg in hero/CTA band/form, md header, sm mobile header). Trailing arrow icon on hero/CTA band (nudges 3 px on hover). Appears: header (always), hero, mid-page band, FAQ footer line, form submit.
2. **Secondary — "Ver cómo funciona"** (hero only): `button.secondary` lg.
3. **Tertiary — "Entrar"**: `button.ghost` sm in header/footer; never competes with the primary.
- No accent-orange buttons on the page (orange stays the AI/attention semantic, as in the app).

### 5.3 Demo form UX
**Field order** (contract in `spec.md`): 1 Nombre* → 2 Email* → 3 Perfil* (`role`, 5 **radio cards** in a `fieldset`/`legend`, 2-col grid desktop / 1-col mobile; selected card `border-brand-500 bg-brand-50` + check dot) → 4 Consulta o centro (optional) → 5 Clientes activos al mes (optional, segmented radio group of 4 pills `1-15 · 16-40 · 41-80 · 80+`, deselectable via a "Prefiero no decirlo" implicit null — clicking the selected pill clears it) → 6 "+ Añadir un mensaje" disclosure revealing the textarea (optional, counter `n/1000` appears at 800+) → 7 Consent checkbox* with link to privacy (`target="_blank" rel="noopener"`, so typed data is never lost and nothing is stored in the browser) → honeypot `website` (visually hidden off-screen, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden`) → Submit. Hidden: `locale`, `privacy_version`.
- Labels always visible above inputs (`formField.label`); "(opcional)" suffix in `text-muted` rather than asterisks for required (required fields marked by `required` + an `aria-describedby` legend "Todos los campos son obligatorios salvo los indicados").
- `autocomplete`: `name`, `email`, `organization`. `inputmode="email"` for email. `enterkeyhint="send"` on last text field.

**Inline validation timing**
- Do **not** validate while the user is first typing. Validate a field **on blur** (only if it was changed or the user tabbed through a required field), then **on input** while it is in error so the error clears the moment it's fixed (reward).
- Valid-after-blur → small 16 px `brand-600` check icon fades in at the field's right edge (`ui` 150 ms, `scale .8→1`). The positive mirror of the error state; makes progress visible.
- Error: `input.state.error` (`border-danger-400`), message under the field in `formField.error` (`text-xs text-danger-600`) with a 14 px alert icon, linked via `aria-describedby`, `aria-invalid="true"`.
- On submit with errors: validate all, focus the first invalid field, and announce a summary in a polite live region ("Revisa 2 campos").

**Submit states**
- `idle` → `submitting`: button `loading` (app Spinner `sm` + label role "submitting"), `aria-busy`, all inputs `readonly`; double-submit impossible (button disabled + in-flight guard).
- `202` → **success** (below).
- `422` → map `fields[]` to inline errors (generic per-field message from i18n), focus first.
- `429` → `alert.accent` above the button: "too many requests" role text, reading `Retry-After` into minutes if present; data kept.
- `413` / `500` / network → `alert.error` with "Reintentar" (`button.secondary` sm) — data kept, nothing cleared.
- All alerts in a `role="status"` (429) / `role="alert"` (errors) region.

**Success micro-animation (the final reward)**
- The form card's content cross-fades (200 ms) to a success panel of the same card; card height animates to the new content (`motion` `layout` on the card, or CSS `interpolate-size`), centred:
  1. A **day card** in the app's style (`menuGrid.day`, 160 px wide) labelled with today's date and status text "Sin menú" (`complianceTint.none`) → after 250 ms it tints to `complianceTint.green`, status text swaps to "Cumple", and a 40 px circle check draws inside it (`stroke-dashoffset` 0.5 s `--ease-expressive`), with a single `snap` scale 0.96 → 1. (Echoes the whole page's metaphor: you're "in target".)
  2. Success headline (role: "form success title", e.g. "Solicitud recibida") + next-step line + secondary link "Ver cómo funciona otra vez" (optional).
- Focus moves to the success heading (`tabindex="-1"`), announced via `role="status"`.
- Reduced motion: success panel appears with the day already green and the check drawn.

**No-JS:** the API accepts JSON only, so the native form cannot submit. The form renders (fields visible so users understand what's asked) with the submit button `disabled`, and a `<noscript>` notice above it (role: "form no-JS notice") offering the founder contact/profile link (`[PENDIENTE URL]`). → **Founder decision needed** (§9).

---

## 6. Tokens, typography, backgrounds, iconography

### 6.1 Typography (Inter Variable only)
Proposed website-only additions to `tokens.css` (marked block; Tailwind v4 generates `text-display` etc.):

| Token | Value | Weight / tracking / line-height | Use |
|---|---|---|---|
| `--text-display` | `clamp(3rem, 1.9rem + 4.4vw, 5.5rem)` (48→88) | 680 / −0.035em / 1.02 | Hero headline |
| `--text-statement` | `clamp(2.25rem, 1.65rem + 2.4vw, 3.75rem)` (36→60) | 650 / −0.03em / 1.06 | H2 statements, trust lines (Display-S = statement ×0.93) |
| `--text-title` | `clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem)` (22→28) | 600 / −0.015em / 1.2 | H3, step titles, tagline |
| `--text-lead` | `clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)` (17→19) | 400 / 0 / 1.6 | Body, section intros |
| (Tailwind default) `text-sm` / `text-xs` | 14 / 12 | — | captions, eyebrows, mockup UI (keep app sizes inside mockups) |

`font-feature-settings: 'cv11', 'ss01'` optional (Inter alternate 1/l) — Frontend's call; `tabular-nums` mandatory on any number. Body text max 62–68ch. Headline max ~16ch per line, `text-wrap: balance`; body `text-wrap: pretty`.

### 6.2 Spacing & radii
- `--spacing-section: clamp(4.5rem, 2.6rem + 7.5vw, 11rem)` → `py-section`.
- Stack spacing: eyebrow→H2 16 px; H2→lead 20 px; lead→visual 56 px (desktop) / 40 px (mobile).
- Radii: buttons/inputs `rounded-control`; tiles/form card inner boxes `rounded-card`; product windows, form card, CTA band, stage `rounded-window`; pills/badges `rounded-pill`; trust "room" `rounded-[2.5rem]` (only bespoke value; consider `--radius-section: 40px` in the website block).
- Shadows: `shadow-sm` resting tiles, `shadow-md` hovered/floating (MacroBars card, dragged chip), `shadow-lg` product windows & form card. No stacked glows.

### 6.3 Motion tokens
Existing: `--ease-ui` (150 ms UI), `--ease-expressive` + `--duration-reveal: 600ms`. Proposed additions (website block):
- `--ease-snap: linear(0, 0.42 9%, 0.83 19%, 1.04 29%, 1.08 35%, 1.04 45%, 0.99 60%, 1.005 75%, 1)` — CSS spring-ish approximation (≈ stiffness 380 / damping 30); fallback `--ease-expressive` where `linear()` is unsupported (use `@supports`).
- `--duration-snap: 420ms`, `--duration-count: 900ms`.
- JS mirror `apps/web/src/lib/motion.ts`: `EASE_EXPRESSIVE = [0.16, 1, 0.3, 1]`, `EASE_UI = [0.2, 0, 0, 1]`, `SPRING_SNAP = { type: 'spring', stiffness: 380, damping: 30, mass: 1 }`, stagger constants (`STAGGER_REVEAL = 0.07`, `STAGGER_CELL = 0.025`).
- **Animate only `transform`, `opacity`** — exception: compliance `tint` (background/border colour, 300 ms) because the colour change *is* the message; it's on small elements and composited cheaply enough. No height/width animation except the success card and FAQ (native size interpolation).

### 6.4 Backgrounds
- Page: `bg-canvas`.
- **Brand wash** (from the app's `body`): hero `radial-gradient(1200px 520px at 15% -120px, var(--color-brand-100), transparent 70%)`; demo section mirrored at `85% 110%`. Optional `accent-50` 480 px radial behind the hero command bar (the single orange spark, ≤ 60 % opacity).
- Stage panel: `bg-surface-muted` + dot grid `radial-gradient(var(--color-border) 1px, transparent 1.5px) 0 0 / 20px 20px`, masked with a radial fade.
- Features section: on `canvas`, tiles `bg-surface` + `border` (same relation as app windows on the app body).
- Control & trust: `bg-brand-900` room (§2.6).
- Forbidden (skill): purple/indigo, neon gradients, glass stacks, stock photos.

### 6.5 Iconography
- Inline SVG, lucide-style: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.75"`, round caps/joins; sizes 16/20/24/40-in-circle. One source map `src/components/ui/icons.ts` (`name → path data`) consumed by `Icon.astro` (static) and `Icon.tsx` (mockups/form). Paths may be adapted from Lucide (ISC licence — keep the licence text in `apps/web/THIRD_PARTY_NOTICES` or the file header) or drawn; no icon font, no CDN.
- Set needed (~20): `user-round` (ficha), `shield-alert` (allergens), `heart` (Favoritas), `link` (import), `calendar-days` (week), `target` (±10 %), `repeat` (same grams), `sliders-horizontal` (adjusted recipe), `file-text` (PDF), `layers` (multi-client), `history`, `check`, `check-circle`, `alert-circle`, `lock`, `arrow-right`, `chevron-down`, `menu`, `x`, `external-link`, `sparkle` (only next to "La IA propone", `accent-500`).
- Inside app mockups, keep the app's text glyphs (`–`, `✕`, `‹`, `›`, `☰`, `⚠`) — that's what the real UI renders.

---

## 7. Performance & accessibility guardrails

**What hydrates (and nothing else):**
| Island | Directive | Why |
|---|---|---|
| `StoryStage` | `client:visible` (desktop only — hidden column on mobile never intersects) | scroll-synced state + motion |
| `DemoForm` | `client:visible` | validation, submit, success |
| — | vanilla `<script>` modules: `header.ts` (~1 KB), `inview.ts` (~0.6 KB) | condense/active anchor; reveal triggers |
Hero, problem, features, trust, FAQ, footer, legal, 404: **zero JS** (HTML + CSS).

**JS budget (≤ 120 KB gzip on first load):** first load on `/` = header + inview scripts only (~2 KB) — both islands are below the fold. When hydrated: React 19 runtime (~60 KB) shared once + `motion` via `LazyMotion`/`domAnimation` + `m` components (~18 KB; **do not** import `motion` full bundle) + island code (~15 KB) ≈ 95 KB. The form island must not import `motion` (CSS for the success animation) so mobile users who never see the stage pay React + form only. QA measures.

**LCP:** the hero headline (text) is the LCP element; HeroProduct must not delay it (no images in hero except the 32 px logo; mockups are HTML). Fonts: preload Inter variable latin subset only; `font-display: swap`.
**CLS ≤ 0.05:** every mockup has fixed intrinsic dimensions (aspect-ratio boxes); hydration does not change layout (§4.2); the success card height change happens after user action (doesn't count toward CLS).
**Runtime:** no scroll listeners doing layout reads except the rAF-throttled header check; IntersectionObserver for everything else; `will-change: transform` only during active sequences; pause/stop all CSS animations off-screen (`animation-play-state` via `[data-inview]`; the 404 cookie loop pauses under reduced motion).

**Accessibility:**
- Landmarks: `header`, `nav` (header anchors, `aria-label`), `main`, one `h1` (hero), `section`s labelled by their H2, `footer`.
- **Focus order** = visual order; mockups are `aria-hidden` + `inert` so tabbing skips them; the sticky stage never traps focus. Step list is an `<ol>` (screen readers get "1 of 7").
- **Decorative mockups:** `<figure aria-hidden>` is wrong (it hides the caption) → pattern: `<figure><div aria-hidden="true" inert>…mockup…</div><figcaption class="sr-only">mockup caption</figcaption></figure>`. Step text already explains each state, so captions stay short.
- Colour is never the only signal: compliance states always have status text ("Cumple" / "Macros fuera" / "Calorías fuera") as in the app; form errors have icon + text.
- Contrast pairs from the skill; check `brand-100`/`brand-200` on `brand-900`, `text-muted` on `surface-muted` (stage captions), `accent-700` on `accent-50` (`[PENDIENTE]` marks).
- Targets ≥ 24×24 px (WCAG 2.2 2.5.8); radio cards and pills ≥ 44 px tall on mobile.
- Motion: everything honours `prefers-reduced-motion`; nothing auto-moves for > 5 s (2.2.2); no flashing.
- Language: `<html lang="es">` / `lang="en"`; mockup content inside EN pages that stays Spanish (none expected — mockup data is localised) would need `lang="es"`.
- Form: labels, `fieldset/legend` for radio groups, `aria-describedby` for hints/errors, `aria-invalid`, live regions as in §5.3, success heading focus.

---

## 8. Implementation order (Frontend)

1. **Tokens & base:** add the website-only tokens (§6.1–6.3) to `packages/brand/tokens.css`; global CSS (canvas, brand wash, reduced-motion rule, `@media (scripting)` helpers, focus ring), self-hosted Inter; `lib/motion.ts`.
2. **Primitives:** `ui/Icon` (+ icon map), `ui/Button` (ui.ts variants), `ui/Section` (eyebrow + statement + spacing), `scripts/inview.ts`, `scripts/header.ts`.
3. **Layout:** `BaseLayout` (head/SEO slots, skip link), `Header` (sticky/condense/active/mobile sheet), `Footer`; i18n wiring with Business's keys (+ `mockup` namespace).
4. **Mockup foundation:** `mockups/appUi.ts` (copied class maps), `mockups/data.ts` (numbers §3.0.1), `AppWindow`, `WorkspaceFrame`, `CommandBar`.
5. **`WeekMenu`** (full + compact + headersOnly; all states as static props) — the hardest and most reused piece; review against `MenuWindow.tsx` before moving on.
6. **`HeroProduct`** (CSS timeline) + **Hero** section → first visual review (1440/390, reduced motion).
7. **Problem** section + `ManualGrid`.
8. **`ClientFicha`, `MacroBars`, `RecipeModal`, `PdfPreview`** (static states).
9. **How it works:** static steps + per-step frames (mobile/no-JS path) first → then **`StoryStage`** island (IO step tracking, `stageStateFor`, sequences, rail, scale) → mid-page CTA.
10. **Features** bento (reusing sub-states) + **Control & trust**.
11. **`DemoForm`** island (validation, states, success animation) + `#demo` section.
12. **FAQ**, **privacy/legal pages**, **404**.
13. Tests hooks for QA: `data-testid` on step items, stage root (`data-step`), form states; reduced-motion e2e asserts end states; then UX/UI visual review (phase 3).

---

## 9. Decisions & open points for the founder

1. **Pre-fit red/orange days are illustrative.** The app generates and fits in one go (the user never sees the "before"); the page shows base-portion totals before the fit to make the ±10 % fit visible. Caption: "Ilustración con datos ficticios". OK?
2. **One day stays orange after the fit** (honest: the solver may not reach every target) and is fixed by the professional in step 05. This is a deliberate trust signal — confirm you're happy showing it.
3. **MacroBars is a diagram**, not an app screen (the app shows numbers and colours, not bars).
4. **"Nothing is final until you approve it"** (spec §6): in the product, a generated menu is saved straight into the client's calendar (with an overwrite warning). Business should phrase control as "you edit everything / nothing reaches the client until you export the PDF", not "approval step".
5. **No-JS form:** cannot submit (JSON API). Proposed: disabled submit + notice with the founder profile link. Alternative: accept `application/x-www-form-urlencoded` in the API (Backend change, contract update).
6. **PDF logo:** shown as a generic "Tu logo" slot, not a made-up clinic brand (avoids implying customers).
7. **Mockup labels in EN pages** are translated (product is Spanish-only in beta) — the page states "Beta available in Spanish" elsewhere. Alternative: keep Spanish UI inside EN mockups for honesty; your call.
