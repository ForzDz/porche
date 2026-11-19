import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll.js'
import { MQ_FINE_POINTER, MQ_MOBILE, MQ_REDUCED, useMediaQuery } from '../lib/media.js'
import './ScrollProgress.css'

/*
 * Fine LED rouge en haut de l'écran qui se remplit avec le scroll de la page.
 * scaleX seulement (quickSetter, aucune transition : elle suit Lenis image par image).
 * Desktop à pointeur fin seulement ; ni mobile / tactile, ni mouvement réduit.
 */
export default function ScrollProgress() {
  const fine = useMediaQuery(MQ_FINE_POINTER)
  const mobile = useMediaQuery(MQ_MOBILE)
  const reduced = useMediaQuery(MQ_REDUCED)
  const on = fine && !mobile && !reduced
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!on) return
    const set = gsap.quickSetter(ref.current, 'scaleX')
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => set(self.progress),
      onRefresh: (self) => set(self.progress),
    })
    set(st.progress)
    return () => st.kill()
  }, [on])

  return on ? <div className="scroll-progress" ref={ref} aria-hidden="true" /> : null
}
