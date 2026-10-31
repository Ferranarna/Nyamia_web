/** JS mirror of the motion tokens (ux.md §6.3). */
export const EASE_EXPRESSIVE = [0.16, 1, 0.3, 1] as const
export const EASE_UI = [0.2, 0, 0, 1] as const
export const SPRING_SNAP = { type: 'spring', stiffness: 380, damping: 30, mass: 1 } as const
export const STAGGER_REVEAL = 0.07
export const STAGGER_CELL = 0.025
