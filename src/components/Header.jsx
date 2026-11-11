import { NAV } from '../content.js'
import { scrollToHeroProgress, scrollToY } from '../lib/scroll.js'
import './Header.css'

export default function Header() {
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
    <header className="site-header">
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
        <a className="btn-outline" href="#concept" onClick={toFooter}>
          Le projet
        </a>
      </nav>
    </header>
  )
}
