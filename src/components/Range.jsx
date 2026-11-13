import { Fragment, useLayoutEffect, useRef } from 'react'
import { gsap, scrollToSection, willChangeWhileActive } from '../lib/scroll.js'
import { MQ_MOBILE, MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import { RANGE } from '../content.js'
import './Range.css'

/*
 * Cartes empilées (desktop) : chaque carte est en position: sticky (CSS,
 * aucun pin GSAP) → la suivante glisse naturellement par-dessus.
 * Pendant ce glissement, la carte précédente : scale 1 → 0.92 + voile
 * noir 0 → 0.45 (transform + opacity uniquement), scrubé et réversible.
 * Mobile / mouvement réduit : cartes empilées normalement, pas de GSAP.
 */
const SCALE_TO = 0.92
const DARK_TO = 0.45

export default function Range() {
  const isMobile = useMediaQuery(MQ_MOBILE)
  const reduced = useMediaQuery(MQ_REDUCED)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (isMobile || reduced) return
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.card')
      const marks = gsap.utils.toArray('.card-mark')
      cards.slice(0, -1).forEach((card, i) => {
        const next = cards[i + 1]
        // la carte suivante part du bas de l'écran et s'arrête à son « top » sticky.
        // Trigger = bas du repère non-sticky placé juste avant elle : sa position
        // ne change jamais, même si le refresh survient quand la carte est collée.
        const stickyTop = () => parseFloat(getComputedStyle(next).top) || 0
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: marks[i],
              start: 'bottom bottom',
              end: () => `bottom ${stickyTop()}px`,
              scrub: true,
              invalidateOnRefresh: true,
              onToggle: willChangeWhileActive([card.querySelector('.card-inner'), card.querySelector('.card-shade')], 'transform, opacity'),
            },
          })
          .to(card.querySelector('.card-inner'), { scale: SCALE_TO }, 0)
          .to(card.querySelector('.card-shade'), { opacity: DARK_TO }, 0)
      })
    }, rootRef)
    return () => ctx.revert()
  }, [isMobile, reduced])

  const toContact = () => scrollToSection({ id: 'contact' })

  return (
    <section className="range" id="gamme" ref={rootRef} aria-labelledby="range-title">
      <header className="range-head">
        <h2 className="range-title" id="range-title">
          {RANGE.title}
          <span className="led" />
        </h2>
        <p className="range-intro">{RANGE.intro}</p>
      </header>

      <ol className="range-cards">
        {RANGE.cards.map((c, i) => {
          const id = `card-${c.name.toLowerCase().replace(/\s+/g, '-')}` // pas d'espace : IDREF valide
          return (
            <Fragment key={c.name}>
              {i > 0 && <li className="card-mark" aria-hidden="true" />}
              <li className="card">
                <article className="card-inner" aria-labelledby={id}>
                  <div className="card-media">
                    <img src={c.still} width="1600" height="900" alt={c.alt} loading="lazy" decoding="async" />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title" id={id}>
                      {c.name}
                    </h3>
                    <ul className="card-specs">
                      {c.specs.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                    <span className="led card-led" />
                    <p className="card-price">
                      <span className="card-price-label">Prix</span> {RANGE.price}
                    </p>
                    <button type="button" className="btn-outline" onClick={toContact} data-magnetic>
                      {RANGE.cta}
                    </button>
                  </div>
                  <span className="card-shade" aria-hidden="true" />
                </article>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </section>
  )
}
