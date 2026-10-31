import { describe, expect, it } from 'vitest'
import { es } from './es'
import { en } from './en'
import { PRIVACY_VERSION } from '../lib/privacy'

type Json = unknown

/** Deep shape: object keys, array lengths and leaf types must match. */
function shapeDiff(a: Json, b: Json, path = ''): string[] {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return [`${path}: array vs non-array`]
    if (a.length !== b.length) return [`${path}: length ${a.length} vs ${b.length}`]
    return a.flatMap((item, i) => shapeDiff(item, b[i], `${path}[${i}]`))
  }
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const ka = Object.keys(a).sort()
    const kb = Object.keys(b).sort()
    const missing = ka.filter((k) => !kb.includes(k)).map((k) => `${path}.${k}: missing in en`)
    const extra = kb.filter((k) => !ka.includes(k)).map((k) => `${path}.${k}: missing in es`)
    const nested = ka
      .filter((k) => kb.includes(k))
      .flatMap((k) =>
        shapeDiff((a as Record<string, Json>)[k], (b as Record<string, Json>)[k], `${path}.${k}`),
      )
    return [...missing, ...extra, ...nested]
  }
  return typeof a === typeof b ? [] : [`${path}: ${typeof a} vs ${typeof b}`]
}

function placeholders(o: Json, path = '', out: Record<string, string[]> = {}): Record<string, string[]> {
  if (typeof o === 'string') out[path] = (o.match(/\{\w+\}/g) ?? []).sort()
  else if (Array.isArray(o)) o.forEach((v, i) => placeholders(v, `${path}[${i}]`, out))
  else if (o && typeof o === 'object')
    for (const [k, v] of Object.entries(o)) placeholders(v, `${path}.${k}`, out)
  return out
}

describe('i18n parity', () => {
  it('es and en have the same deep key shape', () => {
    expect(shapeDiff(es, en)).toEqual([])
  })

  it('uses the same {placeholders} in both languages', () => {
    expect(placeholders(en)).toEqual(placeholders(es))
  })

  it('privacy version matches the form constant (API default)', () => {
    expect(es.privacy.version).toBe(PRIVACY_VERSION)
    expect(en.privacy.version).toBe(PRIVACY_VERSION)
    expect(PRIVACY_VERSION).toBe('2026-10-30')
  })

  it('declares its own language', () => {
    expect(es.meta.lang).toBe('es')
    expect(en.meta.lang).toBe('en')
  })

  // Founder decisions 2026-10-31 (copy-review.md § 6).
  it.each([
    ['es', es],
    ['en', en],
  ] as const)('%s: no placeholders, beta, founder or price copy', (_, dict) => {
    const text = JSON.stringify(dict)
    expect(text).not.toMatch(/PENDIENTE/)
    expect(text).not.toMatch(/\bbeta\b/i)
    expect(text).not.toMatch(/fundador|founder/i)
    expect(text).not.toMatch(/€|precio|price|pricing|cuánto cuesta|how much/i)
    expect(dict.faq.items.length).toBeGreaterThanOrEqual(5)
    expect(dict.faq.items.length).toBeLessThanOrEqual(7)
  })

  it('EN demo section says demos can be held in English', () => {
    expect(en.demo.languageNote).toMatch(/Spanish/)
    expect(en.demo.languageNote).toMatch(/demos can be held in English/i)
  })
})
