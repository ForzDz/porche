import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll.js'
import { MQ_MOBILE, useMediaQuery } from '../lib/media.js'
import { createFrameDriver, createVideoDriver } from '../lib/drivers.js'
import { DRIVER, INTRO, STATS, STATS_NOTE } from '../content.js'
import './Hero.css'

/*
 * Timeline normalisée 0 → 1 = toute la course du pin.
 *   0.00-0.10  showroom : intro-dark → intro-lit
 *   0.10-1.00  média (vidéo ou séquence) scrubé
 * Les fenêtres de texte suivent la carte de CLAUDE.md.
 */
const INTRO_END = 0.1
const PIN_LENGTH = 5 // en hauteurs d'écran

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

export default function Hero({ onDiscover }) {
  const isMobile = useMediaQuery(MQ_MOBILE)
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const posterRef = useRef(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const hidePoster = () => posterRef.current?.classList.add('is-hidden')
    const driver = isMobile
      ? createFrameDriver(canvasRef.current, { onFirstFrame: hidePoster })
      : createVideoDriver(videoRef.current, { onReady: hidePoster })

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stage)
      const progress = { v: 0 }

      // États de départ (évite le flash avant le premier rendu du scrub)
      gsap.set(q('.hero-lit, .hero-media'), { opacity: 0 })
      gsap.set(q('.blk, .scrim'), { autoAlpha: 0 })
      gsap.set(q('.led'), { scaleX: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'hero',
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * PIN_LENGTH}`,
          pin: true,
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      })

      // 0-10 % : les lumières du showroom s'allument
      tl.to(q('.hero-lit'), { opacity: 1, duration: INTRO_END }, 0)
        .to(q('.hero-cue'), { opacity: 0, y: 12, duration: 0.05 }, 0.03)
        // relais image allumée → média (même cadrage que la frame 1)
        .to(q('.hero-media'), { opacity: 1, duration: 0.03 }, INTRO_END - 0.005)
        // 10-100 % : le scroll pilote le média
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

      const reveal = (sel, at) => {
        tl.fromTo(
          q(`${sel}`),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.03 },
          at,
        )
          .fromTo(
            q(`${sel} .rise`),
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.05, stagger: 0.012, ease: 'power2.out' },
            at,
          )
          .to(q(`${sel} .led`), { scaleX: 1, duration: 0.06, stagger: 0.012, ease: 'power2.inOut' }, at + 0.02)
      }
      const leave = (sel, at) => {
        tl.to(q(`${sel} .rise`), { y: -20, opacity: 0, duration: 0.035, stagger: 0.006, ease: 'power1.in' }, at).to(
          q(sel),
          { autoAlpha: 0, duration: 0.01 },
          at + 0.035,
        )
      }

      // 10-35 % — GAUCHE : Born at Night
      reveal('.blk-intro', 0.12)
      tl.to(q('.scrim-left'), { autoAlpha: 1, duration: 0.04 }, 0.11)
      leave('.blk-intro', 0.31)
      tl.to(q('.scrim-left'), { autoAlpha: 0, duration: 0.04 }, 0.32)

      // 35-65 % — HAUT GAUCHE : chiffres
      tl.to(q('.scrim-top'), { autoAlpha: 1, duration: 0.04 }, 0.36)
      reveal('.blk-stats', 0.37)
      leave('.blk-stats', 0.6)
      tl.to(q('.scrim-top'), { autoAlpha: 0, duration: 0.04 }, 0.61)

      // 65-100 % — CENTRE BAS : Built Around the Driver (reste affiché).
      // La portière s'ouvre de 65 à ~75 % : le texte attend que la caméra
      // soit dans l'habitacle pour ne jamais se poser sur la carrosserie.
      tl.to(q('.scrim-bottom'), { autoAlpha: 1, duration: 0.05 }, 0.73)
      reveal('.blk-driver', 0.76)
    }, stage)

    // Les webfonts changent la hauteur des blocs : on recalcule une fois chargées
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
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

        {/* Texte : toujours sur les zones sombres */}
        <div className="hero-copy">
          <div className="blk blk-intro" id="design">
            <h1 className="t-display">
              <span className="rise">{INTRO.title}</span>
              <span className="led" />
            </h1>
            <p className="t-sub rise">{INTRO.sub}</p>
          </div>

          <div className="blk blk-stats" id="performance">
            <h2 className="sr-only">Performances</h2>
            <dl className="stats">
              {STATS.map((s) => (
                <div className="stat rise" key={s.label}>
                  <dt className="stat-label">{s.label}</dt>
                  <dd className="stat-value">
                    {s.value}
                    <span className="stat-unit">{s.unit}</span>
                    <span className="led" />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="stats-note rise">{STATS_NOTE}</p>
          </div>

          <div className="blk blk-driver" id="habitacle">
            <h2 className="t-display t-center">
              <span className="rise">{DRIVER.title}</span>
              <span className="led led-center" />
            </h2>
            <button type="button" className="btn-outline rise" onClick={onDiscover}>
              {DRIVER.cta}
              <span className="btn-arrow" aria-hidden="true">
                ↓
              </span>
            </button>
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
      </div>
    </section>
  )
}
