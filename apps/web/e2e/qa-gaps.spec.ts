import { expect, test, type Page } from '@playwright/test'
import { es } from '../src/i18n/es'
import { en } from '../src/i18n/en'

/**
 * QA gap coverage for 001 (added by QA): no-JS readability, 413/5xx/network form states,
 * keyboard-only completion with visible focus, mobile 390 px overflow per page.
 */

const API = '**/api/v1/demo-requests'

const landings = [
  { url: '/', t: es },
  { url: '/en/', t: en },
] as const

test.describe('JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false })

  for (const { url, t } of landings) {
    test(`${url}: all copy is static HTML and visible @mobile`, async ({ page }) => {
      await page.goto(url)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t.hero.headline)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      for (const h of [
        t.problem.headline,
        t.howItWorks.headline,
        t.features.headline,
        t.control.headline,
        t.demo.headline,
        t.faq.headline,
      ]) {
        const heading = page.getByRole('heading', { level: 2, name: h })
        await heading.scrollIntoViewIfNeeded()
        await expect(heading).toBeVisible()
      }
      // Story steps and feature items are present as text.
      for (const step of t.howItWorks.steps) await expect(page.getByText(step.title).first()).toBeAttached()
      await expect(page.getByTestId('features').locator('> li')).toHaveCount(t.features.items.length)
      // FAQ answers reachable natively (<details>), no JS needed.
      const first = page.locator('#preguntas details').first()
      await first.locator('summary').click()
      await expect(first).toHaveAttribute('open', '')
      await expect(first.getByText(t.faq.items[0]!.a.slice(0, 30), { exact: false })).toBeVisible()
      // Reveal-on-enter content is not stuck hidden.
      const hidden = await page.$$eval(
        '[data-reveal], .trick-pop',
        (els) => els.filter((el) => Number(getComputedStyle(el).opacity) < 1).length,
      )
      expect(hidden).toBe(0)
      // The form explains it needs JS; its labels are server-rendered.
      // Playwright's text engine skips <noscript>; check the parsed DOM directly.
      const notice = await page.locator('#demo noscript').evaluate((ns) => {
        const p = ns.querySelector('p')
        return p ? { text: p.textContent?.trim(), h: p.getBoundingClientRect().height } : null
      })
      expect(notice?.text).toBe(t.demo.form.noScript)
      expect(notice?.h ?? 0).toBeGreaterThan(0)
      const form = page.getByTestId('demo-form')
      await expect(form.getByLabel(t.demo.form.name.label)).toBeAttached()
      await expect(page.getByTestId('submit')).toBeDisabled()
    })
  }

  for (const [url, title] of [
    ['/privacidad/', es.privacy.title],
    ['/en/privacy/', en.privacy.title],
    ['/aviso-legal/', es.legal.title],
    ['/en/legal/', en.legal.title],
  ] as const) {
    test(`${url}: legal page readable without JS @mobile`, async ({ page }) => {
      await page.goto(url)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const h2 = page.getByRole('heading', { level: 2 })
      expect(await h2.count()).toBeGreaterThan(0)
      await expect(h2.first()).toBeVisible()
    })
  }
})

async function fillValid(page: Page) {
  const form = page.getByTestId('demo-form')
  await form.scrollIntoViewIfNeeded()
  await expect(form).toHaveAttribute('data-ready', 'true')
  await form.getByLabel(es.demo.form.name.label).fill('Ana Pérez')
  await form.getByLabel(es.demo.form.email.label).fill('ana@example.com')
  await form.getByText(es.demo.form.role.options.dietitian_private).click()
  await form.getByRole('checkbox').check()
}

test('413 → "too long" banner, no retry, values kept', async ({ page }) => {
  await page.route(API, (route) =>
    route.fulfill({ status: 413, contentType: 'application/json', body: '{"detail":"payload_too_large"}' }),
  )
  await page.goto('/')
  await fillValid(page)
  await page.getByTestId('submit').click()
  const banner = page.getByTestId('form-banner')
  await expect(banner).toHaveText(es.demo.errors.tooLarge)
  await expect(banner).toHaveAttribute('role', 'alert')
  await expect(banner.getByRole('button', { name: es.demo.errors.retry })).toHaveCount(0)
  await expect(page.getByTestId('demo-form').getByLabel(es.demo.form.name.label)).toHaveValue('Ana Pérez')
  await expect(page.getByTestId('submit')).toBeEnabled()
})

for (const status of [500, 502, 503]) {
  test(`${status} → server banner with retry; retry then succeeds`, async ({ page }) => {
    let calls = 0
    await page.route(API, (route) => {
      calls += 1
      return calls === 1
        ? route.fulfill({ status, contentType: 'application/json', body: '{"detail":"internal_error"}' })
        : route.fulfill({ status: 202, contentType: 'application/json', body: '{"status":"received"}' })
    })
    await page.goto('/en/')
    const form = page.getByTestId('demo-form')
    await form.scrollIntoViewIfNeeded()
    await expect(form).toHaveAttribute('data-ready', 'true')
    await form.getByLabel(en.demo.form.name.label).fill('Ana Pérez')
    await form.getByLabel(en.demo.form.email.label).fill('ana@example.com')
    await form.getByText(en.demo.form.role.options.clinic).click()
    await form.getByRole('checkbox').check()
    await page.getByTestId('submit').click()
    const banner = page.getByTestId('form-banner')
    await expect(banner).toContainText(en.demo.errors.server)
    await expect(banner).toHaveAttribute('role', 'alert')
    await banner.getByRole('button', { name: en.demo.errors.retry }).click()
    await expect(page.getByTestId('form-success')).toBeVisible()
    expect(calls).toBe(2)
  })
}

test('network failure → network banner with retry', async ({ page }) => {
  await page.route(API, (route) => route.abort('connectionrefused'))
  await page.goto('/')
  await fillValid(page)
  await page.getByTestId('submit').click()
  const banner = page.getByTestId('form-banner')
  await expect(banner).toContainText(es.demo.errors.network)
  await expect(banner.getByRole('button', { name: es.demo.errors.retry })).toBeVisible()
})

/** Focus-indicator snapshot of an element and its wrapping <label> (for sr-only radios). */
async function focusLook(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    const pick = (e: Element | null) => {
      if (!e) return ''
      const s = getComputedStyle(e)
      return `${s.outlineStyle}|${s.outlineWidth}|${s.boxShadow}`
    }
    return { self: pick(el), label: pick(el.closest('label')) }
  })
}

test('keyboard only: reach, fill and submit the form with visible focus', async ({ page }) => {
  const bodies: Record<string, unknown>[] = []
  await page.route(API, async (route) => {
    bodies.push(route.request().postDataJSON())
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"status":"received"}' })
  })
  await page.goto('/')
  const form = page.getByTestId('demo-form')
  await form.scrollIntoViewIfNeeded()
  await expect(form).toHaveAttribute('data-ready', 'true')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('body').focus()

  const active = () =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLInputElement | null
      return el
        ? { tag: el.tagName, name: el.name ?? '', type: el.type ?? '', testid: el.dataset.testid ?? '' }
        : null
    })

  /** Presses Tab until `match` holds (bounded); asserts a visible focus indicator on every stop inside the form. */
  async function tabTo(match: (a: Awaited<ReturnType<typeof active>>) => boolean, max = 120) {
    for (let i = 0; i < max; i++) {
      await page.keyboard.press('Tab')
      const a = await active()
      const inForm = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[data-testid="demo-form"]')),
      )
      if (inForm) {
        const focused = await focusLook(page)
        // Move nowhere: compare against the same element when it is not focused.
        const unfocused = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement
          el.blur()
          const pick = (e: Element | null) => {
            if (!e) return ''
            const s = getComputedStyle(e)
            return `${s.outlineStyle}|${s.outlineWidth}|${s.boxShadow}`
          }
          const res = { self: pick(el), label: pick(el.closest('label')) }
          el.focus({ focusVisible: true } as FocusOptions)
          return res
        })
        expect(
          focused.self !== unfocused.self || focused.label !== unfocused.label,
          `no visible focus change on ${JSON.stringify(a)}`,
        ).toBe(true)
      }
      if (match(a)) return
    }
    throw new Error('target not reachable with Tab')
  }

  await tabTo((a) => a?.name === 'name')
  await page.keyboard.type('Ana Pérez')
  await tabTo((a) => a?.name === 'email')
  await page.keyboard.type('ana@example.com')
  await tabTo((a) => a?.name === 'role')
  await page.keyboard.press('Space')
  await tabTo((a) => a?.name === 'consent')
  await page.keyboard.press('Space')
  await tabTo((a) => a?.testid === 'submit')
  await page.keyboard.press('Enter')

  await expect(page.getByTestId('form-success')).toBeVisible()
  await expect(page.getByRole('heading', { name: es.demo.success.title })).toBeFocused()
  expect(bodies).toHaveLength(1)
  expect(bodies[0]).toMatchObject({
    name: 'Ana Pérez',
    email: 'ana@example.com',
    role: 'dietitian_private',
    consent: true,
    website: '',
  })
})

for (const url of ['/', '/en/', '/privacidad/', '/en/privacy/', '/aviso-legal/', '/en/legal/']) {
  test(`390 px: no horizontal overflow after full scroll on ${url} @mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(url)
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 40))
      }
    })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    const wide = await page.$$eval('body *', (els) =>
      els
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && r.right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed'
        })
        .filter((el) => !el.closest('[aria-hidden="true"], .sr-only'))
        // Decorative layers clipped by an ancestor do not overflow the page.
        .filter((el) => {
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const o = getComputedStyle(a).overflowX
            if ((o === 'hidden' || o === 'clip') && a.getBoundingClientRect().right <= window.innerWidth + 1)
              return false
          }
          return true
        })
        .map((el) => `${el.tagName}.${(el.getAttribute('class') ?? '').slice(0, 40)}`)
        .slice(0, 5),
    )
    expect(wide, 'elements past the right edge').toEqual([])
  })
}
