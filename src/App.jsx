import { useEffect } from 'react'
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
import { MQ_REDUCED, useMediaQuery } from './lib/media.js'
import { scrollToY, startLenis, stopLenis } from './lib/scroll.js'

export default function App() {
  const reduced = useMediaQuery(MQ_REDUCED)
  useMagnetic()

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
