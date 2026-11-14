import { useEffect } from 'react'
import { gsap } from './scroll.js'
import { MQ_FINE_POINTER, MQ_REDUCED, useMediaQuery } from './media.js'

const STRENGTH = 0.32 // part du décalage curseur ↔ centre
const MAX = 14 // px

/*
 * Effet magnétique sur [data-magnetic] : le bouton suit légèrement le curseur
 * (transform x/y via quickTo). Desktop à pointeur fin uniquement, jamais en
 * mouvement réduit. Le bouton ne doit porter aucune autre animation de x/y.
 */
export function useMagnetic() {
  const fine = useMediaQuery(MQ_FINE_POINTER)
  const reduced = useMediaQuery(MQ_REDUCED)

  useEffect(() => {
    if (!fine || reduced) return
    const clamp = gsap.utils.clamp(-MAX, MAX)
    const offs = [...document.querySelectorAll('[data-magnetic]')].map((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' })
      let cx = 0
      let cy = 0
      const enter = () => {
        // centre au repos : on retire la translation en cours
        const r = el.getBoundingClientRect()
        cx = r.left + r.width / 2 - gsap.getProperty(el, 'x')
        cy = r.top + r.height / 2 - gsap.getProperty(el, 'y')
      }
      const move = (e) => {
        xTo(clamp((e.clientX - cx) * STRENGTH))
        yTo(clamp((e.clientY - cy) * STRENGTH))
      }
      const leave = () => {
        xTo(0)
        yTo(0)
      }
      const listen = (on) => {
        const fn = on ? 'addEventListener' : 'removeEventListener'
        el[fn]('pointerenter', enter)
        el[fn]('pointermove', move)
        el[fn]('pointerleave', leave)
      }
      // hors écran : écouteurs retirés, bouton remis au repos
      let active = false
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting === active) return
        active = e.isIntersecting
        listen(active)
        if (!active) leave()
      })
      io.observe(el)
      return () => {
        io.disconnect()
        if (active) listen(false)
        gsap.killTweensOf(el, 'x,y')
        gsap.set(el, { clearProps: 'transform' })
      }
    })
    return () => offs.forEach((off) => off())
  }, [fine, reduced])
}
