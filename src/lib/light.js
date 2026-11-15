import { useLayoutEffect } from 'react'
import { gsap } from './scroll.js'
import { MQ_REDUCED, useMediaQuery } from './media.js'

/*
 * Révélation par la lumière (voir components/LightText.jsx).
 * Transform + opacity uniquement. Durées en s (GSAP) : exception connue
 * aux tokens CSS, comme le reste des timelines.
 */
const SWEEP = 1.2 // traversée du phare
const DIM = 0.25 // opacité du titre avant le passage du phare

/**
 * Timeline (non pausée) qui balaie tous les .lt contenus dans `el`.
 * Le reflet (.lt-glint) part juste avant le titre et sort juste après :
 * fenêtre et copie --lueur ont des x opposés (la copie reste sur les lettres).
 * Largeurs lues une fois, à la construction.
 */
export function lightReveal(el) {
  const tl = gsap.timeline({
    onStart: () => el.classList.add('is-lighting'),
    onComplete: () => el.classList.remove('is-lighting'),
  })
  el.querySelectorAll('.lt').forEach((lt) => {
    const q = (s) => lt.querySelectorAll(s)
    const glint = lt.querySelector('.lt-glint')
    const glintText = lt.querySelector('.lt-glint-text')
    const w = lt.offsetWidth
    const band = glint.offsetWidth
    glintText.style.width = `${w}px` // même retour à la ligne que le titre
    tl.fromTo(q('.lt-dim'), { opacity: 0 }, { opacity: DIM, duration: 0.35, ease: 'power1.out' }, 0)
      .fromTo(q('.lt-mask'), { xPercent: -100 }, { xPercent: 0, duration: SWEEP, ease: 'power2.inOut' }, 0.15)
      .fromTo(q('.lt-lit'), { xPercent: 100 }, { xPercent: 0, duration: SWEEP, ease: 'power2.inOut' }, 0.15)
      .fromTo(glint, { x: -band, opacity: 0 }, { x: w, duration: SWEEP, ease: 'power2.inOut' }, 0.15)
      .fromTo(glintText, { x: band }, { x: -w, duration: SWEEP, ease: 'power2.inOut' }, 0.15)
      .to(glint, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 0.15)
      .to(glint, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.15 + SWEEP - 0.3)
  })
  return tl
}

/** Pose l'état « éclairé » final (entrées suivantes du hero, sans balayage). */
export function setLit(tl, el, pos = 0) {
  const q = (s) => el.querySelectorAll(s)
  return tl.set(q('.lt-mask, .lt-lit'), { xPercent: 0 }, pos).set(q('.lt-dim'), { opacity: DIM }, pos).set(q('.lt-glint'), { opacity: 0 }, pos)
}

/*
 * Panneau ?tune : rejoue tous les balayages (titres visibles ou non) et
 * prévient les autres lumières (LED de Lignes, showroom) par un événement.
 */
export const REPLAY_EVENT = 'light:replay'
export function replayLight() {
  document.querySelectorAll('.lt').forEach((lt) => {
    gsap.killTweensOf(lt.querySelectorAll('*'))
    lightReveal(lt.parentElement)
  })
  window.dispatchEvent(new Event(REPLAY_EVENT))
}

/*
 * Titre de section (.section-title) révélé une seule fois, au scroll :
 * balayage du texte puis la LED du titre s'allume.
 * `before(tl, root)` : étapes jouées avant le balayage (ex. LED pleine largeur de Lignes).
 * Mouvement réduit : rien, le titre est directement visible (état CSS).
 */
export function useTitleReveal(ref, { before, start = 'top 85%' } = {}) {
  const reduced = useMediaQuery(MQ_REDUCED)
  useLayoutEffect(() => {
    if (reduced) return
    const root = ref.current
    const ctx = gsap.context(() => {
      const title = root.querySelector('.section-title')
      const led = title.querySelector(':scope > .led')
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start, once: true } })
      before?.(tl, root)
      tl.add(lightReveal(title)).fromTo(led, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, '-=0.45')
    }, root)
    // ScrollTrigger.sort() + refresh() : centralisés dans App.jsx
    return () => ctx.revert()
  }, [reduced, ref, before, start]) // `before` : fonction définie hors du composant (stable)
}
