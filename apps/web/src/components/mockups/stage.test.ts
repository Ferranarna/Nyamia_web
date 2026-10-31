import { describe, expect, it } from 'vitest'
import { stageStateFor, STEP_COUNT } from './stageState'
import { dayView, MACRO_BARS, percentOf, TARGETS, WEEK } from './data'
import { es } from '../../i18n/es'

const within10 = (v: number, t: number) => Math.abs(v - t) / t <= 0.1

describe('scrollytelling stage states', () => {
  it('has one rest state per copy step', () => {
    expect(STEP_COUNT).toBe(es.howItWorks.steps.length)
  })

  it('fit step: 6 days green and Sunday orange', () => {
    const s = stageStateFor(3)
    expect(s.week).toBe('fitted')
    const statuses = WEEK.map((_, i) => dayView(i, s.week)!.status)
    expect(statuses.filter((x) => x === 'green')).toHaveLength(6)
    expect(statuses[6]).toBe('orange')
  })

  it('after the professional adjusts, every day is green', () => {
    const s = stageStateFor(4)
    expect(WEEK.map((_, i) => dayView(i, s.week)!.status)).toEqual(Array(7).fill('green'))
  })

  it('ends on the PDF window', () => {
    expect(stageStateFor(5).window).toBe('pdf')
    expect(stageStateFor(99).window).toBe('pdf')
    expect(stageStateFor(-3).window).toBe('client')
  })
})

describe('fictitious data is internally consistent', () => {
  it('targets match the ficha copy', () => {
    expect(es.mockup.client.targets.map((t) => Number(t.value))).toEqual([
      TARGETS.kcal,
      TARGETS.protein,
      TARGETS.carbs,
      TARGETS.fat,
    ])
  })

  it('statuses follow the app rule (green = kcal and P within ±10 %, red = kcal out)', () => {
    for (const mode of ['placed', 'fitted', 'final'] as const) {
      WEEK.forEach((_, i) => {
        const v = dayView(i, mode)!
        const kcalOk = within10(v.kcal, TARGETS.kcal)
        const pOk = within10(v.protein, TARGETS.protein)
        const expected = !kcalOk ? 'red' : pOk ? 'green' : 'orange'
        expect(`${mode}/${i}:${v.status}`).toBe(`${mode}/${i}:${expected}`)
      })
    }
  })

  it('MacroBars end inside the ±10 % band', () => {
    for (const m of MACRO_BARS) expect(Math.abs(percentOf(m.after, m.target) - 100)).toBeLessThanOrEqual(10)
  })
})
