/**
 * Generates committed brand derivatives from packages/brand (run: pnpm --filter @nyamia/web brand:assets).
 * - public/favicon-32.png, public/favicon-192.png, public/apple-touch-icon.png  (from logo-original.png, not redrawn)
 * - public/og-es.png, public/og-en.png  (1200×630, rendered with Playwright's Chromium from tokens + logo + i18n copy)
 * Everything is local: no network requests.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import path from 'node:path'
import sharp from 'sharp'
import { chromium } from '@playwright/test'
import { es } from '../src/i18n/es.ts'
import { en } from '../src/i18n/en.ts'

const require = createRequire(import.meta.url)
const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const brandDir = path.dirname(require.resolve('@nyamia/brand/tokens.css'))
const logoPath = path.join(brandDir, 'assets/logo-original.png')
const pub = (f) => path.join(root, 'public', f)

// Favicons: square crop around the mark (trim the white margin, keep a small pad).
const trimmed = await sharp(logoPath).trim({ threshold: 10 }).toBuffer()
const padded = await sharp(trimmed)
  .extend({ top: 40, bottom: 40, left: 40, right: 40, background: '#ffffff' })
  .toBuffer()
for (const [file, size] of [
  ['favicon-32.png', 32],
  ['favicon-192.png', 192],
  ['apple-touch-icon.png', 180],
]) {
  await sharp(padded).resize(size, size, { fit: 'contain', background: '#ffffff' }).png().toFile(pub(file))
}

// Token values (read from the single source).
const tokens = await readFile(path.join(brandDir, 'tokens.css'), 'utf8')
const tok = (name) => {
  const m = tokens.match(new RegExp(`--${name}:\\s*([^;]+);`))
  if (!m) throw new Error(`token ${name} missing`)
  return m[1].trim()
}
const fontFile = require.resolve('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')
const font = (await readFile(fontFile)).toString('base64')
const logo = (await sharp(logoPath).resize(256).png().toBuffer()).toString('base64')

function html(dict) {
  const days = dict.mockup.menu.days.slice(0, 5)
  return `<!doctype html><html><head><style>
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:Inter;color:${tok('color-text')};background:${tok('color-canvas')};
background-image:radial-gradient(1000px 480px at 10% -120px, ${tok('color-brand-100')}, transparent 70%);
display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;overflow:hidden;position:relative}
.brand{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:600;letter-spacing:-.02em}
.brand img{width:64px;height:64px;border-radius:${tok('radius-control')}}
h1{font-size:78px;line-height:1.02;letter-spacing:-.035em;font-weight:680;max-width:760px}
p{font-size:30px;max-width:900px;color:${tok('color-text-muted')};margin-top:22px}
p b{color:${tok('color-brand-700')};font-weight:600}
.week{position:absolute;right:-60px;top:40px;display:flex;gap:10px;transform:rotate(-4deg)}
.day{width:118px;border-radius:${tok('radius-card')};border:1px solid ${tok('color-brand-100')};background:${tok('color-brand-50')};padding:12px;font-size:16px}
.day b{display:block;font-size:17px;margin-bottom:4px}
.day span{color:${tok('color-brand-700')};font-weight:600}
.card{margin-top:8px;height:34px;border-radius:${tok('radius-control')};background:${tok('color-surface')};box-shadow:${tok('shadow-sm')}}
</style></head><body>
<div class="brand"><img src="data:image/png;base64,${logo}" alt="">${dict.meta.siteName}</div>
<div><h1>${dict.hero.headline}</h1><p>${dict.hero.tagline.replace(/,([^,]+)\.$/, ', <b>$1</b>.')}</p></div>
<div class="week">${days
    .map(
      (d) =>
        `<div class="day"><b>${d.short}, ${d.date}</b><span>${dict.mockup.menu.status.green}</span><div class="card"></div><div class="card"></div><div class="card"></div></div>`,
    )
    .join('')}</div>
</body></html>`
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.route(/^(?!data:|about:)/, (route) => route.abort())
for (const [locale, dict] of [
  ['es', es],
  ['en', en],
]) {
  await page.setContent(html(dict))
  await page.evaluate(() => document.fonts.ready)
  const png = await page.screenshot({ type: 'png' })
  await writeFile(
    pub(`og-${locale}.png`),
    await sharp(png).png({ compressionLevel: 9, palette: true }).toBuffer(),
  )
}
await browser.close()
console.log('brand assets written to public/')
