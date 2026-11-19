import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

let lenis = null
const subs = new Set()

/**
 * Lenis piloté par le ticker GSAP : une seule boucle rAF pour tout le site.
 * lerp 0.1 : un peu plus doux que 0.12 sur une molette crantée, l'inertie retombe en ~0,4 s.
 */
export function startLenis() {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1 })
  lenis.on('scroll', (l) => {
    ScrollTrigger.update()
    subs.forEach((fn) => fn(l))
  })
  if (locked) lenis.stop()
  // prioritize = true : Lenis scrolle AVANT que GSAP rende ses tweens.
  // Sinon window.scrollTo arrive après les écritures de style de la frame
  // et force un recalcul synchrone (mesuré : ~800 ms sur un scroll complet, CPU ×4).
  gsap.ticker.add(raf, false, true)
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

/** Verrou pendant l'écran de chargement (appliqué aussi si Lenis démarre après). */
let locked = false
export function setScrollLock(on) {
  locked = on
  document.documentElement.classList.toggle('is-locked', on)
  if (on) lenis?.stop()
  else lenis?.start()
}

/**
 * Abonnement au scroll Lenis : reçoit { scroll, direction, velocity } déjà
 * calculés → aucune lecture de window.scrollY (pas de layout forcé).
 * Fonctionne même si l'abonnement précède startLenis().
 */
export function onLenisScroll(fn) {
  subs.add(fn)
  return () => subs.delete(fn)
}

/** Vitesse de scroll en px/s (0 sans Lenis). */
export const getScrollVelocity = () => Math.abs(lenis?.velocity ?? 0) * 60

/**
 * will-change posé seulement pendant qu'un trigger scrubé est actif,
 * retiré dès qu'il sort de sa plage. À passer en `onToggle`.
 */
export const willChangeWhileActive = (targets, value = 'transform') => {
  const els = gsap.utils.toArray(targets)
  return (self) => els.forEach((el) => (el.style.willChange = self.isActive ? value : ''))
}

/** Délai sans événement de scroll après lequel on considère le scroll arrêté (ms). */
export const SCROLL_IDLE = 200

/**
 * Début / fin d'un geste de scroll : onStart au premier événement, onIdle
 * SCROLL_IDLE ms après le dernier. Sert à geler pendant le scroll ce qui
 * coûte en composition (parallaxe, texture de la lampe). Renvoie le désabonnement.
 */
export function onScrollActivity(onStart, onIdle, idle = SCROLL_IDLE) {
  let active = false
  let timer = 0
  const ping = () => {
    if (!active) {
      active = true
      onStart()
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
      active = false
      onIdle()
    }, idle)
  }
  const offLenis = onLenisScroll(ping)
  window.addEventListener('scroll', ping, { passive: true }) // sans Lenis (sécurité)
  return () => {
    offLenis()
    window.removeEventListener('scroll', ping)
    clearTimeout(timer)
  }
}
