import { useLayoutEffect, useRef } from 'react'
import { gsap, willChangeWhileActive } from '../lib/scroll.js'
import { MQ_FINE_POINTER, MQ_MOBILE, useMediaQuery } from '../lib/media.js'
import { useMagnetic } from '../lib/magnetic.js'
import { createFrameDriver, createVideoDriver } from '../lib/drivers.js'
import { BlurLetters, BlurLine } from './BlurText.jsx'
import { DRIVER, INTRO, STATS, STATS_NOTE, formatStat } from '../content.js'
import { markHeroReady } from '../lib/ready.js'
import './Hero.css'

/*
 * Timeline scrubée normalisée 0 → 1 = toute la course du pin.
 *   0.00-0.10  showroom : intro-dark → intro-lit
 *   0.10-1.00  média (vidéo ou séquence) scrubé
 * Le texte n'est PAS scrubé : la progression scrubée ouvre/ferme des
 * fenêtres (carte de CLAUDE.md) et chaque bloc joue une courte timeline
 * temporelle — rapide et nette même si le scroll s'arrête au milieu.
 */
const INTRO_END = 0.1
const PIN_LENGTH = 2.75 // en hauteurs d'écran (5 avant : trop long à parcourir)

/*
 * Progression du scroll (0-1) → position dans le média (0-1), par segments,
 * pour caler la vidéo sur la carte de CLAUDE.md :
 *   10 % → frame 1   (avant)
 *   35 % → frame 110 (profil atteint)
 *   65 % → frame 146 (fin du travelling, la portière commence à s'ouvrir)
 *  100 % → frame 181 (le volant)
 */
const MEDIA_KEYS = [
  [INTRO_END, 0],
  [0.35, 109 / 180],
  [0.65, 145 / 180],
  [1, 1],
]
function scrollToMedia(p) {
  for (let i = 1; i < MEDIA_KEYS.length; i++) {
    const [p1, m1] = MEDIA_KEYS[i]
    if (p <= p1) {
      const [p0, m0] = MEDIA_KEYS[i - 1]
      return m0 + ((p - p0) / (p1 - p0)) * (m1 - m0)
    }
  }
  return 1
}

/*
 * Fenêtres de texte (progression scrubée).
 * Driver : la portière s'ouvre de 65 à ~75 % ; le texte attend que la caméra
 * soit dans l'habitacle pour ne jamais se poser sur la carrosserie.
 */
const PHASES = [
  { sel: '.blk-intro', from: 0.12, to: 0.31 },
  { sel: '.blk-stats', from: 0.37, to: 0.6, counters: true },
  { sel: '.blk-driver', from: 0.76, to: Infinity },
]

export default function Hero({ onDiscover }) {
  const magnetic = useMagnetic()
  const isMobile = useMediaQuery(MQ_MOBILE)
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const posterRef = useRef(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const hidePoster = () => posterRef.current?.classList.add('is-hidden')
    const driver = isMobile
      ? createFrameDriver(canvasRef.current, { onFirstFrame: () => (hidePoster(), markHeroReady()) })
      : createVideoDriver(videoRef.current, { onReady: hidePoster, onMeta: markHeroReady })
    let removePointer = () => {}

    const ctx = gsap.context((self) => {
      const q = gsap.utils.selector(stage)
      const progress = { v: 0 }

      gsap.set(q('.hero-lit, .hero-media'), { opacity: 0 })
      gsap.set(q('.blk, .scrim'), { autoAlpha: 0 })

      /*
       * ── Entrée / sortie des blocs de texte (temporelles) ──
       * Chaque timeline est construite UNE fois (au premier passage) puis
       * rejouée : créer des tweens en plein scroll coûtait ~150 ms par
       * phase en CPU ×4 (getComputedStyle sur chaque lettre).
       * Valeurs de départ explicites (fromTo) → rejouable à l'identique.
       * Pas d'overwrite : il amputerait définitivement la timeline en cache.
       * will-change : classe .is-anim posée seulement pendant l'animation.
       */
      const cache = new Map()
      const running = new Map()
      let countersDone = false
      /*
       * Ajoute un fromTo seulement si la cible existe : chaque bloc n'a pas
       * tous les éléments (pas de flou dans les chiffres, pas de .rise ni de
       * halo dans l'intro). Évite les warnings « GSAP target not found ».
       * Durées des timelines inchangées : la fin est toujours fixée par un
       * tween présent (vérifié à l'exécution).
       */
      const fromTo = (tl, targets, from, to, pos) => (targets.length ? tl.fromTo(targets, from, to, pos) : tl)

      const animOn = (blk) => () => blk.classList.add('is-anim')
      const animOff = (blk) => () => blk.classList.remove('is-anim')

      const buildEnter = (blk, counting) => {
        const sharp = blk.querySelectorAll('.bt-sharp')
        const blur = blk.querySelectorAll('.bt-blur') // seulement les grands titres
        const units = blk.querySelectorAll('.bt-ch, .bt-line')
        const rest = blk.querySelectorAll('.rise')
        const leds = blk.querySelectorAll('.led')
        const halo = blk.querySelectorAll('.driver-halo')
        const each = 0.032 // décalage entre deux lettres
        const nums = blk.querySelectorAll('.stat-value .bt-sharp')
        const tl = gsap
          .timeline({
            paused: true,
            defaults: { immediateRender: false },
            onStart: animOn(blk),
            onComplete: animOff(blk),
            onReverseComplete: animOff(blk),
          })
          .set(blk, { autoAlpha: 1 }, 0)
        // hors comptage, les chiffres affichent leur valeur finale (même après un rembobinage)
        if (!counting && nums.length) tl.call(() => nums.forEach((num, i) => (num.textContent = STATS[i].value)), null, 0)
        // la lettre arrive (floue si grand titre), légèrement basse et grande…
        fromTo(tl, units, { y: '0.22em', scale: 1.06 }, { y: 0, scale: 1, duration: 0.8, stagger: each, ease: 'expo.out' }, 0)
        fromTo(tl, blur, { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: each, ease: 'power1.out' }, 0)
        // …puis se met au point : la copie nette remplace la floue
        fromTo(tl, sharp, { opacity: 0 }, { opacity: 1, duration: 0.38, stagger: each, ease: 'power2.out' }, blur.length ? 0.2 : 0)
        fromTo(tl, blur, { opacity: 1 }, { opacity: 0, duration: 0.42, stagger: each, ease: 'power1.in' }, 0.26)
        fromTo(tl, rest, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, 0.25)
        fromTo(tl, leds, { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.06, ease: 'power3.inOut' }, 0.3)
        fromTo(tl, halo, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
        if (counting) {
          tl.call(() => nums.forEach((num, i) => (num.textContent = formatStat(0, STATS[i].decimals))), null, 0)
          blk.querySelectorAll('.stat-value .bt-line').forEach((line, i) => {
            const { to, decimals } = STATS[i]
            const num = line.querySelector('.bt-sharp')
            const n = { v: 0 }
            const write = () => (num.textContent = formatStat(n.v, decimals))
            tl.fromTo(n, { v: 0 }, { v: to, duration: 1.5, ease: 'power3.out', onUpdate: write }, 0.05 + i * 0.12)
          })
        }
        return tl
      }

      const buildLeave = (blk) => {
        const sharp = blk.querySelectorAll('.bt-sharp')
        const blur = blk.querySelectorAll('.bt-blur')
        const rest = blk.querySelectorAll('.rise')
        const leds = blk.querySelectorAll('.led')
        const halo = blk.querySelectorAll('.driver-halo')
        const each = 0.012
        const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false }, onStart: animOn(blk), onComplete: animOff(blk) })
        // la copie nette s'efface pendant que la floue passe brièvement : flou doux
        fromTo(tl, sharp, { opacity: 1 }, { opacity: 0, duration: 0.3, stagger: each, ease: 'power1.in' }, 0)
        // deux tweens simples plutôt que keyframes (timeline interne ré-initialisée)
        fromTo(tl, blur, { opacity: 0 }, { opacity: 0.65, duration: 0.25, stagger: each, ease: 'none' }, 0)
        fromTo(tl, blur, { opacity: 0.65 }, { opacity: 0, duration: 0.25, stagger: each, ease: 'none' }, 0.25)
        fromTo(tl, rest, { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: 0.35, stagger: 0.03, ease: 'power1.in' }, 0)
        fromTo(tl, leds, { scaleX: 1 }, { scaleX: 0, duration: 0.35, ease: 'power2.in' }, 0)
        fromTo(tl, halo, { opacity: 1 }, { opacity: 0, duration: 0.4 }, 0)
        return tl.set(blk, { autoAlpha: 0 })
      }

      const play = (blk, key, build) => {
        running.get(blk)?.pause()
        let tl = cache.get(key)
        if (!tl) cache.set(key, (tl = build()))
        tl.timeScale(1).restart()
        running.set(blk, tl)
      }

      self.add('enter', (phase) => {
        const blk = q(phase.sel)[0]
        // les compteurs ne tournent qu'au premier passage
        const counting = phase.counters && !countersDone
        if (counting) countersDone = true
        play(blk, `${phase.sel}:in${counting ? ':count' : ''}`, () => buildEnter(blk, counting))
      })

      self.add('leave', (phase) => {
        const blk = q(phase.sel)[0]
        const cur = running.get(blk)
        // sortie pendant l'entrée : on rembobine l'entrée (pas de saut d'opacité)
        if (cur?.isActive() && cache.get(`${phase.sel}:out`) !== cur) {
          cur.timeScale(2).reverse()
          return
        }
        play(blk, `${phase.sel}:out`, () => buildLeave(blk))
      })

      const active = new Set()
      const syncPhases = (p) => {
        for (const phase of PHASES) {
          const on = p >= phase.from && p < phase.to
          if (on === active.has(phase)) continue
          if (on) {
            active.add(phase)
            self.enter(phase)
          } else {
            active.delete(phase)
            self.leave(phase)
          }
        }
      }

      /* ── Timeline scrubée : lumière, média, scrims (inchangée) ── */
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => syncPhases(tl.time()),
        scrollTrigger: {
          id: 'hero',
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * PIN_LENGTH}`,
          pin: true,
          scrub: 0.3,
          invalidateOnRefresh: true,
          // calques compositeur seulement pendant le pin
          onToggle: willChangeWhileActive(q('.hero-lit, .hero-media'), 'opacity'),
        },
      })

      /*
       * Sortie : démarre exactement là où le pin s'arrête (dernière image).
       * Trigger séparé, créé APRÈS le pin dans le même contexte (ordre de
       * refresh garanti). Il ne touche jamais `tl` ni le driver : le scrub
       * vidéo reste figé sur la dernière image et repart intact en remontant.
       * Les calques descendent à mi-vitesse → la section suivante monte par-dessus.
       */
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'hero-exit',
            trigger: stage.parentElement,
            start: 'bottom bottom',
            end: 'bottom 40%', // noir complet après 60 % d'écran, même si la page est courte
            scrub: true,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              willChangeWhileActive(q('.hero-veil'), 'opacity')(self)
              willChangeWhileActive(q('.hero-layers, .hero-copy'))(self)
            },
          },
        })
        .to(q('.hero-veil'), { opacity: 1, duration: 1 }, 0)
        // mi-vitesse sur la course de la sortie (0,6 écran → 0,3 écran de décalage)
        .to(q('.hero-layers, .hero-copy'), { y: () => window.innerHeight * 0.3, duration: 1 }, 0)

      tl.to(q('.hero-lit'), { opacity: 1, duration: INTRO_END }, 0)
        .to(q('.hero-cue'), { opacity: 0, y: 12, duration: 0.05 }, 0.03)
        .to(q('.hero-media'), { opacity: 1, duration: 0.03 }, INTRO_END - 0.005)
        .fromTo(
          progress,
          { v: INTRO_END },
          {
            v: 1,
            duration: 1 - INTRO_END,
            onUpdate: () => driver.render(scrollToMedia(progress.v)),
          },
          INTRO_END,
        )
        .to(q('.scrim-left'), { autoAlpha: 1, duration: 0.04 }, 0.11)
        .to(q('.scrim-left'), { autoAlpha: 0, duration: 0.04 }, 0.32)
        .to(q('.scrim-top'), { autoAlpha: 1, duration: 0.04 }, 0.36)
        .to(q('.scrim-top'), { autoAlpha: 0, duration: 0.04 }, 0.61)
        .to(q('.scrim-bottom'), { autoAlpha: 1, duration: 0.05 }, 0.73)

      /* ── Parallaxe curseur : calque texte uniquement, jamais le média ── */
      if (window.matchMedia(MQ_FINE_POINTER).matches) {
        const layers = q('[data-depth]').map((el) => ({
          depth: parseFloat(el.dataset.depth),
          x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
        }))
        const onMove = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          for (const l of layers) {
            l.x(nx * -14 * l.depth)
            l.y(ny * -8 * l.depth)
          }
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        removePointer = () => window.removeEventListener('pointermove', onMove)
      }
    }, stage)

    // ScrollTrigger.refresh() : centralisé dans App.jsx
    return () => {
      removePointer()
      ctx.revert()
      driver.destroy()
    }
  }, [isMobile])

  return (
    <section className="hero" aria-label="911 GT3 Concept">
      <div className="hero-stage" ref={stageRef}>
        {/* Plans visuels */}
        <div className="hero-layers" aria-hidden="true">
          <img className="hero-img hero-dark" src="/intro-dark.jpg" alt="" fetchPriority="high" decoding="async" />
          <img className="hero-img hero-lit" src="/intro-lit.jpg" alt="" decoding="async" />
          <div className="hero-media">
            <img ref={posterRef} className="hero-img hero-poster" src="/poster.jpg" alt="" decoding="async" />
            {isMobile ? (
              <canvas ref={canvasRef} className="hero-canvas" />
            ) : (
              <video
                ref={videoRef}
                className="hero-video"
                src="/hero.mp4"
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                tabIndex={-1}
              />
            )}
          </div>
          <div className="scrim scrim-left" />
          <div className="scrim scrim-top" />
          <div className="scrim scrim-bottom" />
        </div>

        {/* Texte : toujours sur les zones sombres. data-depth = parallaxe curseur */}
        <div className="hero-copy">
          <div className="blk blk-intro" id="design" data-depth="1">
            <h1 className="t-display">
              <BlurLetters text={INTRO.title} />
              <span className="led" />
            </h1>
            <p className="t-sub">
              <BlurLine text={INTRO.sub} />
            </p>
          </div>

          <div className="blk blk-stats" id="performance" data-depth="0.8">
            <h2 className="sr-only">Performances</h2>
            <dl className="stats">
              {STATS.map((s) => (
                <div className="stat" key={s.label}>
                  <dt className="stat-label rise">{s.label}</dt>
                  <dd className="stat-value">
                    <BlurLine text={s.value} className="stat-num" />
                    <span className="stat-unit rise">{s.unit}</span>
                    <span className="led" />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="stats-note rise">{STATS_NOTE}</p>
          </div>

          <div className="blk blk-driver" id="habitacle" data-depth="0.7">
            <span className="driver-halo" aria-hidden="true" />
            <h2 className="t-display t-center">
              <BlurLetters text={DRIVER.title} />
              <span className="led led-center" />
            </h2>
            {/* .rise anime y sur l'enveloppe : le bouton garde x/y pour l'effet magnétique */}
            <span className="rise">
              <button type="button" className="btn-outline" onClick={onDiscover} ref={magnetic}>
                {DRIVER.cta}
                <span className="btn-arrow" aria-hidden="true">
                  ↓
                </span>
              </button>
            </span>
          </div>

          <div className="hero-cue" aria-hidden="true">
            <div className="hero-cue-inner">
              <span className="hero-cue-label">Scroll</span>
              <span className="hero-cue-track">
                <span className="hero-cue-dot" />
              </span>
            </div>
          </div>
        </div>

        {/* Sortie : noir par-dessus vidéo + texte (opacité seulement) */}
        <div className="hero-veil" aria-hidden="true" />
      </div>
    </section>
  )
}
