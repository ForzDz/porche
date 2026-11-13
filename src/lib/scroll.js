import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

let lenis = null

/** Lenis piloté par le ticker GSAP : une seule boucle rAF pour tout le site. */
export function startLenis() {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

function raf(time) {
  lenis?.raf(time * 1000)
}

export function stopLenis() {
  if (!lenis) return
  gsap.ticker.remove(raf)
  lenis.destroy()
  lenis = null
}

/** Scroll vers un Y absolu, via Lenis si actif. */
export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.6 })
  else window.scrollTo({ top: y, behavior: 'auto' })
}

/**
 * Cibles de navigation : progression (0-1) dans le hero épinglé.
 * Si le hero scrubé n'existe pas (reduced motion), on suit l'ancre.
 */
export function scrollToHeroProgress(p, fallbackId) {
  const st = ScrollTrigger.getById('hero')
  if (st) {
    scrollToY(st.start + (st.end - st.start) * p)
    return
  }
  document.getElementById(fallbackId)?.scrollIntoView({ block: 'start' })
}

export { gsap, ScrollTrigger }

/** Lien de navigation : position dans le hero (p) ou ancre de section. */
export function scrollToSection({ id, p }) {
  if (p != null) return scrollToHeroProgress(p, id)
  const el = document.getElementById(id)
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY)
}
