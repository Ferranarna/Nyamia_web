import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'
import type { Dictionary } from '../../i18n'
import { button, checkbox, pdfWindow } from './appUi'
import { CookieLoader } from './CookieLoader'
import { LogoSlot } from './LogoSlot'
import { SLOTS, WEEK, recipeAt } from './data'

type T = Dictionary['mockup']
export type PdfPhase = 'loading' | 'page' | 'ready'

/**
 * The A4-landscape sheet (spec 041: branded header, recipe names only, no compliance colours).
 * `size="lg"` is the StoryStage payoff: larger type and a readable logo slot that stamps in.
 */
export function PdfSheet({
  t,
  logo = true,
  size = 'sm',
  className,
}: {
  t: T
  logo?: boolean
  size?: 'sm' | 'lg'
  className?: string
}) {
  const p = t.pdf
  const lg = size === 'lg'
  return (
    <div
      className={cn(
        // lg crops the A4 sheet so the content fills the preview (UX P2-4).
        lg ? 'aspect-[297/170]' : 'aspect-[297/210]',
        'w-full rounded-[4px] bg-surface p-[4%] shadow-md',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border pb-[2%]">
        <div className="min-w-0">
          <p className={cn('truncate font-semibold text-text', lg ? 'text-sm' : 'text-[11px]')}>
            {p.docTitle}
          </p>
          <p className={cn('truncate text-text-muted', lg ? 'text-[11px]' : 'text-[9px]')}>{p.docSubtitle}</p>
        </div>
        {lg ? (
          <span className={cn('relative shrink-0', logo ? 'opacity-100' : 'opacity-0')}>
            <LogoSlot
              label={p.logoPlaceholder}
              className={cn(
                'h-8 px-3',
                logo && 'animate-[pop-in_var(--duration-snap)_var(--ease-snap)_both]',
              )}
            />
            {logo ? (
              <span className="pointer-events-none absolute inset-0 animate-[fade-out_600ms_var(--ease-ui)_300ms_both] rounded-control ring-2 ring-brand-300" />
            ) : null}
          </span>
        ) : (
          <LogoSlot
            label={p.logoPlaceholder}
            small
            className={cn(
              'shrink-0 transition-all duration-300',
              logo ? 'scale-100 opacity-100' : 'scale-125 opacity-0',
            )}
          />
        )}
      </div>
      <div className="mt-[3%] grid grid-cols-7 gap-[1.5%]">
        {WEEK.map((day, i) => (
          <div key={i} className={cn('flex min-w-0 flex-col', lg ? 'gap-1' : 'gap-[3px]')}>
            <p
              className={cn('truncate font-semibold text-text capitalize', lg ? 'text-[11px]' : 'text-[7px]')}
            >
              {t.menu.days[i]!.short}
            </p>
            {SLOTS.map((slot) => (
              <p
                key={slot}
                className={cn(
                  'rounded-[2px] border border-border leading-tight text-text',
                  lg ? 'px-1 py-1 text-[10px]' : 'px-[3px] py-[2px] text-[6px]',
                )}
              >
                {/* Clamp an inner box so the third line never peeks through the cell padding. */}
                <span className={cn('line-clamp-2', lg && 'min-h-[2.5em]')}>
                  {t.recipes[recipeAt(day, slot, true, i)]!.title}
                </span>
              </p>
            ))}
          </div>
        ))}
      </div>
      <p className={cn('mt-[3%] text-text-muted', lg ? 'text-[10px]' : 'text-[7px]')}>{p.summaryTitle}</p>
    </div>
  )
}

/** 6 · PdfPreview (MenuPdfWindow.tsx): preview left, options right. */
export function PdfPreview({ t, phase, className }: { t: T; phase: PdfPhase; className?: string }) {
  const p = t.pdf
  const ready = phase === 'ready'
  return (
    <div className={cn('grid grid-cols-[minmax(0,1fr)_13rem] gap-4', className)}>
      <div className="flex min-h-56 items-center justify-center rounded-card border border-border bg-surface-muted p-4">
        {phase === 'loading' ? (
          <CookieLoader size={72} />
        ) : (
          <PdfSheet
            t={t}
            logo={ready}
            size="lg"
            className="animate-[hero-in_500ms_var(--ease-expressive)_both]"
          />
        )}
      </div>
      <div className={pdfWindow.panel}>
        <div className={cn(pdfWindow.box, 'gap-2 p-3')}>
          <p className={pdfWindow.boxTitle}>{p.logoTitle}</p>
          <LogoSlot
            label={p.logoPlaceholder}
            className={cn(
              'self-start transition-all duration-300',
              ready ? 'opacity-100' : 'scale-90 opacity-0',
            )}
          />
          <span className={cn(button.base, button.variants.secondary, button.sizes.sm, 'h-7 text-xs')}>
            {p.changeLogo}
          </span>
          <span className={cn(checkbox.wrapper, 'text-xs text-text-muted')}>
            <span className="mt-0.5 h-3.5 w-3.5 rounded border border-border-strong bg-surface" />
            {p.noLogo}
          </span>
        </div>
        <div className={cn(pdfWindow.box, 'gap-2 p-3')}>
          {p.sections.map((s, i) => (
            <span
              key={s.label}
              className="flex items-center gap-2 text-xs text-text"
              style={{ '--stagger': i } as CSSProperties}
            >
              <span
                className={cn(
                  'grid h-3.5 w-3.5 place-items-center rounded border tint-anim',
                  ready ? 'border-brand-600 bg-brand-600 text-on-solid' : 'border-border-strong bg-surface',
                )}
              >
                {ready ? (
                  <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                ) : null}
              </span>
              {s.label}
            </span>
          ))}
        </div>
        <span
          className={cn(
            button.base,
            button.variants.primary,
            button.sizes.sm,
            'transition-shadow',
            ready && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-surface',
          )}
        >
          {p.download}
        </span>
      </div>
    </div>
  )
}
