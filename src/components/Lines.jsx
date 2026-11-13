import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll.js'
import { MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import { LINES } from '../content.js'
import './Lines.css'

/*
 * Révélation bas → haut sans clip-path (CLAUDE.md : transform + opacity) :
 *   .still-mask  yPercent 100 → 0   (la fenêtre monte)
 *   .still-img   yPercent -100 → 0  (l'image compense : elle reste immobile à l'écran)
 * → visuellement identique à clip-path: inset(100% 0 0 0) → inset(0),
 *   plus un léger scale 1.1 → 1 sur l'image.
 * Scrubé et réversible. Aucun pin : sur desktop le texte est en position: sticky (CSS).
 */
export default function Lines() {
  const reduced = useMediaQuery(MQ_REDUCED)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.still').forEach((fig) => {
        const mask = fig.querySelector('.still-mask')
        const img = fig.querySelector('.still-img')
        const led = fig.querySelector('.led')
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: fig,
              start: 'top 92%',
              end: 'top 42%',
              scrub: true,
            },
          })
          .fromTo(mask, { yPercent: 100 }, { yPercent: 0, ease: 'power2.out', duration: 1 }, 0)
          .fromTo(img, { yPercent: -100, scale: 1.1 }, { yPercent: 0, scale: 1, ease: 'power2.out', duration: 1 }, 0)
          .fromTo(led, { scaleX: 0 }, { scaleX: 1, ease: 'power2.inOut', duration: 0.4 }, 0.6)
      })
    }, rootRef)

    // le hero (pin) peut être recréé après nous (bascule mobile/desktop) :
    // on remet les triggers dans l'ordre de la page avant de recalculer
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [reduced])

  const [aero, ...details] = LINES.stills
  const figure = (s, cls) => (
    <figure className={`still ${cls}`} key={s.src}>
      <div className="still-frame" style={{ aspectRatio: `${s.w} / ${s.h}` }}>
        <div className="still-mask">
          <img className="still-img" src={s.src} width={s.w} height={s.h} alt={s.alt} loading="lazy" decoding="async" />
        </div>
      </div>
      <figcaption className="still-caption">
        {s.caption}
        <span className="led" />
      </figcaption>
    </figure>
  )

  return (
    <section className="lines" id="lignes" ref={rootRef} aria-labelledby="lines-title">
      <div className="lines-text">
        <h2 className="lines-title" id="lines-title">
          {LINES.title}
          <span className="led" />
        </h2>
        {LINES.body.map((p) => (
          <p className="lines-p" key={p.slice(0, 16)}>
            {p}
          </p>
        ))}
      </div>

      <div className="lines-media">
        {figure(aero, 'still--wide')}
        <div className="lines-pair">{details.map((s, i) => figure(s, i ? 'still--low' : ''))}</div>
      </div>
    </section>
  )
}
