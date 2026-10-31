import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { LOCAL, scrollThrough } from './helpers'

for (const url of ['/', '/en/', '/privacidad/', '/en/privacy/']) {
  test(`axe: no serious/critical violations on ${url} @mobile`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(url)
    await scrollThrough(page)
    await page.evaluate(() => window.scrollTo(0, 0))
    // @axe-core/playwright types track a newer Playwright than the pinned 1.63 (local Chromium build).
    type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page']
    const results = await new AxeBuilder({ page: page as unknown as AxePage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(
      bad.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(' '))
            .slice(0, 5)
            .join(' | ')}`,
      ),
    ).toEqual([])
  })
}

for (const url of ['/', '/en/']) {
  test(`no third-party requests and no cookies on ${url} @mobile`, async ({ page }) => {
    const foreign: string[] = []
    page.on('request', (req) => {
      if (!LOCAL.test(req.url())) foreign.push(req.url())
    })
    await page.goto(url)
    await scrollThrough(page, 400, 60)
    await page.waitForLoadState('networkidle')
    expect(foreign).toEqual([])
    expect(await page.context().cookies()).toEqual([])
  })
}
