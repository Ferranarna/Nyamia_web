/** Adds `data-inview` once to [data-reveal] / [data-inview-scope] elements entering the viewport (CSS does the rest). */
const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-inview-scope]')

if (!('IntersectionObserver' in window)) {
  targets.forEach((el) => el.setAttribute('data-inview', ''))
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.setAttribute('data-inview', '')
          io.unobserve(e.target)
        }
      }
    },
    { threshold: 0.2, rootMargin: '0px 0px -5% 0px' },
  )
  targets.forEach((el) => io.observe(el))
}
