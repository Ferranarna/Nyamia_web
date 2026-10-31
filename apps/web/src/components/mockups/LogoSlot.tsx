import { cn } from '../../lib/cn'

/** Generic "Tu logo" placeholder (never a made-up clinic brand). */
export function LogoSlot({
  label,
  className,
  small,
}: {
  label: string
  className?: string
  small?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-control border border-dashed border-border-strong bg-surface text-brand-700',
        small ? 'px-1.5 py-0.5 text-[8px]' : 'px-2.5 py-1.5 text-xs font-medium',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        width={small ? 10 : 18}
        height={small ? 10 : 18}
        aria-hidden="true"
        className="text-brand-600"
      >
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="7.5" r="1.6" fill="currentColor" />
        <circle cx="16" cy="13.5" r="1.6" fill="currentColor" />
        <circle cx="8" cy="13.5" r="1.6" fill="currentColor" />
      </svg>
      {label}
    </span>
  )
}
