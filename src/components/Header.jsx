import { useEffect, useRef } from 'react'
import { NAV } from '../content.js'
import { MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import { scrollToHeroProgress, scrollToY } from '../lib/scroll.js'
import './Header.css'

const DELTA = 6 // px de scroll ignorés (évite le clignotement)

export default function Header() {
  const reduced = useMediaQuery(MQ_REDUCED)
  const ref = useRef(null)

  /*
   * Se cache en descendant, réapparaît en remontant (transform seulement).
   * Mouvement réduit : header fixe, toujours visible.
   */
  useEffect(() => {
    if (reduced) return
    const el = ref.current
    let lastY = window.scrollY
    let hidden = false
    let queued = false

    const update = () => {
      queued = false
      const y = window.scrollY
      const d = y - lastY
      if (Math.abs(d) < DELTA) return
      lastY = y
      const hide = d > 0 && y > el.offsetHeight
      if (hide === hidden) return
      hidden = hide
      el.classList.toggle('is-hidden', hide)
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      el.classList.remove('is-hidden')
    }
  }, [reduced])

  const go = (item) => (e) => {
    e.preventDefault()
    scrollToHeroProgress(item.p, item.id)
  }

  const toFooter = (e) => {
    e.preventDefault()
    const el = document.getElementById('concept')
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY)
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
        <a className="btn-outline" href="#concept" onClick={toFooter} data-magnetic>
          Le projet
        </a>
      </nav>
    </header>
  )
}
