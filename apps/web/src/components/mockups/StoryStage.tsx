import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react'
import type { Dictionary } from '../../i18n'
import { EASE_EXPRESSIVE, EASE_UI, SPRING_SNAP } from '../../lib/motion'
import { AppWindow } from './AppWindow'
import { ClientFicha } from './ClientFicha'
import { CookieLoader } from './CookieLoader'
import { CommandBar } from './CommandBar'
import { Dock, initials, type DockChip } from './Dock'
import { MacroBars } from './MacroBars'
import { PdfPreview, type PdfPhase } from './PdfPreview'
import { RecipeModal } from './RecipeModal'
import { WeekMenu } from './WeekMenu'
import { MODAL_EDIT, RECIPE_KCAL, SWAP, type Slot } from './data'
import { stageStateFor, STEP_COUNT, type StageState } from './stageState'
import { menuGrid } from './appUi'

type T = Dictionary['mockup']

export const STAGE_W = 880
export const STAGE_H = 700

/** Transient overrides applied on top of a step's rest state while its entry sequence plays. */
interface Overrides extends Partial<StageState> {
  progress?: number
  pressed?: boolean
  counting?: boolean
  showAllergen?: boolean
  fittedUpTo?: number
  macroState?: 'before' | 'after'
  animateCards?: boolean
  dropCell?: { day: number; slot: Slot } | null
  markCell?: { day: number; slot: Slot } | null
  markFading?: boolean
  /** Scroll the week grid so the swap cell (Sunday dinner) is in view. */
  shiftGrid?: boolean
  lifted?: number | null
  flying?: boolean
  modalOpen?: boolean
  modalGrams?: number
  modalFocus?: boolean
  pulseDays?: readonly number[]
  pdfPhase?: PdfPhase
}

type Seq = Array<[number, Overrides]>

function sequenceFor(step: number): Seq {
  switch (step) {
    case 0:
      return [
        [0, { counting: true, showAllergen: false }],
        [650, { counting: true, showAllergen: true }],
      ]
    case 1: {
      const typing: Seq = Array.from({ length: 12 }, (_, i) => [
        i * 95,
        { window: 'client', clientMinimized: false, generating: false, strip: false, progress: (i + 1) / 12 },
      ])
      return [
        [0, { window: 'client', clientMinimized: false, generating: false, strip: false, progress: 0 }],
        ...typing,
        [1200, { window: 'client', clientMinimized: false, generating: false, strip: false, pressed: true }],
        [1400, {}],
      ]
    }
    case 2:
      return [
        [0, { week: 'empty', generating: true, illustrative: false }],
        [700, { animateCards: true }],
      ]
    case 3:
      return [
        [0, { fittedUpTo: 0, macroState: 'before', strip: false }],
        ...Array.from({ length: 7 }, (_, i): [number, Overrides] => [
          250 + i * 140,
          { fittedUpTo: i + 1, macroState: 'after' },
        ]),
      ]
    case 4: {
      // Swap made legible (UX P3-1): the grid scrolls Sunday's dinner into view, pointer + ✕ on it
      // (400 ms), the card fades (150 ms), the Favorita flies in, the column turns green, then back up.
      const base: Overrides = { week: 'fitted', modal: 'hidden', shiftGrid: true }
      const cell = { day: SWAP.day, slot: SWAP.slot }
      return [
        [0, base],
        [450, { ...base, markCell: cell }],
        [850, { ...base, markCell: cell, markFading: true }],
        [1000, { ...base, dropCell: cell, lifted: SWAP.to }],
        [1100, { ...base, dropCell: cell, lifted: SWAP.to, flying: true }],
        [1700, { modal: 'hidden', shiftGrid: true }],
        [2400, { modal: 'hidden' }],
        [2700, { modalOpen: true, modalGrams: MODAL_EDIT.grams[0], modalFocus: true, modal: 'hidden' }],
        [2950, { modalOpen: true, modalGrams: 170, modalFocus: true, modal: 'hidden' }],
        [3070, { modalOpen: true, modalGrams: 175, modalFocus: true, modal: 'hidden' }],
        [3190, { modalOpen: true, modalGrams: MODAL_EDIT.grams[1], modalFocus: true, modal: 'hidden' }],
        [3400, { pulseDays: MODAL_EDIT.sharedDays }],
      ]
    }
    case 5:
      return [
        [0, { pdfPhase: 'loading' }],
        [650, { pdfPhase: 'page' }],
        [1150, { pdfPhase: 'ready' }],
      ]
    default:
      return []
  }
}

/** Tweens a number towards `target` (count). Returns target immediately when disabled. */
function useCount(target: number, from: number, run: number, enabled: boolean, duration = 800): number {
  const [value, setValue] = useState(target)
  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, from, run, enabled, duration])
  return value
}

/** C2 · The pinned scrollytelling stage (the only scroll island). */
export default function StoryStage({ t }: { t: T }) {
  const reduced = useReducedMotion() ?? false
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  // -1 = not entered yet: renders step 0's rest state (same as SSR) so the first hit plays sequence 0.
  const [step, setStep] = useState(-1)
  const shown = Math.max(step, 0)
  const [over, setOver] = useState<Overrides>({})
  const [run, setRun] = useState(0)
  const [flight, setFlight] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const prevStep = useRef(-1)
  const [gridShift, setGridShift] = useState(0)
  const timers = useRef<number[]>([])

  // Scale the native-size stage into the space the sticky box offers (measured on the parent).
  useLayoutEffect(() => {
    const root = rootRef.current
    // The Astro island wrapper is display:contents, so measure the marked layout box.
    const box = root?.closest<HTMLElement>('[data-stage-box]') ?? root?.parentElement
    if (!root || !box) return
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      const s = Math.max(0.5, Math.min(1, width / STAGE_W, (height - 32) / STAGE_H))
      root.style.setProperty('--stage-scale', String(s))
      root.style.height = `${Math.round(STAGE_H * s)}px`
    })
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  // Active step = the text step crossing the viewport centre line.
  useEffect(() => {
    const section = rootRef.current?.closest<HTMLElement>('[data-story]')
    if (!section) return
    section.dataset.enhanced = 'true'
    const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-story-step]'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.storyStep))
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    steps.forEach((s) => io.observe(s))

    // Progress rail (scrubbed, informative): scaleY of the fill.
    const list = section.querySelector<HTMLElement>('[data-story-steps]')
    const fill = section.querySelector<HTMLElement>('[data-story-rail-fill]')
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!list || !fill) return
        const r = list.getBoundingClientRect()
        const mid = window.innerHeight / 2
        const p = Math.min(1, Math.max(0, (mid - r.top) / r.height))
        fill.style.scale = `1 ${p}`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      delete section.dataset.enhanced
    }
  }, [])

  // Mirror the active step onto the static text list (dimming + rail dots).
  useEffect(() => {
    const section = rootRef.current?.closest<HTMLElement>('[data-story]')
    section?.querySelectorAll<HTMLElement>('[data-story-step]').forEach((el) => {
      const i = Number(el.dataset.storyStep)
      el.toggleAttribute('data-active', i === shown)
      el.toggleAttribute('data-done', i <= shown)
    })
    if (rootRef.current) rootRef.current.dataset.step = String(shown)
  }, [shown])

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  // Entry sequences: played once, forward by one step only; otherwise jump to the rest state.
  useEffect(() => {
    const prev = prevStep.current
    prevStep.current = step
    clearTimers()
    setFlight(null)
    if (reduced || step !== prev + 1) {
      setOver({})
      return
    }
    setRun((r) => r + 1)
    const seq = sequenceFor(step)
    for (const [at, o] of seq) {
      timers.current.push(window.setTimeout(() => setOver(o), at))
    }
    const end = (seq.at(-1)?.[0] ?? 0) + 450
    timers.current.push(window.setTimeout(() => setOver({}), end))
    return clearTimers
  }, [step, reduced, clearTimers])

  // Swap step: distance (native px) between Sunday's first row and the swap row.
  useLayoutEffect(() => {
    if (!over.shiftGrid || !stageRef.current) return
    const stage = stageRef.current
    const scale = stage.getBoundingClientRect().width / STAGE_W || 1
    const first = stage.querySelector(`[data-cell="${SWAP.day}-breakfast"]`)?.getBoundingClientRect()
    const target = stage.querySelector(`[data-cell="${SWAP.day}-${SWAP.slot}"]`)?.getBoundingClientRect()
    if (first && target) setGridShift(Math.max(0, (target.top - first.top) / scale))
  }, [over.shiftGrid])

  // Drag & drop flight: measure the Favorita chip and the target cell inside the stage.
  useLayoutEffect(() => {
    if (!over.flying || !stageRef.current) return
    const stage = stageRef.current
    const scale = stage.getBoundingClientRect().width / STAGE_W || 1
    const base = stage.getBoundingClientRect()
    const chip = stage.querySelector(`[data-chip="${SWAP.to}"]`)?.getBoundingClientRect()
    const cell = stage.querySelector(`[data-cell="${SWAP.day}-${SWAP.slot}"]`)?.getBoundingClientRect()
    if (!chip || !cell) return
    setFlight({
      x0: (chip.left - base.left) / scale,
      y0: (chip.top - base.top) / scale,
      x1: (cell.left - base.left) / scale + 4,
      y1: (cell.top - base.top) / scale + 18,
    })
  }, [over.flying])

  const s: StageState & Overrides = { ...stageStateFor(shown), ...over }
  const counting = Boolean(over.counting) && !reduced
  const v0 = useCount(Number(t.client.targets[0]!.value), 0, run, counting)
  const v1 = useCount(Number(t.client.targets[1]!.value), 0, run, counting)
  const v2 = useCount(Number(t.client.targets[2]!.value), 0, run, counting)
  const v3 = useCount(Number(t.client.targets[3]!.value), 0, run, counting)

  const modalVisible = s.modal === 'edited' || Boolean(over.modalOpen)
  const grams = over.modalGrams ?? MODAL_EDIT.grams[1]
  const ratio = (grams - MODAL_EDIT.grams[0]) / (MODAL_EDIT.grams[1] - MODAL_EDIT.grams[0])
  const modalKcal = Math.round(MODAL_EDIT.kcal[0] + (MODAL_EDIT.kcal[1] - MODAL_EDIT.kcal[0]) * ratio)
  const modalProtein = Math.round(
    MODAL_EDIT.protein[0] + (MODAL_EDIT.protein[1] - MODAL_EDIT.protein[0]) * ratio,
  )

  const chips: DockChip[] = []
  if (s.clientMinimized && s.window !== 'client') {
    chips.push({
      label: t.client.name,
      initials: initials(t.client.name),
      count: s.window === 'pdf' ? 2 : 1,
      className: 'animate-[pop-in_var(--duration-snap)_var(--ease-snap)_both]',
    })
  }
  const dur = reduced ? 0 : 0.2

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        ref={rootRef}
        className="relative w-full"
        style={{ height: Math.round(STAGE_H * 0.85), '--stage-scale': 0.85 } as CSSProperties}
        data-testid="story-stage"
        data-step={shown}
      >
        <div
          ref={stageRef}
          className="stage-scale absolute top-0 left-1/2"
          style={{ width: STAGE_W, height: STAGE_H }}
          aria-hidden="true"
          inert
        >
          <div className="dot-grid absolute inset-0 rounded-window border border-border bg-surface-muted" />
          <div className="relative flex h-full flex-col gap-3 p-5">
            <CommandBar
              t={t}
              mode={s.prompt === 'typed' || over.progress !== undefined ? 'typed' : 'empty'}
              progress={over.progress ?? 1}
              pressed={over.pressed}
            />
            <Dock chips={chips} className="min-h-9" />
            <div className="relative min-h-0 flex-1">
              <AnimatePresence initial={false}>
                <m.div
                  key={s.window}
                  className="absolute inset-0 flex"
                  initial={{ opacity: 0, y: 6, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ duration: dur, ease: EASE_UI }}
                >
                  {s.window === 'client' ? (
                    <AppWindow title={t.windows.client} subtitle={t.client.name}>
                      <ClientFicha
                        t={t}
                        values={counting ? [v0, v1, v2, v3] : undefined}
                        showAllergen={over.showAllergen ?? true}
                      />
                    </AppWindow>
                  ) : null}
                  {s.window === 'menu' ? (
                    <AppWindow title={t.windows.calendar} subtitle={t.client.name} bodyClassName="p-4">
                      <WeekMenu
                        key={`grid-${shown}-${over.animateCards ? run : 0}`}
                        t={t}
                        mode={s.week}
                        strip={s.strip}
                        generating={s.generating}
                        illustrative={s.illustrative}
                        fittedUpTo={over.fittedUpTo}
                        animateCards={Boolean(over.animateCards)}
                        dropCell={over.dropCell ?? null}
                        markCell={over.markCell ?? null}
                        markFading={Boolean(over.markFading)}
                        shiftY={shown === 4 ? (over.shiftGrid ? gridShift : 0) : undefined}
                        liftedChip={over.lifted ?? null}
                        pulseRecalc={shown === 3 && !reduced}
                        pulseDays={over.pulseDays ?? []}
                      />
                    </AppWindow>
                  ) : null}
                  {s.window === 'pdf' ? (
                    <AppWindow title={t.windows.menuPdf} subtitle={t.client.name}>
                      <PdfPreview t={t} phase={over.pdfPhase ?? s.pdf} />
                    </AppWindow>
                  ) : null}
                </m.div>
              </AnimatePresence>

              <AnimatePresence>
                {s.macroBars !== 'hidden' ? (
                  <m.div
                    key="macro"
                    className="absolute bottom-3 left-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: reduced ? 0 : 0.4, ease: EASE_EXPRESSIVE }}
                  >
                    <MacroBars t={t} state={over.macroState ?? 'after'} />
                  </m.div>
                ) : null}
                {modalVisible ? (
                  <m.div
                    key="modal"
                    className="absolute top-[4.5rem] left-3 w-[22rem]"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: reduced ? 0 : 0.18, ease: EASE_UI }}
                  >
                    <RecipeModal
                      t={t}
                      edited={s.modal === 'edited' && !over.modalOpen}
                      grams={grams}
                      kcal={modalKcal}
                      protein={modalProtein}
                      focus={Boolean(over.modalFocus)}
                      maxIngredients={3}
                    />
                  </m.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
          {/* Decode the cookie frames up front so the PDF beat's first frame is never blank. */}
          <span className="pointer-events-none absolute top-0 left-0 opacity-0">
            <CookieLoader size={72} />
          </span>
          {flight && over.flying ? (
            <m.span
              className={`${menuGrid.chip} pointer-events-none absolute top-0 left-0 z-10 shadow-md`}
              initial={{ x: flight.x0, y: flight.y0, scale: 1.03 }}
              animate={{ x: flight.x1, y: flight.y1, scale: 1 }}
              transition={SPRING_SNAP}
            >
              <span className="line-clamp-2 font-medium">{t.recipes[SWAP.to]!.title}</span>
              <span className="text-text-muted tabular-nums">{RECIPE_KCAL[SWAP.to]} kcal</span>
            </m.span>
          ) : null}
        </div>
      </div>
    </LazyMotion>
  )
}

export { STEP_COUNT }
