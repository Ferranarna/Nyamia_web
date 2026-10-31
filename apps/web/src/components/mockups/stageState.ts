import type { WeekMode } from './data'
import type { PdfPhase } from './PdfPreview'

/** Rest state of the scrollytelling stage for each of the 6 steps (pure, tested). */
export interface StageState {
  window: 'client' | 'menu' | 'pdf'
  prompt: 'empty' | 'typed'
  clientMinimized: boolean
  week: WeekMode
  generating: boolean
  strip: boolean
  illustrative: boolean
  macroBars: 'hidden' | 'after'
  modal: 'hidden' | 'edited'
  pdf: PdfPhase
}

export const STEP_COUNT = 6

const STATES: StageState[] = [
  {
    window: 'client',
    prompt: 'empty',
    clientMinimized: false,
    week: 'empty',
    generating: false,
    strip: false,
    illustrative: false,
    macroBars: 'hidden',
    modal: 'hidden',
    pdf: 'ready',
  },
  {
    window: 'menu',
    prompt: 'typed',
    clientMinimized: true,
    week: 'empty',
    generating: true,
    strip: true,
    illustrative: false,
    macroBars: 'hidden',
    modal: 'hidden',
    pdf: 'ready',
  },
  {
    window: 'menu',
    prompt: 'typed',
    clientMinimized: true,
    week: 'placed',
    generating: false,
    strip: true,
    illustrative: true,
    macroBars: 'hidden',
    modal: 'hidden',
    pdf: 'ready',
  },
  {
    window: 'menu',
    prompt: 'typed',
    clientMinimized: true,
    week: 'fitted',
    generating: false,
    strip: false,
    illustrative: false,
    macroBars: 'after',
    modal: 'hidden',
    pdf: 'ready',
  },
  {
    window: 'menu',
    prompt: 'typed',
    clientMinimized: true,
    week: 'final',
    generating: false,
    strip: true,
    illustrative: false,
    macroBars: 'hidden',
    modal: 'edited',
    pdf: 'ready',
  },
  {
    window: 'pdf',
    prompt: 'typed',
    clientMinimized: true,
    week: 'final',
    generating: false,
    strip: false,
    illustrative: false,
    macroBars: 'hidden',
    modal: 'hidden',
    pdf: 'ready',
  },
]

export function stageStateFor(step: number): StageState {
  const i = Math.min(STEP_COUNT - 1, Math.max(0, Math.round(step)))
  return STATES[i]!
}
