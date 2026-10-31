import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { Dictionary } from '../../i18n'
import { button, historyItem } from './appUi'

type T = Dictionary['mockup']

export function MockBrand({ t, logoSrc, size = 28 }: { t: T; logoSrc: string; size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <img src={logoSrc} alt="" width={size} height={size} className="rounded-control" />
      <span className="text-base font-semibold tracking-tight text-text">{t.appName}</span>
    </span>
  )
}

/** P2 · WorkspaceShell: sidebar with prompt history (desktop) or the mobile top bar. */
export function WorkspaceFrame({
  t,
  logoSrc,
  variant,
  activeHistory = 0,
  heroHistory = false,
  children,
  className,
}: {
  t: T
  logoSrc: string
  variant: 'desktop' | 'mobile'
  activeHistory?: number
  heroHistory?: boolean
  children: ReactNode
  className?: string
}) {
  if (variant === 'mobile') {
    return (
      <div className={cn('flex flex-col bg-canvas', className)}>
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <span className="text-lg text-text-muted">☰</span>
          <MockBrand t={t} logoSrc={logoSrc} size={24} />
        </div>
        <div className="flex flex-col gap-3 p-3">{children}</div>
      </div>
    )
  }
  return (
    <div className={cn('flex bg-canvas', className)}>
      <aside className="flex w-56 shrink-0 flex-col gap-3 border-r border-border bg-surface px-3 py-4">
        <div className="px-2">
          <MockBrand t={t} logoSrc={logoSrc} />
        </div>
        <span className={cn(button.base, button.variants.secondary, button.sizes.sm, 'justify-start')}>
          {t.sidebar.newSession}
        </span>
        <div>
          <p className={historyItem.group}>{t.sidebar.historyTitle}</p>
          {t.sidebar.history.map((h, i) => (
            <p
              key={h.label}
              className={cn(
                historyItem.base,
                'block',
                i === activeHistory && historyItem.active,
                heroHistory && i === 0 && 'hero-history',
              )}
            >
              {h.label}
            </p>
          ))}
        </div>
        <p className="mt-auto px-3 text-sm text-text-muted">{t.sidebar.settings}</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">{children}</div>
    </div>
  )
}
