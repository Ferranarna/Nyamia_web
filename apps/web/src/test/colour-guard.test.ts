import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/** Tokens only: no raw colours in components/layouts (same rule as the product app). */
const ROOTS = ['src/components', 'src/layouts'].map((r) => path.resolve(__dirname, '..', '..', r))
const EXT = /\.(astro|tsx?|css)$/

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const UTIL =
  'bg|text|border(?:-[trblxy])?|ring|ring-offset|from|via|to|fill|stroke|outline|decoration|shadow|accent|caret|divide|placeholder'
const RULES: Array<[string, RegExp]> = [
  ['hex colour', /(?<![\w&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/],
  ['rgb()/hsl()/oklch() literal', /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*\d/],
  ['Tailwind palette class', new RegExp(`(?<![\\w-])(?:[\\w-]+:)*(?:${UTIL})-(?:${PALETTE})-\\d{2,3}\\b`)],
  ['Tailwind white/black class', new RegExp(`(?<![\\w-])(?:[\\w-]+:)*(?:${UTIL})-(?:white|black)\\b`)],
  [
    'named CSS colour',
    /\b(?:color|background(?:-color)?|fill|stroke)\s*:\s*(?:white|black|red|green|blue|orange|purple)\b/,
  ],
]

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name)
    return statSync(p).isDirectory() ? files(p) : EXT.test(p) ? [p] : []
  })
}

describe('colour-literal guard', () => {
  const all = ROOTS.flatMap(files)

  it('scans the component and layout sources', () => {
    expect(all.length).toBeGreaterThan(20)
  })

  it.each(all.map((f) => [path.relative(process.cwd(), f), f]))('%s uses tokens only', (_rel, file) => {
    const offences: string[] = []
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        for (const [name, re] of RULES) if (re.test(line)) offences.push(`${i + 1}: ${name}: ${line.trim()}`)
      })
    expect(offences).toEqual([])
  })

  it('detects offences (self-test)', () => {
    const hits = ['bg-green-500', 'text-white', 'color: #fff', 'rgb(1 2 3)', 'hover:border-red-400'].filter(
      (s) => RULES.some(([, re]) => re.test(s)),
    )
    expect(hits).toHaveLength(5)
  })
})
