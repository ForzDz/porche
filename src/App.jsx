import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import StaticHero from './components/StaticHero.jsx'
import { MQ_REDUCED, useMediaQuery } from './lib/media.js'
import { scrollToY, startLenis, stopLenis } from './lib/scroll.js'
import './App.css'

export default function App() {
  const reduced = useMediaQuery(MQ_REDUCED)

  // Lenis uniquement si le mouvement est autorisé
  useEffect(() => {
    if (reduced) return
    startLenis()
    return stopLenis
  }, [reduced])

  const discover = () => {
    const el = document.getElementById('concept')
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY)
  }

  return (
    <>
      <Header />
      <main id="top">{reduced ? <StaticHero onDiscover={discover} /> : <Hero onDiscover={discover} />}</main>
      <footer className="site-footer" id="concept">
        <p className="footer-title">
          911 GT3 <em>Concept</em>
        </p>
        <p className="footer-legal">Projet concept non officiel, sans lien avec Porsche AG.</p>
      </footer>
    </>
  )
}
