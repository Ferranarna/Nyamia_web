import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'
import { button, commandBar } from './appUi'
import type { Dictionary } from '../../i18n'

type Mode = 'empty' | 'typed' | 'hero'

/**
 * 1 · CommandBar. `progress` (0–1) reveals the prompt in StoryStage; `hero` splits it
 * into per-character spans for the CSS typing timeline (no JS).
 */
export function CommandBar({
  t,
  mode,
  progress = 1,
  pressed = false,
  className,
}: {
  t: Dictionary['mockup']
  mode: Mode
  progress?: number
  pressed?: boolean
  className?: string
}) {
  const prompt = t.commandBar.prompt
  const visible = mode === 'typed' ? prompt.slice(0, Math.round(prompt.length * progress)) : ''
  return (
    <div className={cn(commandBar.wrapper, 'items-center', className)}>
      <div className="min-h-6 flex-1 self-center py-1 text-base">
        {mode === 'empty' ? <span className="text-text-muted">{t.commandBar.placeholder}</span> : null}
        {mode === 'typed' ? (
          <span className="text-text">
            {visible}
            {progress < 1 ? <span className="ml-px inline-block h-5 w-px translate-y-1 bg-text" /> : null}
          </span>
        ) : null}
        {mode === 'hero' ? (
          <span className="text-text">
            {Array.from(prompt).map((ch, i) => (
              <span key={i} className="hero-char" style={{ '--c': i } as CSSProperties}>
                {ch}
              </span>
            ))}
            <span className="hero-caret ml-px inline-block h-5 w-px translate-y-1 bg-text opacity-0" />
          </span>
        ) : null}
      </div>
      <span
        className={cn(
          button.base,
          button.variants.primary,
          button.sizes.md,
          mode === 'hero' && 'hero-send',
          pressed && 'scale-95 bg-brand-700',
          'transition-transform',
        )}
      >
        {t.commandBar.send}
      </span>
    </div>
  )
}
