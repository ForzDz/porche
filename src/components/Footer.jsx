import { useLayoutEffect, useRef } from 'react'
import { gsap, scrollToSection, willChangeWhileActive } from '../lib/scroll.js'
import { MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import { FOOTER_LINKS, LEGAL } from '../content.js'
import './Footer.css'

/*
 * « 911 » géant en contour. Une copie pleine, dans un masque, se révèle
 * de gauche à droite pendant que le footer entre à l'écran (scrub).
 * Même technique que Lines (pas de clip-path) :
 *   .ft-mask  xPercent -100 → 0  (la fenêtre glisse vers la droite)
 *   .ft-fill  xPercent  100 → 0  (le texte compense : il reste immobile)
 * Mouvement réduit : pas de GSAP, l'état CSS par défaut est « rempli ».
 */
export default function Footer() {
  const reduced = useMediaQuery(MQ_REDUCED)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 0.4,
            invalidateOnRefresh: true,
            onToggle: willChangeWhileActive('.ft-mask, .ft-fill'),
          },
        })
        .fromTo('.ft-mask', { xPercent: -100 }, { xPercent: 0 }, 0)
        .fromTo('.ft-fill', { xPercent: 100 }, { xPercent: 0 }, 0)
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  const go = (link) => (e) => {
    e.preventDefault()
    scrollToSection(link)
  }

  return (
    <footer className="site-footer" id="concept" ref={rootRef}>
      <div className="ft-num" aria-hidden="true">
        <span className="ft-outline">911</span>
        <span className="ft-mask">
          <span className="ft-fill">911</span>
        </span>
      </div>

      <div className="ft-bar">
        <nav aria-label="Pied de page">
          <ul className="ft-links">
            {FOOTER_LINKS.map((l) => (
              <li key={l.id}>
                <a className="label nav-link" href={`#${l.id}`} onClick={go(l)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="ft-legal">{LEGAL}</p>
      </div>
    </footer>
  )
}
