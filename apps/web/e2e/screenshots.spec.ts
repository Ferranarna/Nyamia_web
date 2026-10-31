import { test } from '@playwright/test'
import path from 'node:path'

/** Visual review aid (not an assertion): full-page shots at 390 and 1440. Run with SHOTS_DIR set. */
const dir = process.env.SHOTS_DIR
test.skip(!dir, 'SHOTS_DIR not set')
// Full-page shots at 1440 under the high-DPR mobile project exceed 30 s when the suite runs in parallel.
test.describe.configure({ timeout: 120_000 })

for (const [name, url] of [
  ['es', '/'],
  ['en', '/en/'],
] as const) {
  for (const width of [390, 1440]) {
    test(`screenshot ${name} ${width} @mobile`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(url)
      // Scroll through so reveal-on-enter content is in its final state.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 30))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(300)
      await page.screenshot({ path: path.join(dir!, `${name}-${width}.png`), fullPage: true })
    })
  }
}

test('screenshot story stage steps 1440', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  for (let i = 0; i < 6; i++) {
    await page.getByTestId(`story-step-${i}`).evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(2600)
    await page.screenshot({ path: path.join(dir!, `stage-step-${i}.png`) })
  }
})
