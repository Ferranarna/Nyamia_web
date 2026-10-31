# 001 · Landing v1 + demo request — Copy review

_Owner: `@nyamia-web-business`. Date: 2026-10-30. Copy lives in `apps/web/src/i18n/es.ts` (original) and `en.ts` (adaptation, same keys, parity checked)._

Sources checked: `NutriBot/.claude/spec/business/roadmap.md` (v2, 2026-10-21), `NutriBot/.claude/spec/constitution/roadmap.md` (Done up to 042, 2026-10-30), `NutriBot/.claude/spec/constitution/mission.md`, `NutriBot/.claude/spec/regulatory/eu-snapshot.md`, and the app's Spanish UI strings in `NutriBot/frontend/src/presentation` + `application/workspace/windowLabels.ts` + `domain/mealSlot.ts` + `domain/allergen.ts` (for the mockups).

---

## 1 · Message hierarchy (problem → promise → proof → CTA)

The whole page follows one arc: **you balance menus by hand → Nyamia does the maths → here it is working, step by step → you stay in control → ask to see it.** Each section answers one question.

| # | Section | Question it answers | Problem | Promise | Proof | CTA |
|---|---------|---------------------|---------|---------|-------|-----|
| 1 | Header | Where am I / how do I act? | — | — | — | "Solicitar demo" (primary, always visible) · "Entrar" (secondary, existing users) |
| 2 | Hero | What is this, for whom? | Implicit in the headline: menus balanced by hand | **"Deja de cuadrar menús a mano."** + "La IA propone, los macros se calculan, tú decides." + sub with the concrete mechanism (Favoritas, gramos, ±10 % kcal/proteína/hidratos/grasa) | Animated window: command bar types `crea el menú de la semana para Laura` → week assembles → days go green | "Solicitar demo" · "Ver cómo funciona" (→ `#como-funciona`) · note "Demo en directo con datos ficticios" (EN: "Available in Spanish · …") |
| 3 | Problem | Is this my pain? | **"Cada cliente, una hoja de cálculo."** Four pains: gram by gram, one swap breaks the day, repeat per client, then make it presentable | Closing line: "Tu trabajo es decidir el plan, no hacer cuentas." | Spreadsheet mockup (`mockup.problemSheet`) with a red "Fuera" total | none (bridge to 4) |
| 4 | How it works | How does it actually work? | — | **"De la ficha al PDF, en una ventana."** | Six pinned steps, each a real product moment: ficha → petición → la IA propone (Favoritas) → los macros se calculan (±10 %, colours) → tú decides (drag & drop, gramos, Recalcular) → PDF con tu logo. Steps 3–5 literally spell the tagline. | none inside the pin; secondary CTA after the pin (UX decides) |
| 5 | Features | What exactly do I get today? | — | **"Lo que ya hace Nyamia."** + "Todo lo que ves aquí ya funciona en la app." | 8 cards, all Done in product roadmap 038–042 (see § 4) | optional inline link to `#demo` |
| 6 | Control & trust | Can I trust an AI with this? | Objection: "IA inventa números / me sustituye / mis datos" | **"Tú decides. Siempre."** | Four facts: proposal not verdict; the AI doesn't calculate grams; no client name/email to the model; planning tool, not a medical device. Fictitious-data note. No founder block (founder decision, Q2/Q11). | — |
| 7 | Demo (`#demo`) | What do I do now, and what happens after? | — | **"Mira cómo se cuadra una semana."** Live demo, fictitious clients, ficha → PDF | "Qué pasa después" in 4 steps (no time promises) | **Form** (primary conversion point) |
| 8 | FAQ | Remaining objections | who / AI scope / precision / own recipes / data / language+device (price FAQ removed, Q6) | — | Answers restate verifiable facts only | (UX may add a link back to `#demo`) |
| 9 | Final CTA (optional band) | Last nudge | — | "Tu próxima semana de menús, ya cuadrada." | — | "Solicitar demo" |
| 10 | Footer | Legal, language, login | — | — | Disclaimer "no es un producto sanitario"; "Esta web no usa cookies." | "Entrar" |

`finalCta` is a proposal for UX/UI: a short band between FAQ and footer. If `ux.md` places the demo form last instead, the key can stay unused.

### Headline choices (≤ 8 words)

| Key | ES | EN | Why |
|-----|----|----|-----|
| `hero.headline` | Deja de cuadrar menús a mano. (5) | Stop balancing meal plans by hand. (6) | It is the [DECIDIDO] promise, verbatim from the business roadmap ("que dejen de cuadrar a mano los menús"). Outcome first, AI second. |
| `hero.tagline` | La IA propone, los macros se calculan, tú decides. | AI proposes, macros are calculated, you decide. | [DECIDIDO] framing, unchanged. |
| `problem.headline` | Cada cliente, una hoja de cálculo. | Every client, another spreadsheet. | Recognisable image for the ICP; no numbers. |
| `howItWorks.headline` | De la ficha al PDF, en una ventana. | From client profile to PDF, in one window. | Names the start and the deliverable; matches the window-based app. |
| `features.headline` | Lo que ya hace Nyamia. | What Nyamia does today. | "ya" = honesty signal: everything listed ships. |
| `control.headline` | Tú decides. Siempre. | You decide. Always. | Closes the tagline loop; answers the AI-distrust risk named in the business roadmap. |
| `demo.headline` | Mira cómo se cuadra una semana. | Watch a week fall into place. | Concrete reward of the demo, not "contact us". |

Alternatives considered for the hero: "Menús que cuadran con los macros." (weaker: describes the output, not the relief), "Tus recetas. Sus macros. Cuadrados." (clever, less clear at 3 s).

---

## 2 · CTA strategy

- **One primary action everywhere: "Solicitar demo" / "Request a demo"** → `#demo`. Same label in header, hero, final band and form submit, so the visitor never wonders whether they're different actions.
- **Placements:** sticky header (always), hero (primary + secondary "Ver cómo funciona"), after the scrollytelling pin (UX's choice: inline link or button), the demo section itself, optional final band, 404 page.
- **Secondary actions are deliberately quieter:** "Ver cómo funciona" (scroll), "Entrar" (header + footer, for existing accounts only — there is no public signup).
- **No competing CTAs:** no newsletter, no "contact us", no price page, no social follow, no LinkedIn/founder link (Q2/Q11).
- **Friction reducers next to the form:** "Demo en directo con datos ficticios", "Qué pasa después" (3 steps: email to set the date → you pick day and time → live demo), no price mention, EN: "Available in Spanish" (hero note) + "The app and its PDFs are in Spanish. Demos can be held in English." (demo section — so EN visitors self-qualify before submitting).
- **Success state** ("Solicitud recibida. Ahora, a ponerle fecha.") says the next step is fixing the demo date by email directly with the requester — energetic, but no time window (no notification pipeline exists until 004; the founder reads leads from the DB).

---

## 3 · Form field rationale (contract in `spec.md` kept as is)

| Field | Required | Why it's there | Copy notes |
|-------|----------|----------------|------------|
| `name` | yes | To address the person in the reply | "Nombre y apellidos" |
| `email` | yes | The only channel to reply | Help text states the single use ("Solo se usa para responder a tu solicitud") — reduces hesitation |
| `role` | yes | **Qualification**: separates ICP a/b/c from coaches/others. The one question that decides priority | Labels are by profile, not by "clinical" use — see claims C7 |
| `practice_name` | no | Context; lets the founder look the practice up before the call | Optional, no example brand name (to avoid looking like a real business) |
| `client_volume` | no | Qualification signal (who feels the pain most) and demo tailoring | Help: "Ayuda a preparar una demo a tu medida." Empty option = "Sin especificar" → `null` |
| `message` | no | What they want to see; reveals use case | Example deliberately avoids pathologies |
| `consent` | yes | RGPD art. 6.1.a | Covers both purposes stated in the notice: reply to the request **and** contact about Nyamia |
| `website` | honeypot | Abuse | Label "Deja este campo vacío" for the rare screen reader that reaches it |
| `locale`, `privacy_version` | hidden | Contract | `privacy_version` must equal `privacy.version` in the i18n file (`2026-10-30`) |

### Proposals (not applied — need owner decision)

- **P1 (Backend + Business):** keep the enum key `dietitian_clinical` but note its label is "Dietista-nutricionista generalista" (see C7). If the key is ever renamed, `dietitian_generalist` would match the label. No change for v1.
- **P2 (Frontend):** 429 copy uses `{minutes}` when `Retry-After` is present (`demo.errors.tooManyRequestsRetry`), else the generic `tooManyRequests`. Round up seconds → minutes.
- **P3 (Frontend):** on 422, map `fields[]` to the per-field `validation.*` messages and show `validation.summary` at the top; fall back to `errors.invalid`.
- **P4 (Business, later):** if lead volume grows, consider adding "¿Cómo conociste Nyamia?" (optional). Not in v1: no evidence it's needed and every field costs conversion.
- **P5 (UX):** `finalCta` band between FAQ and footer (see § 1).

---

## 4 · Features shown vs product roadmap (only Done)

| Card | Product source (Done) |
|------|------------------------|
| Ficha de cliente (targets, allergens, dislikes, meal structure) | 038 · Client window; 039 (allergens multi-choice + "alimentos que no le gustan"); 040 ("Planificación" meal structure) |
| Favoritas: search + save from link with conflict review | 039 · Recipe library (search, save link with allergen/dislike review modal); 024 URL import |
| Menú semanal con colores | 040 · compliance colours ("Cumple / Macros fuera / Calorías fuera") |
| Mismos gramos toda la semana | 041 · same grams per recipe per client week |
| Receta ajustada a cada cliente | 040 · recipe modal with live macros that saves the client's version |
| PDF con tu marca | 041 · PDF window (logo, sections calendar/summary/recipes, Descargar); logo from 028 |
| Varios clientes a la vez + historial | 036 (prompt history, browser-only) + 037 (window manager, dock) |
| Todo en castellano | 042 · translation reliability ("Sin traducir") |

Left out on purpose: **PDF email delivery** (029 code exists but is gated off — business roadmap: "no prometer en público"), shopping lists, LLM client extraction from prompt, agent-backed free-text prompts, LangGraph, English app, mobile app.

---

## 5 · Claims review checklist

Every risky phrase considered and what was written instead.

| # | Avoided | Why | Written instead |
|---|---------|-----|-----------------|
| C1 | "Ahorra X horas a la semana", "10× más rápido" | No measured data; business roadmap forbids unmeasured time-saving figures | Time framed as the problem: "Cuadrar un menú … lleva horas." |
| C2 | "Mejora la adherencia / los resultados de tus pacientes", "pierde peso", "rendimiento" | Health outcomes forbidden (mission, MDR risk) | No outcome claims at all |
| C3 | "Pacientes" | Clinical connotation; app UI says "clientes"; Gemini terms forbid clinical-practice use (eu-snapshot) | "clientes" everywhere |
| C4 | "Clínico", "uso clínico", "para patologías", examples with diabetes/celiaquía | MDR rule 11 risk; business roadmap: "No hablar de patologías en público" | Message example: "cinco comidas al día"; allergen examples only |
| C5 | "La IA calcula tu plan nutricional", "IA precisa" | The AI does not calculate; the deterministic solver does | "Un cálculo determinista, no la IA, ajusta los gramos…" |
| C6 | "Siempre cuadra", "100 % preciso", "garantizado" | Solver can fail; days stay orange/red | "±10 %" + "Si … un día no encaja, queda marcado en naranja o rojo para que lo revises" |
| C7 | Role label "Dietista-nutricionista clínico" | Avoid inviting clinical-practice use while the Gemini clause is pending a lawyer (business roadmap checklist item 7) | "Dietista-nutricionista generalista" (enum `dietitian_clinical` unchanged) |
| C8 | "La IA no ve tus datos", "tus datos nunca salen de Europa", "el proveedor no entrena con tus datos" | Business roadmap: don't say the first; the "no training" claim is only true on Gemini's paid tier, which is not yet confirmed active; hosting location unverified | "El modelo de IA recibe objetivos, restricciones y recetas. No recibe el nombre ni el email del cliente." (backed by 038 privacy test T3) + "datos de cada cuenta separados" (031) |
| C9 | "Cumple RGPD", "seguro al 100 %", "certificado" | No audit/certification; regulatory snapshot unverified | No compliance badges |
| C10 | "Envía el PDF a tu cliente desde Nyamia" | 029 email is gated off | "Eliges las secciones y lo descargas." / "Al cliente solo llega el PDF que tú exportas." |
| C11 | "Somos", "nuestro equipo", "escríbenos", "contáctanos" | Voice [DECIDIDO] | Neutral product voice; "Te llega un email … para cerrar la demo directamente contigo"; no founder block (Q11) |
| C12 | Testimonials, logos, "usado por X nutricionistas", star ratings | Fake social proof forbidden | None |
| C13 | "Gratis", "40 €/mes", "precio Founder" | Price provisional, D3 open | Price not mentioned anywhere on the page (Q6) |
| C14 | "Responderemos en 24 h" | No notification pipeline (004 backlog); can't guarantee SLA | "Te llegará un email … para cerrar contigo el día y la hora" — no time window (Q7) |
| C15 | "Disponible en inglés" / EN app mockups implying an English app | App is ES only (language policy) | EN: "Available in Spanish" (hero note) + "The app and its PDFs are in Spanish. Demos can be held in English." (demo section); FAQ says interface, recipes and PDF are in Spanish |
| C16 | "Pruébalo gratis", "Empieza ahora", "Regístrate" | No self-serve signup; sales are demo-led | "Solicitar demo" only |
| C17 | "Funciona en móvil" | Not verified; window manager + drag & drop target desktop | "pensada para usarse en ordenador" (hypothesis — confirm, Q9) |
| C18 | Exclamation marks, "revolucionario", "mágico", "en segundos" | Voice; "en segundos" is an unmeasured time claim | None used |
| C19 | "Beta privada" | Phase 2 "Beta privada" hasn't started in business terms | No "beta" wording anywhere (Q5) |
| C20 | "Tus favoritas están siempre aptas" | Only allergens and dislikes are filtered | "aptas para ese cliente: sin sus alérgenos ni lo que no le gusta" |

Mockup data: client "Laura M." and all recipes are fictitious; targets 2100 kcal / 140 g P / 230 g HC / 70 g G are internally consistent (≈ 2110 kcal by 4/4/9); spreadsheet and recipe-modal numbers are plausible for raw weights so a D-N won't spot nonsense. App wording mirrored: "Pídeme algo: busca a un cliente, revisa un menú…", "Ficha de cliente", "Objetivos diarios", "Alérgenos y comidas favoritas", "Planificación", "Calendario", "PDF del menú", "Cumple / Macros fuera / Calorías fuera / Sin menú", the compliance legend, "Favoritas aptas · arrastra una receta a un hueco", "Crear menú de la semana", "Menú de hoy", "Exportar PDF", "Recalcular", "Sin logo en este PDF", "Descargar", "+ Nueva sesión", "Frutos secos". Deviation: slot "Desayuno" instead of the app's "Desayuno 1" (cleaner in a mockup). Invented progress strings ("Eligiendo recetas de Favoritas…", "Ajustando gramos…") are illustrative; UX/UI may replace them with the app's real loading state.

Privacy notice: **Cybersecurity must review** the wording on the IP hash ("huella cifrada … no permite leer la dirección directamente") and the added legitimate-interest basis (art. 6.1.f) for abuse protection — added because rate limiting isn't covered by the consent purpose.

---

## 6 · Founder questions — answers (2026-10-31)

Answered by the founder on 2026-10-31; applied to `es.ts`/`en.ts` and the components the same day. No `[PENDIENTE]` placeholder is rendered on any page any more.

1. **Legal identity — ANSWERED (partially).** Name: "Nyamia". Contact: farnausgar@gmail.com (rendered as a `mailto:` link in privacy + legal notice). No NIF and no address for now, so those lines were removed from the pages (not shown as placeholders). **Go-live blocker (003):** LSSI-CE art. 10 and RGPD art. 13 still require the owner's full name or company name, NIF, address (and registry data if a company) before `nyamia.com` goes live.
2. **Founder profile URL — ANSWERED: not shown.** The founder block and link were removed from the trust section ("Tú decides"), with their keys and component code.
3. **Hosting processors — ANSWERED (generic wording).** The privacy notice says only the hosting providers that process the data on Nyamia's behalf have access, as processors, and that any processing outside the EEA uses GDPR safeguards (e.g. standard contractual clauses). The exact providers/regions are part of the 003 go-live blocker (security review M4).
4. **Demo request vs waitlist — ANSWERED: demo request.** The landing keeps "Solicitar demo". The product repo's business roadmap (N1) still says "lista de espera": the orchestrator/founder must update it there (not edited from this repo).
5. **"En beta" wording — ANSWERED: never say "beta".** Removed from hero note, features sub, demo language note, FAQ and privacy purpose. EN hero note: "Available in Spanish".
6. **Pricing visibility — ANSWERED: nothing about price.** Price FAQ ("¿Cuánto cuesta?") and the "Condiciones de la beta" next step removed. FAQ now has 6 items.
7. **Response time — ANSWERED: no commitment.** The founder wants a "let's fix the meeting right away" feel: success state and "Qué pasa después" now say an email arrives to fix the day and time directly with the requester, who replies with a slot and the demo is booked — no time window, neutral voice. A real instant-booking widget stays in the backlog (third-party).
8. **Demo language for EN visitors — ANSWERED: yes.** EN `demo.languageNote`: "The app and its PDFs are in Spanish. Demos can be held in English."
9. **Device support** — still open ("pensada para usarse en ordenador" kept).
10. **Data processing agreement** — still open (not written).
11. **Founder visibility — ANSWERED: not shown.** "fundador independiente" text removed (see 2).
12. **Role options** — still open ("Dietista-nutricionista generalista" kept).

Note: the privacy text changed (controller/contact/processors) but `privacy.version` stays `2026-10-30` because nothing is live and no consent has been collected yet; bump it together with the API default when the 003 legal data are added.

