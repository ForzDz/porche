import { useEffect, useId, useRef, useState } from 'react'
import { HEADER_CTA, MENU, MENU_TOGGLE, NAV } from '../content.js'
import { MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import { onLenisScroll, scrollToHeroProgress, scrollToSection, scrollToY } from '../lib/scroll.js'
import './Header.css'

const DELTA = 6 // px de scroll ignorés (évite le clignotement)

export default function Header() {
  const reduced = useMediaQuery(MQ_REDUCED)
  const ref = useRef(null)
  const toggleRef = useRef(null)
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const openRef = useRef(false) // lu dans l'abonnement au scroll

  /* Menu mobile ouvert : Échap le ferme et rend le focus au bouton */
  useEffect(() => {
    openRef.current = open
    if (!open) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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
      const hide = d > 0 && y > h && !openRef.current // menu ouvert : header visible
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

  const goMenu = (item) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToSection(item)
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
              <a className="label nav-link" href={`#${item.id}`} onClick={go(item)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a className="btn-outline" href={`#${HEADER_CTA.id}`} onClick={toCta}>
          {HEADER_CTA.label}
        </a>
        <button
          type="button"
          className="label menu-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
          ref={toggleRef}
        >
          {MENU_TOGGLE}
        </button>
      </nav>

      {/* Menu mobile : toutes les sections. Affiché / masqué, sans animation */}
      <nav className="mobile-menu" id={menuId} aria-label="Menu" hidden={!open}>
        <ul>
          {MENU.map((item) => (
            <li key={item.id}>
              <a className="label nav-link" href={`#${item.id}`} onClick={goMenu(item)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
