/**
 * Keeps the CSP in vercel.json in sync with the built HTML.
 * Astro injects two tiny inline scripts for island hydration (astro-island runtime +
 * the client:visible directive). Instead of 'unsafe-inline', their SHA-256 hashes are
 * listed in script-src.
 *   node scripts/csp.mjs --check   fail if dist/ has an inline script whose hash is not allowed
 *   node scripts/csp.mjs --write   rewrite the hashes in vercel.json
 */
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const dist = path.join(root, 'dist')
const vercelPath = path.join(root, 'vercel.json')
const mode = process.argv[2] ?? '--check'

async function htmlFiles(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await htmlFiles(p)))
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}

const hashes = new Set()
let inlineStyles = 0
for (const file of await htmlFiles(dist)) {
  const html = await readFile(file, 'utf8')
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1]
    const type = /type="([^"]+)"/.exec(attrs)?.[1]
    if (type && type !== 'module' && type !== 'text/javascript') continue // data blocks (JSON-LD) are not executed
    hashes.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`)
  }
  inlineStyles += (html.match(/<style[\s>]/g) ?? []).length
}

const vercel = JSON.parse(await readFile(vercelPath, 'utf8'))
const header = vercel.headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')
if (!header) throw new Error('CSP header missing in vercel.json')
const directives = header.value
  .split(';')
  .map((d) => d.trim())
  .filter(Boolean)
const idx = directives.findIndex((d) => d.startsWith('script-src '))
const allowed = new Set(directives[idx].split(/\s+/).slice(1))

if (mode === '--write') {
  directives[idx] = ['script-src', "'self'", ...[...hashes].sort()].join(' ')
  header.value = directives.join('; ')
  await writeFile(vercelPath, JSON.stringify(vercel, null, 2) + '\n')
  console.log(`csp: wrote ${hashes.size} script hash(es) to vercel.json`)
} else {
  const missing = [...hashes].filter((h) => !allowed.has(h))
  if (allowed.has("'unsafe-inline'")) throw new Error("csp: script-src must not contain 'unsafe-inline'")
  if (missing.length) {
    console.error(
      `csp: inline script hash(es) not in vercel.json script-src:\n  ${missing.join('\n  ')}\nRun: node scripts/csp.mjs --write`,
    )
    process.exit(1)
  }
  console.log(
    `csp: ok (${hashes.size} inline script hash(es) allowed, ${inlineStyles} inline <style> blocks)`,
  )
}
