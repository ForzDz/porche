import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll.js'
import { MQ_FINE_POINTER, MQ_MOBILE, MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import './Lamp.css'

/*
 * Le curseur est une lampe : halo fixe (radial-gradient) qui suit le pointeur,
 * déplacé en transform (quickTo, lissé). mix-blend-mode: lighten → le noir
 * devient carbone sous le halo, tout ce qui est plus clair (texte, images
 * claires) reste tel quel : le halo ne passe jamais « devant » le texte.
 * Éteint (opacity 0) pendant tout le hero, et quand le pointeur quitte la page.
 * Desktop à pointeur fin seulement ; ni mobile, ni mouvement réduit.
 */
export default function Lamp() {
  const fine = useMediaQuery(MQ_FINE_POINTER)
  const mobile = useMediaQuery(MQ_MOBILE)
  const reduced = useMediaQuery(MQ_REDUCED)
  const on = fine && !mobile && !reduced
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!on) return
    const el = ref.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    let inHero = true
    let pointer = false
    const show = () => gsap.to(el, { opacity: pointer && !inHero ? 1 : 0, duration: 0.6, ease: 'power1.out', overwrite: 'auto' })

    const move = (e) => {
      if (!pointer) {
        // première apparition : le halo naît sous le pointeur, il ne glisse pas depuis le coin
        gsap.set(el, { x: e.clientX, y: e.clientY })
        pointer = true
        show()
      }
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const leave = (e) => {
      if (e.relatedTarget) return // seulement quand le pointeur sort de la fenêtre
      pointer = false
      show()
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerout', leave)

    // pendant le pin du hero et sa sortie : éteint (jamais sur la vidéo)
    const st = ScrollTrigger.create({
      trigger: '.hero',
      start: 'top bottom',
      end: 'bottom 40%', // = fin de la sortie du hero (voile noir complet)
      onToggle: (self) => {
        inHero = self.isActive
        el.style.willChange = inHero ? '' : 'transform, opacity'
        show()
      },
    })
    inHero = st.isActive

    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerout', leave)
      st.kill()
      gsap.killTweensOf(el)
    }
  }, [on])

  return on ? <div className="lamp" ref={ref} aria-hidden="true" /> : null
}
