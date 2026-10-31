import { Fragment, type CSSProperties } from 'react'
import { cn } from '../../lib/cn'
import { format, type Dictionary } from '../../i18n'
import { button, complianceTint, menuGrid, recipesPane } from './appUi'
import { Spinner } from './Spinner'
import { Icon } from '../ui/Icon'
import {
  SLOTS,
  WEEK,
  cardKcal,
  dayView,
  recipeAt,
  RECIPE_KCAL,
  type Slot,
  type Status,
  type WeekMode,
} from './data'

type T = Dictionary['mockup']

export interface WeekMenuProps {
  t: T
  mode: WeekMode
  variant?: 'full' | 'compact'
  toolbar?: boolean
  legend?: boolean
  strip?: boolean
  generating?: boolean
  /** CSS-only hero timeline classes (zero JS). */
  hero?: boolean
  /** Days whose cells pulse once (shared recipe edited). */
  pulseDays?: readonly number[]
  /** Cell rendered empty + highlighted as a drop target (drag & drop step). */
  dropCell?: { day: number; slot: Slot } | null
  /** Card about to be replaced: pointer + ✕ shown on it (swap step); `markFading` fades it out. */
  markCell?: { day: number; slot: Slot } | null
  markFading?: boolean
  /** Scrolls the grid up by this many px inside its clip (StoryStage swap: brings dinner into view). */
  shiftY?: number
  /** Recipe index lifted from the strip (rendered as a ghost in the strip). */
  liftedChip?: number | null
  /** Orange day "Recalcular" gets a one-time accent pulse. */
  pulseRecalc?: boolean
  /** Shows the "Ilustrativo" caption on pre-fit totals. */
  illustrative?: boolean
  /** Fit sequence: days with index >= fittedUpTo still show the pre-fit state. */
  fittedUpTo?: number
  /** Replays the card "snap in" (StoryStage proposal step). */
  animateCards?: boolean
  className?: string
}

export function dayTitle(t: T, i: number): string {
  const d = t.menu.days[i]!
  return `${d.short}, ${d.date}`
}

export function ComplianceLegend({ t, className }: { t: T; className?: string }) {
  const items: Array<[Status, string]> = [
    ['red', t.menu.legend.red],
    ['orange', t.menu.legend.orange],
    ['green', t.menu.legend.green],
  ]
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted', className)}>
      {items.map(([s, label]) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className={cn('h-2.5 w-2.5 rounded-full border', complianceTint[s])} />
          {label}
        </span>
      ))}
    </div>
  )
}

export function FavouritesStrip({
  t,
  generating,
  lifted,
  className,
}: {
  t: T
  generating?: boolean
  lifted?: number | null
  className?: string
}) {
  return (
    <div className={cn(recipesPane.pane, 'gap-2', className)}>
      <p className={recipesPane.paneTitle}>{t.menu.favouritesTitle}</p>
      <div className={cn(menuGrid.strip, 'overflow-hidden')}>
        {t.recipes.map((r, i) => (
          <span
            key={r.title}
            data-chip={i}
            style={{ '--stagger': i } as CSSProperties}
            className={cn(
              menuGrid.chip,
              'tint-anim',
              generating && 'pulse-accent',
              lifted === i && 'opacity-40',
            )}
          >
            <span className="line-clamp-2 font-medium">{r.title}</span>
            <span className="text-text-muted tabular-nums">{RECIPE_KCAL[i]} kcal</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function Toolbar({ t, generating }: { t: T; generating?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <span className={cn(button.base, button.variants.ghost, button.sizes.sm, 'px-2')}>‹</span>
        <span className="text-sm font-medium text-text">{t.menu.weekLabel}</span>
        <span className={cn(button.base, button.variants.ghost, button.sizes.sm, 'px-2')}>›</span>
      </div>
      <div className="flex gap-2">
        <span className={cn(button.base, button.variants.ghost, button.sizes.sm)}>{t.menu.exportPdf}</span>
        <span className={cn(button.base, button.variants.secondary, button.sizes.sm)}>{t.menu.today}</span>
        <span className={cn(button.base, button.variants.primary, button.sizes.sm)}>
          {generating ? <Spinner className="border-brand-300 border-t-on-solid" /> : null}
          {t.menu.createWeek}
        </span>
      </div>
    </div>
  )
}

function DayColumn({
  t,
  i,
  mode,
  hero,
  pulse,
  dropSlot,
  markSlot,
  markFading,
  pulseRecalc,
  animateCards,
  slotsShown = SLOTS,
}: {
  t: T
  i: number
  mode: WeekMode
  hero?: boolean
  pulse?: boolean
  dropSlot?: Slot | null
  markSlot?: Slot | null
  markFading?: boolean
  pulseRecalc?: boolean
  animateCards?: boolean
  slotsShown?: readonly Slot[]
}) {
  const view = dayView(i, mode)
  const status: Status = view?.status ?? 'none'
  const vars = { '--d': i } as CSSProperties
  const showRecalc = (mode === 'fitted' || mode === 'final') && (status === 'orange' || status === 'red')
  return (
    <div
      data-day={i}
      data-status={status}
      style={vars}
      className={cn(
        menuGrid.day,
        complianceTint[status],
        'tint-anim',
        hero && 'hero-day',
        pulse && 'pulse-brand',
      )}
    >
      <div className={menuGrid.dayHeader}>
        <span className={menuGrid.dayTitle}>{dayTitle(t, i)}</span>
        {hero ? (
          <span className="relative">
            <span className="hero-status-final">{t.menu.status[status]}</span>
            <span className="hero-status-initial absolute inset-0 bg-surface-muted">
              {t.menu.status.none}
            </span>
          </span>
        ) : (
          <span data-testid="day-status">{t.menu.status[status]}</span>
        )}
        {view ? (
          <span className={cn('tabular-nums text-text-muted', hero && 'hero-total')}>
            {format(t.menu.dayTotal, { kcal: view.kcal, protein: view.protein })
              .split(' · ')
              .map((part, k) => (
                <Fragment key={k}>
                  {k > 0 ? ' · ' : null}
                  <span className="whitespace-nowrap">{part}</span>
                </Fragment>
              ))}
          </span>
        ) : (
          <span className="invisible tabular-nums">·</span>
        )}
        {showRecalc ? (
          <span
            className={cn(
              button.base,
              button.variants.ghost,
              'h-6 self-start px-1.5 text-xs',
              pulseRecalc && 'pulse-accent',
            )}
          >
            {t.menu.recalculate}
          </span>
        ) : null}
      </div>
      {slotsShown.map((slot, s) => {
        const empty = mode === 'empty' || dropSlot === slot
        const recipe = recipeAt(WEEK[i]!, slot, mode === 'final', i)
        return (
          <div
            key={slot}
            data-cell={`${i}-${slot}`}
            className={cn(menuGrid.cell, 'min-h-14', dropSlot === slot && menuGrid.cellOver)}
          >
            <span className={menuGrid.slotLabel}>{t.menu.slots[slot]}</span>
            {empty ? null : (
              <span
                className={cn(
                  menuGrid.card,
                  hero && 'hero-card',
                  animateCards && 'seq-card',
                  markSlot === slot && 'relative ring-1 ring-danger-400 transition-opacity duration-150',
                  markSlot === slot && markFading && 'opacity-0',
                )}
                style={{ '--d': i, '--s': s } as CSSProperties}
              >
                <span className="line-clamp-2 break-words">{t.recipes[recipe]!.title}</span>
                <span className="text-text-muted tabular-nums">{cardKcal(i, slot, mode)} kcal</span>
                {markSlot === slot ? (
                  <>
                    <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 animate-[pop-in_150ms_var(--ease-ui)_both] place-items-center rounded-full bg-danger-600 text-on-solid">
                      <Icon name="x" size={10} />
                    </span>
                    <span className="absolute -right-0.5 bottom-0 animate-[fade-in_150ms_var(--ease-ui)_both] text-text drop-shadow-sm">
                      <Icon name="pointer" size={16} className="fill-surface" />
                    </span>
                  </>
                ) : null}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** 2 · WeekMenu — MenuWindow.tsx body: toolbar, legend, Favoritas strip, 7-day grid. */
export function WeekMenu({
  t,
  mode,
  variant = 'full',
  toolbar = true,
  legend = true,
  strip = false,
  generating = false,
  hero = false,
  pulseDays = [],
  dropCell = null,
  markCell = null,
  markFading = false,
  shiftY,
  liftedChip = null,
  pulseRecalc = false,
  illustrative = false,
  fittedUpTo,
  animateCards = false,
  className,
}: WeekMenuProps) {
  const days = WEEK.map((_, i) => i)
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-text">{t.menu.weekLabel}</span>
          {illustrative ? <IllustrativeTag t={t} /> : null}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((i) => {
            const status = dayView(i, mode)?.status ?? 'none'
            return (
              <span
                key={i}
                style={{ '--d': i } as CSSProperties}
                className={cn(
                  'flex flex-col items-center rounded-control border py-1 text-[11px] font-medium text-text',
                  complianceTint[status],
                  hero && 'hero-day',
                )}
              >
                {t.menu.days[i]!.short}
              </span>
            )
          })}
        </div>
        <div className="relative overflow-hidden">
          <div className="grid w-[150%] grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <DayColumn key={i} t={t} i={i} mode={mode} slotsShown={['lunch', 'dinner']} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-surface to-transparent" />
        </div>
      </div>
    )
  }
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {toolbar ? <Toolbar t={t} generating={generating} /> : null}
      {legend ? (
        <div className={cn('flex items-center justify-between gap-2', hero && 'hero-legend')}>
          <ComplianceLegend t={t} />
          {illustrative ? <IllustrativeTag t={t} /> : null}
        </div>
      ) : null}
      {strip ? <FavouritesStrip t={t} generating={generating} lifted={liftedChip} /> : null}
      <div className={cn(hero && 'hero-menu-body', shiftY !== undefined && 'overflow-hidden')}>
        <div
          className={cn(
            'grid min-w-[42rem] grid-cols-7 gap-1.5',
            shiftY !== undefined && 'transition-transform duration-300 ease-(--ease-ui)',
          )}
          style={shiftY ? { transform: `translateY(${-shiftY}px)` } : undefined}
        >
          {days.map((i) => (
            <DayColumn
              key={i}
              t={t}
              i={i}
              mode={fittedUpTo !== undefined && i >= fittedUpTo ? 'placed' : mode}
              hero={hero}
              animateCards={animateCards}
              pulse={pulseDays.includes(i)}
              dropSlot={dropCell?.day === i ? dropCell.slot : null}
              markSlot={markCell?.day === i ? markCell.slot : null}
              markFading={markFading}
              pulseRecalc={pulseRecalc}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function IllustrativeTag({ t }: { t: T }) {
  return (
    <span className="rounded-pill border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-text-muted">
      {t.menu.illustrative}
    </span>
  )
}

/** Features tile D: 7 day headers with a 5 green / 1 orange / 1 red mix. */
export function WeekHeaders({ t, statuses }: { t: T; statuses: readonly Status[] }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {statuses.map((s, i) => (
        <span
          key={i}
          style={{ '--stagger': i } as CSSProperties}
          className={cn(
            'trick-tint flex min-w-0 flex-col gap-0.5 rounded-control border px-1 py-1.5 text-[10px] leading-tight sm:text-[11px]',
            complianceTint[s],
          )}
        >
          <span className="font-semibold text-text capitalize">{t.menu.days[i]!.short}</span>
          <span className="truncate text-text-muted">{t.menu.status[s]}</span>
        </span>
      ))}
    </div>
  )
}
