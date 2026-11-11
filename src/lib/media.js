import { useSyncExternalStore } from 'react'

export const MQ_MOBILE = '(max-width: 767.98px)'
export const MQ_REDUCED = '(prefers-reduced-motion: reduce)'

/** Abonnement React à une media query (sans re-render inutile). */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
