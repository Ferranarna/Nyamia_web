import type { Page } from '@playwright/test'

/** Scrolls the whole page in steps so on-enter content and islands activate. */
export async function scrollThrough(page: Page, step = 500, pause = 40) {
  await page.evaluate(
    async ([s, p]) => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += s) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, p))
      }
    },
    [step, pause] as const,
  )
}

export const LOCAL = /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/|data:|blob:|about:)/
