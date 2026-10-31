import type { Locale } from './index'

export type RouteKey = 'home' | 'privacy' | 'legal'

/** Canonical paths (trailing slash, matching Astro's directory build output). */
export const ROUTES: Record<RouteKey, Record<Locale, string>> = {
  home: { es: '/', en: '/en/' },
  privacy: { es: '/privacidad/', en: '/en/privacy/' },
  legal: { es: '/aviso-legal/', en: '/en/legal/' },
}

export const APP_URL = 'https://app.nyamia.com'

export const ANCHORS = {
  howItWorks: 'como-funciona',
  features: 'funciones',
  faq: 'preguntas',
  demo: 'demo',
} as const

export function path(route: RouteKey, locale: Locale): string {
  return ROUTES[route][locale]
}

/** Link to a section of the landing from any page of the locale. */
export function anchor(locale: Locale, id: string, onHome: boolean): string {
  return onHome ? `#${id}` : `${ROUTES.home[locale]}#${id}`
}
