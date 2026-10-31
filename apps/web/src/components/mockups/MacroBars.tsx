import { cn } from '../../lib/cn'
import type { Dictionary } from '../../i18n'
import { MACRO_BARS, MACRO_DAY, percentOf } from './data'
import { dayTitle, IllustrativeTag } from './WeekMenu'

type T = Dictionary['mockup']

/** Track spans 60–130 % of the target; the ±10 % band is highlighted. */
const MIN = 60
const MAX = 130
const pos = (pct: number) => ((Math.min(MAX, Math.max(MIN, pct)) - MIN) / (MAX - MIN)) * 100

function markerColour(pct: number): string {
  const off = Math.abs(pct - 100)
  if (off <= 10) return 'bg-brand-500'
  if (off <= 20) return 'bg-accent-500'
  return 'bg-danger-400'
}

/**
 * 3 · MacroBars — a marketing *diagram* of the ±10 % rule (the app shows numbers, not bars).
 * `state` picks before/after values; markers move with CSS transitions.
 */
export function MacroBars({
  t,
  state,
  values,
  className,
}: {
  t: T
  state: 'before' | 'after'
  /** Optional live values (count-up) overriding the state's numbers. */
  values?: readonly number[]
  className?: string
}) {
  return (
    <div className={cn('w-72 rounded-card border border-border bg-surface p-4 shadow-md', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-text capitalize">{dayTitle(t, MACRO_DAY)}</p>
        <IllustrativeTag t={t} />
      </div>
      <div className="flex flex-col gap-3">
        {MACRO_BARS.map((m, i) => {
          const value = values?.[i] ?? m[state]
          const pct = percentOf(m[state], m.target)
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-text-muted">{t.recipeModal.macros[i]!.label}</span>
                <span className="text-text tabular-nums">
                  {value} / {m.target} · {pct}%
                </span>
              </div>
              <div className="relative h-2 rounded-pill bg-surface-muted">
                <span
                  className="absolute inset-y-0 border-x-2 border-brand-300 bg-brand-100"
                  style={{ left: `${pos(90)}%`, width: `${pos(110) - pos(90)}%` }}
                />
                <span
                  data-marker={i}
                  className={cn(
                    'marker-anim absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface',
                    markerColour(pct),
                  )}
                  style={{ left: `${pos(pct)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] text-text-muted tabular-nums">±10 %</p>
    </div>
  )
}
