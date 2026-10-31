import { expect, test } from '@playwright/test'
import { es } from '../src/i18n/es'

test.use({ reducedMotion: 'reduce' })

test('reduced motion: hero renders its final state immediately @mobile', async ({ page }) => {
  await page.goto('/')
  const hero = page.getByTestId('hero-product')
  const visible = hero.locator(':visible[data-status]')
  const count = await visible.count()
  if (count) {
    // Desktop window: all 7 days already green with "Cumple".
    for (let i = 0; i < count; i++) await expect(visible.nth(i)).toHaveAttribute('data-status', 'green')
    const op = await hero
      .locator('.hero-card')
      .first()
      .evaluate((el) => getComputedStyle(el).opacity)
    expect(op).toBe('1')
  }
  // Reveal content is fully visible without scrolling into view.
  const reveal = page.locator('[data-reveal]').last()
  expect(await reveal.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  expect(await reveal.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
})

test('reduced motion: stage jumps straight to each step rest state', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const stage = page.getByTestId('story-stage')
  await page.getByTestId('story-step-0').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await expect(page.locator('[data-story]')).toHaveAttribute('data-enhanced', 'true')
  await page.getByTestId('story-step-3').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await expect(stage).toHaveAttribute('data-step', '3')
  // Final fitted state without waiting for a sequence: 6 green + Sunday orange.
  const statuses = stage.getByTestId('day-status')
  await expect(statuses).toHaveText(
    [...Array(6).fill(es.mockup.menu.status.green), es.mockup.menu.status.orange],
    {
      timeout: 250,
    },
  )
  await page.getByTestId('story-step-4').evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await expect(statuses).toHaveText(Array(7).fill(es.mockup.menu.status.green), { timeout: 250 })
})

test('reduced motion: mobile frames show final states @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const frame = page.getByTestId('story-step-3').locator('.story-frame')
  await frame.scrollIntoViewIfNeeded()
  await expect(frame.locator('[data-status="green"]').first()).toBeVisible()
  expect(await frame.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
})
