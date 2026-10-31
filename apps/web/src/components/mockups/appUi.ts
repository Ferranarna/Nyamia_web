/**
 * Class recipes copied from the product app so mockups look like the real UI.
 * SOURCE: ../NutriBot/frontend/src/shared/styles/ui.ts (copied 2026-10-30).
 * Interactive bits (hover/focus) are kept for fidelity; mockups are inert.
 */
export const button = {
  base: 'inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  variants: {
    primary: 'bg-brand-600 text-on-solid hover:bg-brand-700 focus-visible:ring-brand-500',
    accent: 'bg-accent-600 text-on-solid hover:bg-accent-700 focus-visible:ring-accent-500',
    secondary:
      'border border-border bg-surface text-text hover:bg-surface-muted focus-visible:ring-brand-500',
    ghost: 'text-text-muted hover:bg-surface-muted focus-visible:ring-brand-500',
    danger: 'bg-danger-600 text-on-solid hover:bg-danger-700 focus-visible:ring-danger-600',
  },
  sizes: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  },
}
export const input = {
  /** Website addition: same recipe without w-full, for fixed-width number boxes. */
  box: 'rounded-control border bg-surface px-3 py-2 text-sm text-text',
  base: 'w-full rounded-control border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
  state: {
    default: 'border-border',
    error: 'border-danger-400 focus-visible:ring-danger-600',
  },
}
export const checkbox = {
  wrapper: 'flex cursor-pointer items-start gap-2 select-none',
  input:
    'mt-0.5 h-4 w-4 shrink-0 rounded border-border text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
  labelText: 'flex flex-col gap-0.5 text-sm text-text',
  hint: 'text-xs text-text-muted',
}
export const formField = {
  wrapper: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium text-text',
  hint: 'text-xs text-text-muted',
  error: 'text-xs text-danger-600',
}
export const alert = {
  base: 'flex items-start gap-2 rounded-control border px-4 py-3 text-sm',
  variants: {
    info: 'border-border bg-surface-muted text-text',
    success: 'border-brand-100 bg-brand-50 text-brand-700',
    accent: 'border-accent-100 bg-accent-50 text-accent-600',
    error: 'border-danger-100 bg-danger-50 text-danger-700',
  },
}
export const badge = {
  base: 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
  variants: {
    brand: 'bg-brand-100 text-brand-700',
    accent: 'bg-accent-100 text-accent-600',
    neutral: 'bg-surface-muted text-text-muted',
  },
}
export const complianceTint = {
  green: 'bg-brand-50 border-brand-100',
  orange: 'bg-accent-50 border-accent-100',
  red: 'bg-danger-50 border-danger-100',
  none: 'bg-surface-muted border-border',
}
export const spinner = {
  base: 'inline-block animate-spin rounded-full border-2 border-brand-100 border-t-brand-600',
  sizes: {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  },
}
export const commandBar = {
  wrapper:
    'flex items-end gap-2 rounded-window border border-border-strong bg-surface p-3 pl-5 shadow-md focus-within:ring-2 focus-within:ring-brand-500',
  textarea:
    'max-h-48 min-h-6 flex-1 resize-none self-center bg-transparent py-1 text-base text-text placeholder:text-text-muted focus:outline-none disabled:opacity-60',
  hint: 'rounded-card border border-accent-100 bg-accent-50 px-4 py-3 text-sm text-accent-700',
  chip: 'rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text transition-colors hover:border-brand-300 hover:bg-brand-50',
}
export const historyItem = {
  group: 'px-2 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted',
  row: 'group flex items-center gap-1 rounded-control',
  base: 'min-w-0 flex-1 line-clamp-2 break-words rounded-control px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
  active: 'bg-brand-50 font-medium text-brand-700',
  remove:
    'shrink-0 rounded-full p-1.5 text-text-muted opacity-0 hover:bg-surface-muted focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 group-hover:opacity-100',
}
export const windowFrame = {
  base: 'flex min-h-0 flex-1 animate-window-in flex-col overflow-hidden rounded-window border border-window-border bg-surface shadow-window-active',
  header: 'flex items-center gap-3 border-b border-window-border bg-window-header px-4 py-3',
  title: 'text-sm font-semibold text-text',
  subtitle: 'truncate text-xs text-text-muted',
  body: 'min-h-0 flex-1 overflow-y-auto p-5',
  action:
    'rounded-full p-1.5 text-text-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
}
export const dock = {
  bar: 'flex gap-2 overflow-x-auto pb-1',
  chip: 'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-3 text-sm font-medium text-text shadow-window-minimized transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
  chipActive: 'border-brand-500 bg-brand-50 text-brand-700',
  avatar: 'grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700',
  avatarGeneral:
    'grid h-6 w-6 place-items-center rounded-full bg-accent-100 text-xs font-semibold text-accent-700',
  count: 'rounded-full bg-surface-muted px-2 text-xs font-semibold text-text-muted',
  dirtyDot: 'h-2 w-2 rounded-full bg-accent-500',
  menu: 'flex flex-wrap gap-2 rounded-card border border-border bg-surface p-2 shadow-md',
  menuItem:
    'rounded-control px-3 py-1.5 text-left text-sm text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
}
export const ficha = {
  form: 'flex flex-col gap-6',
  section: 'flex flex-col gap-3 border-b border-border pb-6',
  sectionTitle: 'text-xs font-semibold uppercase tracking-wide text-text-muted',
  grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  term: 'text-xs text-text-muted',
  value: 'text-sm text-text tabular-nums',
  empty: 'text-sm text-text-muted',
  tags: 'flex flex-wrap gap-2',
  actions: 'flex flex-wrap justify-end gap-3',
}
export const recipesPane = {
  grid: 'grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-2',
  pane: 'flex min-w-0 flex-col gap-4',
  paneTitle: 'text-xs font-semibold uppercase tracking-wide text-text-muted',
  row: 'flex flex-wrap items-start justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3',
  rowDisabled: 'opacity-60',
  rowTitle: 'text-sm font-medium text-text',
  rowMeta: 'mt-0.5 text-xs text-text-muted',
  rowActions: 'flex shrink-0 flex-wrap items-center gap-2',
  drop: 'rounded-card border-2 border-dashed border-border p-2 transition-colors',
  dropActive: 'border-brand-400 bg-brand-50/60',
  empty: 'px-4 py-8 text-center text-sm text-text-muted',
}
export const menuGrid = {
  strip: 'flex gap-2 overflow-x-auto pb-1',
  chip: 'flex w-36 shrink-0 flex-col gap-0.5 rounded-card border border-border bg-surface px-2.5 py-2 text-xs text-text shadow-sm',
  chipBlocked: 'cursor-not-allowed opacity-50',
  layout: 'flex min-h-0 flex-col gap-5',
  week: 'grid min-w-[42rem] grid-cols-7 gap-1.5',
  scroller: 'overflow-x-auto pb-2',
  day: 'flex min-w-0 flex-col gap-1.5 rounded-card border p-1.5',
  dayHeader: 'flex flex-col gap-0.5 text-xs',
  dayTitle: 'text-sm font-semibold text-text capitalize',
  cell: 'min-h-16 rounded-control border border-dashed border-border p-1.5 transition-colors',
  cellOver: 'border-brand-400 bg-brand-50/60',
  slotLabel: 'text-[11px] font-medium uppercase tracking-wide text-text-muted',
  card: 'mt-1 flex w-full min-w-0 flex-col gap-0.5 rounded-control bg-surface px-2 py-1.5 text-left text-xs text-text shadow-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
}
export const pdfWindow = {
  layout: 'grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]',
  preview: 'h-[70vh] w-full rounded-card border border-border bg-surface-muted',
  previewEmpty:
    'flex h-[70vh] items-center justify-center rounded-card border border-dashed border-border px-6 text-center text-sm text-text-muted',
  panel: 'flex min-w-0 flex-col gap-4',
  box: 'flex flex-col gap-3 rounded-card border border-border bg-surface p-4',
  boxTitle: 'text-xs font-semibold uppercase tracking-wide text-text-muted',
  logo: 'h-12 max-w-[10rem] object-contain',
  sections: 'flex max-h-[40vh] flex-col gap-2 overflow-y-auto',
  overflow: 'text-xs font-medium text-accent-600',
}
