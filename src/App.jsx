import { useEffect, useLayoutEffect } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import StaticHero from './components/StaticHero.jsx'
import Marquee from './components/Marquee.jsx'
import Lines from './components/Lines.jsx'
import Range from './components/Range.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Loader from './components/Loader.jsx'
import { useMagnetic } from './lib/magnetic.js'
import { MQ_MOBILE, MQ_REDUCED, useMediaQuery } from './lib/media.js'
import { ScrollTrigger, scrollToSection, startLenis, stopLenis } from './lib/scroll.js'

export default function App() {
  const reduced = useMediaQuery(MQ_REDUCED)
  const isMobile = useMediaQuery(MQ_MOBILE)
  useMagnetic()

  /*
   * Recalcul unique des ScrollTriggers. Les layout effects du parent passent
   * APRÈS ceux des enfants : tous les triggers (hero, lines, range, footer)
   * existent déjà. Relancé quand une bascule mobile / mouvement réduit les
   * recrée ; sort() remet le pin du hero avant les sections suivantes.
   */
  useLayoutEffect(() => {
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
  }, [reduced, isMobile])

  // Les webfonts changent la hauteur des blocs : on recalcule une fois chargées
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  // Lenis uniquement si le mouvement est autorisé
  useEffect(() => {
    if (reduced) return
    startLenis()
    return stopLenis
  }, [reduced])

  // « Découvrir » : vers la première section après le hero (Lines)
  const discover = () => scrollToSection({ id: 'lignes' })

  return (
    <>
      <Loader />
      <Header />
      <main id="top">
        {reduced ? <StaticHero onDiscover={discover} /> : <Hero onDiscover={discover} />}
        <Marquee />
        <Lines />
        <Range />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
