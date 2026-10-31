/**
 * Typed access to the copy. Components never hard-code copy: they receive the
 * dictionary for their locale (`getDictionary`) and read typed keys from it.
 */
import { es } from './es'
import { en } from './en'

export type Dictionary = typeof es
export type Locale = 'es' | 'en'
export const LOCALES: readonly Locale[] = ['es', 'en'] as const
export const DEFAULT_LOCALE: Locale = 'es'

const dictionaries: Record<Locale, Dictionary> = { es, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es'
}

/** Replaces `{token}` placeholders. Unknown tokens are left untouched. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}

/** Splits a template around one `{token}` so a component can render a link in its place. */
export function splitAround(template: string, token: string): [string, string] {
  const marker = `{${token}}`
  const i = template.indexOf(marker)
  if (i === -1) return [template, '']
  return [template.slice(0, i), template.slice(i + marker.length)]
}
