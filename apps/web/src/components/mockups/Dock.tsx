import { cn } from '../../lib/cn'
import { dock } from './appUi'

export interface DockChip {
  label: string
  initials: string
  count: number
  general?: boolean
  active?: boolean
  className?: string
}

/** The app's dock (Dock.tsx): minimised windows grouped by client. */
export function Dock({ chips, className }: { chips: DockChip[]; className?: string }) {
  return (
    <div className={cn(dock.bar, 'overflow-hidden', className)}>
      {chips.map((c) => (
        <span key={c.label} className={cn(dock.chip, c.active && dock.chipActive, c.className)}>
          <span className={c.general ? dock.avatarGeneral : dock.avatar}>{c.initials}</span>
          {c.label}
          <span className={dock.count}>{c.count}</span>
        </span>
      ))}
    </div>
  )
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .join('')
    .replace(/[^\p{L}]/gu, '')
    .slice(0, 2)
    .toUpperCase()
}
