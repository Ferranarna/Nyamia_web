import { expect, test, type Page } from '@playwright/test'
import { es } from '../src/i18n/es'
import { en } from '../src/i18n/en'

const API = '**/api/v1/demo-requests'

async function fill(page: Page, t: typeof es) {
  const form = page.getByTestId('demo-form')
  await form.scrollIntoViewIfNeeded()
  await expect(form).toHaveAttribute('data-ready', 'true')
  await form.getByLabel(t.demo.form.name.label).fill('Ana Pérez')
  await form.getByLabel(t.demo.form.email.label).fill('ana@example.com')
  await form.getByText(t.demo.form.role.options.dietitian_private).click()
  await form.getByRole('checkbox').check()
}

test('202 → inline success, payload per contract, single request @mobile', async ({ page }) => {
  const bodies: unknown[] = []
  await page.route(API, async (route) => {
    bodies.push(route.request().postDataJSON())
    // Long enough that the forced second click always lands while the request is in flight.
    await new Promise((r) => setTimeout(r, 1500))
    await route.fulfill({ status: 202, contentType: 'application/json', body: '{"status":"received"}' })
  })
  await page.goto('/')
  await fill(page, es)
  const submit = page.getByTestId('submit')
  await submit.click()
  await expect(submit).toBeDisabled()
  // Short timeout: if the 202 lands first, the button is unmounted and the click must not wait out the test.
  await submit.click({ force: true, timeout: 500 }).catch(() => {})
  await expect(page.getByTestId('form-success')).toBeVisible()
  await expect(page.getByRole('heading', { name: es.demo.success.title })).toBeFocused()
  expect(bodies).toHaveLength(1)
  expect(bodies[0]).toMatchObject({
    name: 'Ana Pérez',
    email: 'ana@example.com',
    role: 'dietitian_private',
    locale: 'es',
    consent: true,
    privacy_version: '2026-10-30',
    website: '',
  })
  expect(await page.context().cookies()).toEqual([])
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
})

test('422 → per-field errors from fields[]', async ({ page }) => {
  await page.route(API, (route) =>
    route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: '{"detail":"invalid_request","fields":["email"]}',
    }),
  )
  await page.goto('/en/')
  await fill(page, en)
  await page.getByTestId('submit').click()
  await expect(page.getByText(en.demo.validation.emailInvalid)).toBeVisible()
  await expect(page.getByTestId('demo-form').getByLabel(en.demo.form.email.label)).toBeFocused()
  await expect(page.getByTestId('demo-form').getByLabel(en.demo.form.name.label)).toHaveValue('Ana Pérez')
})

test('429 → rate-limit message with minutes from Retry-After', async ({ page }) => {
  await page.route(API, (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      headers: { 'Retry-After': '1800' },
      body: '{"detail":"too_many_requests"}',
    }),
  )
  await page.goto('/')
  await fill(page, es)
  await page.getByTestId('submit').click()
  await expect(page.getByTestId('form-banner')).toHaveText(
    es.demo.errors.tooManyRequestsRetry.replace('{minutes}', '30'),
  )
})

test('client validation blocks an empty submit without calling the API', async ({ page }) => {
  let called = false
  await page.route(API, (route) => {
    called = true
    return route.fulfill({ status: 202, body: '{}' })
  })
  await page.goto('/')
  const form = page.getByTestId('demo-form')
  await form.scrollIntoViewIfNeeded()
  await expect(form).toHaveAttribute('data-ready', 'true')
  await page.getByTestId('submit').click()
  await expect(page.getByText(es.demo.validation.nameRequired)).toBeVisible()
  await expect(form.getByLabel(es.demo.form.name.label)).toBeFocused()
  expect(called).toBe(false)
})
