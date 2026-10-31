import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { windowFrame } from './appUi'

/** P1 · The app's window chrome (WindowFrame.tsx). Inert: actions are spans. */
export function AppWindow({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <div className={cn(windowFrame.base.replace('animate-window-in ', ''), className)}>
      <div className={windowFrame.header}>
        <div className="min-w-0 flex-1">
          <p className={windowFrame.title}>{title}</p>
          {subtitle ? <p className={windowFrame.subtitle}>{subtitle}</p> : null}
        </div>
        {actions}
        <span className={windowFrame.action}>–</span>
        <span className={windowFrame.action}>✕</span>
      </div>
      <div className={cn(windowFrame.body.replace('overflow-y-auto', 'overflow-hidden'), bodyClassName)}>
        {children}
      </div>
    </div>
  )
}
