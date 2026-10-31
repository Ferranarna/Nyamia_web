import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'
import type { Dictionary } from '../../i18n'
import { badge, button, ficha } from './appUi'

type T = Dictionary['mockup']

/** 4 · ClientFicha (ClientWindow/ClientSections, view mode). `values` overrides the targets while counting. */
export function ClientFicha({
  t,
  variant = 'full',
  values,
  showAllergen = true,
  className,
}: {
  t: T
  variant?: 'full' | 'targets'
  values?: readonly (string | number)[]
  showAllergen?: boolean
  className?: string
}) {
  const c = t.client
  const targets = (
    <div
      className={cn(
        variant === 'targets'
          ? 'grid grid-cols-2 gap-3 sm:grid-cols-4'
          : 'grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4',
      )}
    >
      {c.targets.map((tg, i) => (
        <div
          key={tg.label}
          className="flex min-w-0 flex-col gap-0.5"
          style={{ '--stagger': i } as CSSProperties}
        >
          <span className={cn(ficha.term, 'min-w-0 truncate')}>{tg.label}</span>
          <span className={cn(ficha.value, 'text-base font-semibold whitespace-nowrap')}>
            {values?.[i] ?? tg.value}{' '}
            <span className="text-xs font-normal text-text-muted transition-colors group-hover:text-brand-700">
              {tg.unit}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
  if (variant === 'targets') {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <p className={ficha.sectionTitle}>{c.sections.targets}</p>
        {targets}
      </div>
    )
  }
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <section className={cn(ficha.section, 'gap-2 pb-4')}>
        <p className={ficha.sectionTitle}>{c.sections.identity}</p>
        <p className="text-sm font-medium text-text">{c.name}</p>
      </section>
      <section className={cn(ficha.section, 'gap-2 pb-4')}>
        <p className={ficha.sectionTitle}>{c.sections.targets}</p>
        {targets}
      </section>
      <section className={cn(ficha.section, 'gap-2 pb-4')}>
        <p className={ficha.sectionTitle}>{c.sections.restrictions}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className={ficha.term}>{c.allergensLabel}</span>
            <div className={cn(ficha.tags, 'min-h-7')}>
              {c.allergens.map((a) => (
                <span
                  key={a.label}
                  className={cn(
                    badge.base,
                    badge.variants.accent,
                    'tint-anim',
                    !showAllergen && 'scale-75 opacity-0',
                  )}
                >
                  {a.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={ficha.term}>{c.dislikedLabel}</span>
            <div className={ficha.tags}>
              {c.disliked.map((a) => (
                <span key={a.label} className={cn(badge.base, badge.variants.neutral)}>
                  {a.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <p className={ficha.sectionTitle}>{c.sections.planning}</p>
        <p className="text-sm text-text">
          <span className={ficha.term}>{c.mealsLabel}: </span>
          {c.meals}
        </p>
      </section>
      <div className={ficha.actions}>
        <span className={cn(button.base, button.variants.primary, button.sizes.sm)}>{c.edit}</span>
      </div>
    </div>
  )
}
