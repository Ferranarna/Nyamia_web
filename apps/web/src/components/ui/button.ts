/** Site buttons = the app's `button` recipe (mockups/appUi.ts) + marketing sizes. */
import { button } from '../mockups/appUi'

export type ButtonVariant = keyof typeof button.variants
export type ButtonSize = keyof typeof button.sizes

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return [button.base, button.variants[variant], button.sizes[size], 'group/btn whitespace-nowrap', extra]
    .filter(Boolean)
    .join(' ')
}
