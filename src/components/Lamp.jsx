import { useLayoutEffect, useRef } from 'react'
import { gsap, onLenisScroll, ScrollTrigger } from '../lib/scroll.js'
import { MQ_FINE_POINTER, MQ_MOBILE, MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import './Lamp.css'

const LINE = 4 // pas des lignes de la texture (px) : doit suivre .lamp-lines (Lamp.css)
const FOLLOW = 0.6 // lissage du suivi (s)
const HERO_FOLLOW = 0.9 // au-dessus du hero : plus lent, plus doux

/*
 * Le curseur est une lampe : un halo --lueur (cœur net, bord doux) et, dessous,
 * une texture de fines lignes (« carrosserie ») qui n'existe que sous la lampe
 * (masque radial statique). Le tout est fusionné en `lighten` (max par canal) :
 * seul ce qui est plus sombre que la lumière s'éclaire ; le texte reste intact.
 * Déplacement en transform (quickTo, lissé). Les lignes restent calées sur la
 * page (décalage modulo LINE recalculé à chaque image) : on éclaire une surface,
 * la texture ne glisse pas avec le pointeur.
 * Au-dessus du hero (pin + sortie) : projecteur plus doux (--lamp-hero-opacity),
 * sans texture, qui suit plus lentement (HERO_FOLLOW) ; classe .is-hero.
 * Éteinte (opacity 0) hors fenêtre.
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
    const xTo = gsap.quickTo(el, 'x', { duration: FOLLOW, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: FOLLOW, ease: 'power3.out' })
    // même tween, ralenti au-dessus du hero (timeScale) : pas de second tween concurrent sur x / y
    const follow = (hero) => [xTo, yTo].forEach((q) => q.tween?.timeScale(hero ? FOLLOW / HERO_FOLLOW : 1))
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
    // recalage de la texture : seulement quand elle est visible (hors hero)
    let aligning = false
    const setAlign = (want) => {
      if (want === aligning) return
      aligning = want
      if (want) gsap.ticker.add(align)
      else gsap.delayedCall(FOLLOW, () => !aligning && gsap.ticker.remove(align))
    }
    const show = () => {
      const want = pointer
      if (want !== lit) {
        lit = want
        el.style.willChange = lit ? 'transform, opacity' : ''
      }
      el.classList.toggle('is-hero', inHero)
      follow(inHero)
      setAlign(lit && !inHero)
      gsap.to(el, { opacity: want ? 1 : 0, duration: FOLLOW, ease: 'power1.out', overwrite: 'auto' })
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

    // pendant le pin du hero et sa sortie : mode projecteur (.is-hero)
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
    el.classList.toggle('is-hero', inHero)
    follow(inHero)

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
