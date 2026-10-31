# Mission

_Why this repository exists. Use it to decide whether a section, feature or experiment fits or is scope creep._

## What we build

**nyamia.com** — the public website of Nyamia, an AI meal-planning assistant for dietitians-nutritionists (D-N). The product (separate repo, `app.nyamia.com`) creates clients with macro targets, generates a weekly menu from the nutritionist's favourite recipes, fits ingredient grams deterministically to ±10% of kcal/protein/carbs/fat, shows daily compliance, and exports a branded PDF.

The website has **one job: get qualified D-N to request a demo.** Everything on the page either builds the desire to see the product or removes a reason not to ask for the demo.

North-star metric: **demo requests from qualified professionals / unique visitors.**

## Who it is for

- **Primary:** D-N in private practice, sports / body-composition focus (beachhead ICP).
- **Secondary:** generalist clinical D-N; small multi-professional clinics (exploratory).
- **Not the audience now:** end consumers (B2C is the product's Plan B; the site must not attract or promise self-serve consumer use).

## Message (from the product's business roadmap — do not drift)

- Promise: stop balancing menus to each client's macros by hand.
- Framing: outcome first, AI as the "how" — **"La IA propone, los macros se calculan, tú decides."**
- Voice: neutral product voice ("Nyamia propone…"), addressing the professional as **tú**. No "somos", "nuestro equipo", "escríbenos". Behind Nyamia there is one founder; when a person is needed, link to the founder's profile — never invent a team.
- Language: **Spanish by default, English version** (`/en/`) stating "Beta available in Spanish". One language per page.

## Principles

- **Show, don't tell.** Product moments (command bar → weekly menu → macros fitting → compliance colours → PDF) are shown through faithful animated mockups, screenshots or video of the real app, with fictitious data.
- **Coherent with the app.** Same tokens, typography, logo and tone as `app.nyamia.com`; a visitor who books a demo must recognise the product instantly.
- **Scroll that rewards.** Every scroll step reveals something new and satisfying (progress, a number settling into green, a menu assembling) — but motion serves comprehension and respects `prefers-reduced-motion`.
- **Fast and private by default.** Static pages, self-hosted assets, no cookies, no third-party trackers in v1. Lead data is personal data: minimum fields, explicit consent, clear retention.
- **Honest.** No invented testimonials, logos, user counts or health outcomes. Unbuilt features are labelled "Próximamente" or left out.

## What it is NOT

- Not the product, not a login portal (it only links to `app.nyamia.com`).
- Not a blog/CMS platform (content marketing may come later, as a roadmap decision).
- Not a place for medical claims: Nyamia supports planning; it is not a medical device and does not diagnose or treat.
- Not a self-serve signup or payment flow (sales are demo-led in this phase).
