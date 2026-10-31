import { cn } from '../../lib/cn'
import type { Dictionary } from '../../i18n'
import { button, input } from './appUi'
import { MODAL_EDIT } from './data'

type T = Dictionary['mockup']

/** 5 · RecipeModal (MenuRecipeModal.tsx): macro tiles + ingredient gram inputs. `edited` = after the tweak. */
export function RecipeModal({
  t,
  edited,
  grams,
  kcal,
  protein,
  focus = false,
  maxIngredients,
  className,
}: {
  t: T
  edited: boolean
  grams?: number
  kcal?: number
  protein?: number
  focus?: boolean
  maxIngredients?: number
  className?: string
}) {
  const m = t.recipeModal
  const g = grams ?? MODAL_EDIT.grams[edited ? 1 : 0]
  const k = kcal ?? MODAL_EDIT.kcal[edited ? 1 : 0]
  const p = protein ?? MODAL_EDIT.protein[edited ? 1 : 0]
  const tiles = m.macros.map((mac, i) => {
    if (i === 0) return { label: mac.label, value: String(k) }
    if (i === 1) return { label: mac.label, value: `${p} g` }
    return mac
  })
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-window border border-border bg-surface p-5 shadow-lg',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-text">{m.title}</p>
        <span className="rounded-full px-1.5 text-sm text-text-muted">✕</span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {tiles.map((tile, i) => (
          <div
            key={tile.label}
            className={cn(
              'rounded-card border border-border bg-surface-muted px-2 py-2 text-center tint-anim',
              edited && i < 2 && 'border-brand-200 bg-brand-50',
            )}
          >
            <p className="text-[11px] text-text-muted">{tile.label}</p>
            <p className="text-sm font-semibold text-text tabular-nums">{tile.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wide text-text-muted uppercase">
        {m.ingredientsLabel}
      </p>
      <div className="mt-2 flex flex-col gap-1.5">
        {m.ingredients.slice(0, maxIngredients).map((ing, i) => (
          <div key={ing.name} className="flex items-center justify-between gap-3 text-sm text-text">
            <span className="min-w-0 truncate">{ing.name}</span>
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  input.box,
                  input.state.default,
                  'w-20 py-1 text-right tabular-nums',
                  i === MODAL_EDIT.ingredient && focus && 'ring-2 ring-brand-500',
                )}
              >
                {i === MODAL_EDIT.ingredient ? g : parseInt(ing.grams, 10)}
              </span>
              <span className="text-text-muted">g</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <span className={cn(button.base, button.variants.secondary, button.sizes.sm)}>{m.cancel}</span>
        <span
          className={cn(
            button.base,
            button.variants.primary,
            button.sizes.sm,
            'transition-opacity',
            !edited && 'opacity-60',
          )}
        >
          {m.save}
        </span>
      </div>
    </div>
  )
}
