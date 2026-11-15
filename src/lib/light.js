import { useLayoutEffect } from 'react'
import { gsap } from './scroll.js'
import { MQ_REDUCED, useMediaQuery } from './media.js'

/*
 * Révélation par la lumière (voir components/LightText.jsx).
 * Transform + opacity uniquement. Durées en s (GSAP) : exception connue
 * aux tokens CSS, comme le reste des timelines.
 */
const SWEEP = 1.1 // traversée du phare

/** Timeline (non pausée) qui balaie tous les .lt contenus dans `el`. */
export function lightReveal(el) {
  const q = (s) => el.querySelectorAll(s)
  const tl = gsap.timeline({
    onStart: () => el.classList.add('is-lighting'),
    onComplete: () => el.classList.remove('is-lighting'),
  })
  tl.fromTo(q('.lt-dim'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0)
    .fromTo(q('.lt-mask'), { xPercent: -100 }, { xPercent: 0, duration: SWEEP, ease: 'power2.inOut' }, 0.1)
    .fromTo(q('.lt-lit'), { xPercent: 100 }, { xPercent: 0, duration: SWEEP, ease: 'power2.inOut' }, 0.1)
    .fromTo(q('.lt-beam'), { opacity: 1 }, { opacity: 0, duration: 0.45, ease: 'power1.out' }, SWEEP - 0.1)
  return tl
}

/** Pose l'état « éclairé » final (entrées suivantes du hero, sans balayage). */
export function setLit(tl, el, pos = 0) {
  const q = (s) => el.querySelectorAll(s)
  return tl.set(q('.lt-mask, .lt-lit'), { xPercent: 0 }, pos).set(q('.lt-dim'), { opacity: 1 }, pos).set(q('.lt-beam'), { opacity: 0 }, pos)
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
