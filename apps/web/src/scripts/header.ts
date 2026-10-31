/** Header: condense on scroll, mobile sheet (disclosure), active anchor tracking. ~1 KB. */
const header = document.querySelector<HTMLElement>('[data-site-header]')

if (header) {
  let ticking = false
  const update = () => {
    header.toggleAttribute('data-condensed', window.scrollY > 24)
    ticking = false
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    },
    { passive: true },
  )
  update()

  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]')
  const sheet = header.querySelector<HTMLElement>('[data-mobile-sheet]')
  if (toggle && sheet) {
    const setOpen = (open: boolean, restoreFocus = false) => {
      sheet.hidden = !open
      toggle.setAttribute('aria-expanded', String(open))
      toggle.setAttribute('aria-label', (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '')
      toggle.querySelector<HTMLElement>('[data-icon-open]')!.hidden = open
      toggle.querySelector<HTMLElement>('[data-icon-close]')!.hidden = !open
      if (!open && restoreFocus) toggle.focus()
    }
    toggle.addEventListener('click', () => setOpen(Boolean(sheet.hidden)))
    sheet.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a')) setOpen(false)
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sheet.hidden) setOpen(false, true)
    })
    document.addEventListener('click', (e) => {
      if (!sheet.hidden && !header.contains(e.target as Node)) setOpen(false)
    })
  }

  const links = Array.from(header.querySelectorAll<HTMLAnchorElement>('[data-nav-target]'))
  const sections = links
    .map((l) => document.getElementById(l.dataset.navTarget ?? ''))
    .filter((s): s is HTMLElement => Boolean(s))
  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          for (const l of links) {
            if (l.dataset.navTarget === e.target.id) l.setAttribute('aria-current', 'location')
            else l.removeAttribute('aria-current')
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    // Clear when above the first tracked section (hero/problem).
    const first = sections[0]!
    window.addEventListener(
      'scroll',
      () => {
        if (first.getBoundingClientRect().top > window.innerHeight * 0.45) {
          links.forEach((l) => l.removeAttribute('aria-current'))
        }
      },
      { passive: true },
    )
  }
}
