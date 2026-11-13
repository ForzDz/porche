import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/scroll.js'
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
    let lastY = window.scrollY
    let visible = false

    const ro = new ResizeObserver(() => (width = group.offsetWidth))
    ro.observe(group)

    const tick = (_t, deltaMs) => {
      const dt = Math.min(deltaMs, 50) / 1000 // pas de saut après un onglet en veille
      const y = window.scrollY
      const v = dt ? Math.abs(y - lastY) / dt : 0
      lastY = y
      // lissage : monte vite, retombe doucement
      const target = Math.min(v * BOOST, MAX_BOOST)
      boost += (target - boost) * (target > boost ? 0.2 : 0.05)
      if (!visible || !width) return
      x = gsap.utils.wrap(-width, 0, x - (BASE + boost) * dt)
      setX(x)
    }

    // ne tourne que lorsque le bandeau est à l'écran
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      lastY = window.scrollY
    })
    io.observe(band)
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
      ro.disconnect()
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
