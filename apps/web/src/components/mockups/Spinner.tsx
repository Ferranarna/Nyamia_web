import { cn } from '../../lib/cn'
import { spinner } from './appUi'

export function Spinner({ className }: { className?: string }) {
  return <span className={cn(spinner.base, spinner.sizes.sm, className)} />
}
