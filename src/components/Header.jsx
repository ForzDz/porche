import { useEffect, useRef } from 'react'
import { HEADER_CTA, NAV } from '../content.js'
import { useMagnetic } from '../lib/magnetic.js'
import { MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import { onLenisScroll, scrollToHeroProgress, scrollToSection, scrollToY } from '../lib/scroll.js'
import './Header.css'

const DELTA = 6 // px de scroll ignorés (évite le clignotement)

export default function Header() {
  const magnetic = useMagnetic()
  const reduced = useMediaQuery(MQ_REDUCED)
  const ref = useRef(null)

  /*
   * Se cache en descendant, réapparaît en remontant (transform seulement).
   * Mouvement réduit : header fixe, toujours visible.
   */
  useEffect(() => {
    if (reduced) return
    const el = ref.current
    const h = el.offsetHeight // lu une fois, jamais pendant le scroll
    let lastY = 0
    let hidden = false

    // valeurs déjà calculées par Lenis : aucune lecture de layout par frame
    const off = onLenisScroll(({ scroll: y }) => {
      const d = y - lastY
      if (Math.abs(d) < DELTA) return
      lastY = y
      const hide = d > 0 && y > h
      if (hide === hidden) return
      hidden = hide
      el.classList.toggle('is-hidden', hide)
    })
    return () => {
      off()
      el.classList.remove('is-hidden')
    }
  }, [reduced])

  const go = (item) => (e) => {
    e.preventDefault()
    scrollToHeroProgress(item.p, item.id)
  }

  const toCta = (e) => {
    e.preventDefault()
    scrollToSection(HEADER_CTA)
  }

  return (
    <header className="site-header" ref={ref}>
      <a className="brand" href="#top" onClick={(e) => (e.preventDefault(), scrollToY(0))}>
        911 GT3 <span aria-hidden="true">—</span> <em>Concept</em>
      </a>
      <nav className="site-nav" aria-label="Principale">
        <ul>
          {NAV.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={go(item)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a className="btn-outline" href={`#${HEADER_CTA.id}`} onClick={toCta} ref={magnetic}>
          {HEADER_CTA.label}
        </a>
      </nav>
    </header>
  )
}
