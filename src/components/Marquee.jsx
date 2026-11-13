import { useLayoutEffect, useRef } from 'react'
import { gsap, getScrollVelocity } from '../lib/scroll.js'
import { MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import { MARQUEE } from '../content.js'
import './Marquee.css'

/*
 * Bandeau infini droite → gauche. Deux groupes identiques côte à côte :
 * quand le premier est sorti, x reboucle de -largeur à 0 (raccord invisible).
 * Vitesse = base + vitesse de scroll lissée (bornée) — seul `x` est animé.
 */
const BASE = 60 // px/s
const BOOST = 0.12 // part de la vitesse de scroll ajoutée
const MAX_BOOST = 240 // px/s
const REPEAT = 3 // répétitions de la phrase par groupe (couvre 1440 px et plus)

export default function Marquee() {
  const reduced = useMediaQuery(MQ_REDUCED)
  const bandRef = useRef(null)
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    if (reduced) return
    const band = bandRef.current
    const track = trackRef.current
    const group = track.firstElementChild
    const setX = gsap.quickSetter(track, 'x', 'px')

    let width = group.offsetWidth
    let x = 0
    let boost = 0
    let running = false

    const ro = new ResizeObserver(() => (width = group.offsetWidth))
    ro.observe(group)

    // Vitesse fournie par Lenis : aucune lecture de window.scrollY (layout forcé)
    const tick = (_t, deltaMs) => {
      if (!width) return
      const dt = Math.min(deltaMs, 50) / 1000 // pas de saut après un onglet en veille
      // lissage : monte vite, retombe doucement
      const target = Math.min(getScrollVelocity() * BOOST, MAX_BOOST)
      boost += (target - boost) * (target > boost ? 0.2 : 0.05)
      x = gsap.utils.wrap(-width, 0, x - (BASE + boost) * dt)
      setX(x)
    }

    // Hors écran : ticker retiré et calque compositeur libéré
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting === running) return
      running = e.isIntersecting
      track.style.willChange = running ? 'transform' : ''
      if (running) gsap.ticker.add(tick)
      else gsap.ticker.remove(tick)
    })
    io.observe(band)

    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
      ro.disconnect()
      track.style.willChange = ''
      gsap.set(track, { clearProps: 'transform' })
    }
  }, [reduced])

  const group = (hidden) => (
    <span className="marquee-group" aria-hidden={hidden || undefined}>
      {Array.from({ length: REPEAT }, (_, i) => (
        <span className="marquee-item" key={i}>
          {MARQUEE}
        </span>
      ))}
    </span>
  )

  return (
    <section className="marquee" ref={bandRef} aria-label={MARQUEE.replace(/·/g, ',').replace(/,\s*$/, '')}>
      <div className="marquee-track" ref={trackRef} aria-hidden="true">
        {group(false)}
        {group(true)}
      </div>
    </section>
  )
}
