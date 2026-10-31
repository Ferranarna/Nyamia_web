/**
 * Fictitious numbers shared by every mockup (ux.md §3.0.1, aligned with the
 * Business copy in `i18n/*.ts > mockup`: targets 2100 kcal / 140 P / 230 HC / 70 G).
 * Text lives in i18n; this file only holds numbers and indices into `mockup.recipes`.
 */
export type Status = 'green' | 'orange' | 'red' | 'none'
export type Slot = 'breakfast' | 'lunch' | 'merienda' | 'dinner'
export const SLOTS: readonly Slot[] = ['breakfast', 'lunch', 'merienda', 'dinner']

export const TARGETS = { kcal: 2100, protein: 140, carbs: 230, fat: 70 } as const

/** Fitted kcal per recipe (index = `mockup.recipes[i]`). Same grams all week (041) → same kcal. */
export const RECIPE_KCAL = [480, 460, 615, 650, 640, 620, 280, 700, 680, 690] as const

export interface DayPlan {
  slots: Record<Slot, number>
  /** Illustrative base-portion totals before the fit (the app never shows them). */
  pre: { kcal: number; protein: number; status: Status }
  fitted: { protein: number; status: Status }
}

export const WEEK: readonly DayPlan[] = [
  {
    slots: { breakfast: 0, lunch: 2, merienda: 6, dinner: 7 },
    pre: { kcal: 1780, protein: 104, status: 'red' },
    fitted: { protein: 138, status: 'green' },
  },
  {
    slots: { breakfast: 1, lunch: 4, merienda: 6, dinner: 8 },
    pre: { kcal: 1960, protein: 118, status: 'orange' },
    fitted: { protein: 142, status: 'green' },
  },
  {
    slots: { breakfast: 0, lunch: 3, merienda: 6, dinner: 9 },
    pre: { kcal: 1720, protein: 96, status: 'red' },
    fitted: { protein: 136, status: 'green' },
  },
  {
    slots: { breakfast: 1, lunch: 5, merienda: 6, dinner: 7 },
    pre: { kcal: 2050, protein: 131, status: 'green' },
    fitted: { protein: 141, status: 'green' },
  },
  {
    slots: { breakfast: 0, lunch: 2, merienda: 6, dinner: 8 },
    pre: { kcal: 2390, protein: 122, status: 'red' },
    fitted: { protein: 139, status: 'green' },
  },
  {
    slots: { breakfast: 1, lunch: 4, merienda: 6, dinner: 9 },
    pre: { kcal: 2010, protein: 109, status: 'orange' },
    fitted: { protein: 143, status: 'green' },
  },
  {
    slots: { breakfast: 0, lunch: 3, merienda: 6, dinner: 7 },
    pre: { kcal: 1850, protein: 101, status: 'red' },
    fitted: { protein: 112, status: 'orange' },
  },
]

/** Step "Tú decides": Sunday dinner swapped for a Favorita → the day turns green. */
export const SWAP = { day: 6, slot: 'dinner' as Slot, from: 7, to: 8, protein: 137 } as const

/** Recipe modal edit (Pollo al curry = recipeModal.title, repeats Mon + Fri). */
export const MODAL_EDIT = {
  ingredient: 0,
  grams: [165, 180],
  kcal: [615, 640],
  protein: [45, 49],
  sharedDays: [0, 4],
} as const

/** MacroBars diagram for Wednesday (index 2). Order matches `mockup.recipeModal.macros`. */
export const MACRO_DAY = 2
export const MACRO_BARS = [
  { target: TARGETS.kcal, before: 1720, after: 2100 },
  { target: TARGETS.protein, before: 96, after: 136 },
  { target: TARGETS.carbs, before: 205, after: 228 },
  { target: TARGETS.fat, before: 74, after: 71 },
] as const

/** Spreadsheet "Total día" in the problem section: the same illustrative Monday before the fit. */
export const PROBLEM_TOTAL = { kcal: 1780, p: 104, hc: 205, g: 74 } as const

export type WeekMode = 'empty' | 'placed' | 'fitted' | 'final'

export function dayKcal(day: DayPlan, swapped: boolean, dayIndex: number): number {
  return SLOTS.reduce((sum, slot) => sum + RECIPE_KCAL[recipeAt(day, slot, swapped, dayIndex)]!, 0)
}

export function recipeAt(day: DayPlan, slot: Slot, swapped: boolean, dayIndex: number): number {
  if (swapped && dayIndex === SWAP.day && slot === SWAP.slot) return SWAP.to
  return day.slots[slot]
}

/** Per-day totals/status shown in the day header for a week mode. */
export function dayView(
  dayIndex: number,
  mode: WeekMode,
): { kcal: number; protein: number; status: Status } | null {
  const day = WEEK[dayIndex]!
  if (mode === 'empty') return null
  if (mode === 'placed') return day.pre
  const swapped = mode === 'final'
  const kcal = dayKcal(day, swapped, dayIndex)
  if (swapped && dayIndex === SWAP.day) return { kcal, protein: SWAP.protein, status: 'green' }
  return { kcal, protein: day.fitted.protein, status: day.fitted.status }
}

/** Kcal shown on a recipe card: pre-fit values are scaled from the illustrative day total. */
export function cardKcal(dayIndex: number, slot: Slot, mode: WeekMode): number {
  const day = WEEK[dayIndex]!
  const swapped = mode === 'final'
  const fitted = RECIPE_KCAL[recipeAt(day, slot, swapped, dayIndex)]!
  if (mode !== 'placed') return fitted
  const ratio = day.pre.kcal / dayKcal(day, false, dayIndex)
  return Math.round((fitted * ratio) / 5) * 5
}

export function percentOf(value: number, target: number): number {
  return Math.round((value / target) * 100)
}
