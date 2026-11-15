import { useLayoutEffect, useRef } from 'react'
import { gsap, onLenisScroll, ScrollTrigger } from '../lib/scroll.js'
import { MQ_FINE_POINTER, MQ_MOBILE, MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import './Lamp.css'

const LINE = 4 // pas des lignes de la texture (px) : doit suivre .lamp-lines (Lamp.css)

/*
 * Le curseur est une lampe : un halo --lueur (cœur net, bord doux) et, dessous,
 * une texture de fines lignes (« carrosserie ») qui n'existe que sous la lampe
 * (masque radial statique). Le tout est fusionné en `lighten` (max par canal) :
 * seul ce qui est plus sombre que la lumière s'éclaire ; le texte reste intact.
 * Déplacement en transform (quickTo, lissé). Les lignes restent calées sur la
 * page (décalage modulo LINE recalculé à chaque image) : on éclaire une surface,
 * la texture ne glisse pas avec le pointeur.
 * Éteinte (opacity 0) pendant le pin et la sortie du hero, et hors fenêtre.
 * Desktop à pointeur fin seulement ; ni mobile, ni mouvement réduit.
 * Réglages : --lamp-opacity, --lamp-radius, --texture-opacity (:root, panneau ?tune).
 */
export default function Lamp() {
  const fine = useMediaQuery(MQ_FINE_POINTER)
  const mobile = useMediaQuery(MQ_MOBILE)
  const reduced = useMediaQuery(MQ_REDUCED)
  const on = fine && !mobile && !reduced
  const ref = useRef(null)
  const linesRef = useRef(null)

  useLayoutEffect(() => {
    if (!on) return
    const el = ref.current
    const lines = linesRef.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const setLinesY = gsap.quickSetter(lines, 'y', 'px')
    let inHero = true
    let pointer = false
    let lit = false
    let scroll = window.scrollY
    let radius = el.offsetWidth / 2
    const ro = new ResizeObserver(() => (radius = el.offsetWidth / 2)) // rayon réglable (?tune)
    ro.observe(el)
    const offScroll = onLenisScroll(({ scroll: y }) => (scroll = y))
    const onNativeScroll = () => (scroll = window.scrollY) // sans Lenis (sécurité)
    window.addEventListener('scroll', onNativeScroll, { passive: true })

    // texture calée sur la page : haut de la lampe (coordonnées page) modulo le pas
    const align = () => {
      const top = gsap.getProperty(el, 'y') - radius + scroll
      setLinesY(-(((top % LINE) + LINE) % LINE))
    }
    const show = () => {
      const want = pointer && !inHero
      if (want !== lit) {
        lit = want
        el.style.willChange = lit ? 'transform, opacity' : ''
        if (lit) gsap.ticker.add(align)
        else gsap.delayedCall(0.6, () => !lit && gsap.ticker.remove(align))
      }
      gsap.to(el, { opacity: want ? 1 : 0, duration: 0.6, ease: 'power1.out', overwrite: 'auto' })
    }

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

    // pendant le pin du hero et sa sortie : éteinte (jamais sur la vidéo)
    const st = ScrollTrigger.create({
      trigger: '.hero',
      start: 'top bottom',
      end: 'bottom 40%', // = fin de la sortie du hero (voile noir complet)
      onToggle: (self) => {
        inHero = self.isActive
        show()
      },
    })
    inHero = st.isActive

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', onNativeScroll)
      document.removeEventListener('pointerout', leave)
      offScroll()
      ro.disconnect()
      st.kill()
      gsap.ticker.remove(align)
      gsap.killTweensOf(el)
    }
  }, [on])

  return on ? (
    <div className="lamp" ref={ref} aria-hidden="true">
      <div className="lamp-texture">
        <div className="lamp-lines" ref={linesRef} />
      </div>
      <div className="lamp-halo" />
    </div>
  ) : null
}
