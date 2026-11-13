import { useEffect, useState } from 'react'
import { onHeroReady } from '../lib/ready.js'
import { setScrollLock } from '../lib/scroll.js'
import './Loader.css'

const MIN_MS = 450 // évite le flash si tout est en cache
const MAX_MS = 6000 // garde-fou : réseau lent ou vidéo en erreur

/* Écran de chargement : jusqu'à ce que le hero soit prêt (métadonnées de hero.mp4). */
export default function Loader() {
  const [state, setState] = useState('loading') // loading → leaving → done

  useEffect(() => {
    setScrollLock(true)
    const t0 = performance.now()
    let timer = 0
    let safety = 0
    let finished = false
    // peut être appelé de façon synchrone par onHeroReady (hero déjà prêt)
    const finish = () => {
      if (finished) return
      finished = true
      clearTimeout(safety)
      timer = setTimeout(() => setState('leaving'), Math.max(0, MIN_MS - (performance.now() - t0)))
    }
    safety = setTimeout(finish, MAX_MS)
    const off = onHeroReady(finish)
    return () => {
      off()
      clearTimeout(safety)
      clearTimeout(timer)
      setScrollLock(false)
    }
  }, [])

  useEffect(() => {
    if (state === 'leaving') setScrollLock(false)
  }, [state])

  if (state === 'done') return null
  return (
    <div
      className={`loader${state === 'leaving' ? ' is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={state === 'loading'}
      onTransitionEnd={(e) => e.target === e.currentTarget && state === 'leaving' && setState('done')}
    >
      <p className="loader-mark">
        911 GT3 <em>Concept</em>
      </p>
      <span className="loader-line" aria-hidden="true">
        <span className="loader-bar" />
      </span>
      <span className="sr-only">{state === 'loading' ? 'Chargement' : 'Chargé'}</span>
    </div>
  )
}
