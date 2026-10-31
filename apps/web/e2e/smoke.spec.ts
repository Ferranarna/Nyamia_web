import { expect, test } from '@playwright/test'
import { es } from '../src/i18n/es'
import { en } from '../src/i18n/en'

const pages = [
  { locale: 'es', url: '/', t: es, alt: '/en/' },
  { locale: 'en', url: '/en/', t: en, alt: '/' },
] as const

for (const { locale, url, t, alt } of pages) {
  test.describe(`landing ${locale}`, () => {
    test(`renders every section from i18n @mobile`, async ({ page }) => {
      await page.goto(url)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page).toHaveTitle(t.meta.title)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.hero.headline)
      for (const h of [
        t.problem.headline,
        t.howItWorks.headline,
        t.features.headline,
        t.control.headline,
        t.demo.headline,
        t.faq.headline,
      ]) {
        await expect(page.getByRole('heading', { level: 2, name: h })).toBeAttached()
      }
      for (const id of ['como-funciona', 'funciones', 'demo', 'preguntas']) {
        await expect(page.locator(`#${id}`)).toBeAttached()
      }
      await expect(page.locator('[data-story-step]')).toHaveCount(t.howItWorks.steps.length)
      await expect(page.getByTestId('features').locator('> li')).toHaveCount(t.features.items.length)
      await expect(page.locator('#preguntas details')).toHaveCount(t.faq.items.length)
      await expect(page.getByTestId('demo-form')).toBeVisible()
      // Header CTA → #demo, Entrar → app.
      await expect(page.locator('[data-cta="header"]')).toHaveAttribute('href', '#demo')
      await expect(page.locator(`header a[href="https://app.nyamia.com"]`).first()).toBeAttached()
    })

    test('SEO: canonical, hreflang (+x-default), OG, JSON-LD', async ({ page }) => {
      await page.goto(url)
      const abs = (p: string) => `https://nyamia.com${p}`
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', abs(url))
      await expect(page.locator('link[hreflang="es"]')).toHaveAttribute('href', abs('/'))
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', abs('/en/'))
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', abs('/'))
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', t.meta.description)
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        abs(`/og-${locale}.png`),
      )
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}')
      expect(ld['@type']).toBe('SoftwareApplication')
      expect(ld).not.toHaveProperty('aggregateRating')
      expect(ld).not.toHaveProperty('offers')
      expect(ld).not.toHaveProperty('review')
      const og = await page.request.get(`/og-${locale}.png`)
      expect(og.status()).toBe(200)
      // Language switch points at the other locale.
      await expect(page.locator(`header a[hreflang]`).first()).toHaveAttribute('href', alt)
    })
  })
}

test('legal pages, 404, robots and sitemap', async ({ page, request }) => {
  for (const [url, title] of [
    ['/privacidad/', es.privacy.title],
    ['/en/privacy/', en.privacy.title],
    ['/aviso-legal/', es.legal.title],
    ['/en/legal/', en.legal.title],
  ] as const) {
    await page.goto(url)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    await expect(page.locator('link[hreflang="x-default"]')).toBeAttached()
  }
  const res = await page.goto('/no-existe/')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(es.notFound.headline)
  expect(await (await request.get('/robots.txt')).text()).toContain(
    'Sitemap: https://nyamia.com/sitemap-index.xml',
  )
  const sitemap = await (await request.get('/sitemap-0.xml')).text()
  for (const p of ['/', '/en/', '/privacidad/', '/en/privacy/'])
    expect(sitemap).toContain(`https://nyamia.com${p}<`)
  expect(sitemap).not.toContain('404')
})

test('mobile: no horizontal overflow and the menu sheet works @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const url of ['/', '/en/']) {
    await page.goto(url)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, url).toBeLessThanOrEqual(0)
  }
  const toggle = page.locator('[data-menu-toggle]')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#mobile-sheet')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#mobile-sheet')).toBeHidden()
  await expect(toggle).toBeFocused()
})

test('desktop: the story stage hydrates and follows the scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const stage = page.getByTestId('story-stage')
  await page.getByTestId('story-step-0').scrollIntoViewIfNeeded()
  await expect(page.locator('[data-story]')).toHaveAttribute('data-enhanced', 'true')
  for (const i of [1, 3, 5]) {
    await page.getByTestId(`story-step-${i}`).evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await expect(stage).toHaveAttribute('data-step', String(i))
  }
  // Per-step static frames are replaced by the stage at desktop width.
  await expect(page.locator('.story-frame').first()).toBeHidden()
})

for (const url of ['/privacidad/', '/en/privacy/', '/aviso-legal/', '/en/legal/']) {
  test(`legal page ${url} shows the contact as mailto and no placeholders`, async ({ page }) => {
    await page.goto(url)
    await expect(page.locator('article a[href="mailto:farnausgar@gmail.com"]').first()).toBeVisible()
    await expect(page.locator('article')).not.toContainText('PENDIENTE')
    await expect(page.locator('article mark')).toHaveCount(0)
  })
}
