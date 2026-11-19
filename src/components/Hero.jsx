import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, willChangeWhileActive } from '../lib/scroll.js'
import { MQ_FINE_POINTER, MQ_MOBILE, useMediaQuery } from '../lib/media.js'
import { createFrameDriver, createVideoDriver } from '../lib/drivers.js'
import LightText from './LightText.jsx'
import { lightReveal, setLit } from '../lib/light.js'
import { DRIVER, INTRO, STATS, STATS_NOTE, formatStat } from '../content.js'
import { markHeroReady } from '../lib/ready.js'
import './Hero.css'

/*
 * Timeline scrubée normalisée 0 → 1 = toute la course du pin.
 *   0.00-0.10  showroom : intro-dark → intro-lit + une bande de lueur qui traverse l'écran
 *   0.10-1.00  média (vidéo ou séquence) scrubé
 * Le texte n'est PAS scrubé : la progression scrubée ouvre/ferme des
 * fenêtres (carte de CLAUDE.md) et chaque bloc joue une courte timeline
 * temporelle — rapide et nette même si le scroll s'arrête au milieu.
 */
const INTRO_END = 0.1
const PIN_LENGTH = 2.75 // en hauteurs d'écran (5 avant : trop long à parcourir)
// À l'arrêt du scroll, un comptage en cours finit en 0,3 s au plus (= --dur-fast)
const COUNT_FINISH = 0.3

/*
 * Parallaxe au pointeur (desktop à pointeur fin uniquement) : les plans glissent
 * VERS le pointeur, lissés par quickTo. Vidéo agrandie à 1.04 : avec 10 px de
 * course, aucun bord n'apparaît (1.04 = ±29 px de marge à 1440).
 */
const PARALLAX = { media: 10, copy: 5, scale: 1.04, duration: 0.8 }

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
  const isMobile = useMediaQuery(MQ_MOBILE)
  // effets « caméra » (parallaxe, grain, vignette) : pointeur fin + desktop. Mouvement réduit = StaticHero.
  const fx = useMediaQuery(MQ_FINE_POINTER) && !isMobile
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
      const swept = new Set()
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

      /*
       * Entrée d'un bloc. Le titre (.t-display) est balayé par la lumière au
       * premier passage seulement (sweep) ; ensuite il revient en fondu, déjà éclairé.
       */
      const buildEnter = (blk, counting, sweep) => {
        const titles = blk.querySelectorAll('.t-display')
        const rest = blk.querySelectorAll('.rise')
        const leds = blk.querySelectorAll('.led')
        const halo = blk.querySelectorAll('.driver-halo')
        const nums = blk.querySelectorAll('.stat-count')
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
        if (!titles.length) {
          // bloc sans titre (chiffres) : rien à éclairer
        } else if (sweep) {
          tl.set(titles, { opacity: 1 }, 0)
          titles.forEach((t) => tl.add(lightReveal(t), 0))
        } else {
          titles.forEach((t) => setLit(tl, t))
          fromTo(tl, titles, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0)
        }
        const after = sweep && titles.length ? 0.6 : 0.25 // le reste suit le phare
        fromTo(tl, rest, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, after)
        fromTo(tl, leds, { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.06, ease: 'power3.inOut' }, after + 0.05)
        fromTo(tl, halo, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
        if (counting) {
          tl.call(() => nums.forEach((num, i) => (num.textContent = formatStat(0, STATS[i].decimals))), null, 0)
          nums.forEach((num, i) => {
            const { to, decimals } = STATS[i]
            const n = { v: 0 }
            const write = () => (num.textContent = formatStat(n.v, decimals))
            tl.fromTo(n, { v: 0 }, { v: to, duration: 1.5, ease: 'power3.out', onUpdate: write }, 0.05 + i * 0.12)
          })
        }
        return tl
      }

      // Sortie : la lumière s'éteint (opacité), la LED se replie
      const buildLeave = (blk) => {
        const titles = blk.querySelectorAll('.t-display')
        const rest = blk.querySelectorAll('.rise')
        const leds = blk.querySelectorAll('.led')
        const halo = blk.querySelectorAll('.driver-halo')
        const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false }, onStart: animOn(blk), onComplete: animOff(blk) })
        fromTo(tl, titles, { opacity: 1 }, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 0)
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
        // balayage de lumière : une seule fois par titre
        const sweep = !swept.has(blk)
        swept.add(blk)
        const key = `${phase.sel}:in${counting ? ':count' : ''}${sweep ? ':sweep' : ''}`
        play(blk, key, () => buildEnter(blk, counting, sweep))
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

      /*
       * Compteurs : à l'arrêt du scroll, les chiffres doivent afficher leur
       * valeur finale. Si l'entrée qui compte tourne encore (vers l'avant),
       * on l'accélère pour qu'elle finisse en COUNT_FINISH au plus.
       */
      // appelé par onScrubComplete : la position scrubée s'est posée = le scroll est arrêté
      const finishCount = () => {
        const tl = cache.get('.blk-stats:in:count:sweep') // le comptage = premier passage
        if (!tl?.isActive() || tl.reversed()) return
        const left = (tl.duration() - tl.time()) / tl.timeScale()
        if (left > COUNT_FINISH) tl.timeScale((tl.duration() - tl.time()) / COUNT_FINISH)
      }

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
          onScrubComplete: finishCount,
          invalidateOnRefresh: true,
          // calques compositeur seulement pendant le pin
          onToggle: (self) => {
            willChangeWhileActive(q('.hero-lit, .hero-media'), 'opacity')(self)
            willChangeWhileActive(q('.hero-sweep'))(self)
          },
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
        // le balayage traverse tout l'écran pendant l'allumage (largeur 45vw → 100vw = 223 %)
        .fromTo(q('.hero-sweep'), { xPercent: -100 }, { xPercent: 223, duration: INTRO_END }, 0)
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
    }, stage)

    // ScrollTrigger.refresh() : centralisé dans App.jsx
    return () => {
      ctx.revert()
      driver.destroy()
    }
  }, [isMobile])

  /*
   * Parallaxe + pause hors champ. Actifs seulement quand le hero est à l'écran :
   * écoute du pointeur, will-change et animation du grain (classe .is-onscreen).
   * Transforms posés sur des enveloppes (.hero-px-*) : jamais sur .hero-layers /
   * .hero-copy, que la sortie du hero déplace déjà en y.
   */
  useLayoutEffect(() => {
    if (!fx) return
    const stage = stageRef.current
    const media = stage.querySelector('.hero-px-media')
    const copy = stage.querySelector('.hero-px-copy')
    const ease = 'power3.out'
    const { duration } = PARALLAX
    let to = null
    const ctx = gsap.context(() => {
      gsap.set(media, { scale: PARALLAX.scale })
      to = {
        mx: gsap.quickTo(media, 'x', { duration, ease }),
        my: gsap.quickTo(media, 'y', { duration, ease }),
        cx: gsap.quickTo(copy, 'x', { duration, ease }),
        cy: gsap.quickTo(copy, 'y', { duration, ease }),
      }
    }, stage)

    // -1 → 1 depuis le centre de l'écran
    const aim = (nx, ny) => {
      to.mx(nx * PARALLAX.media)
      to.my(ny * PARALLAX.media)
      to.cx(nx * PARALLAX.copy)
      to.cy(ny * PARALLAX.copy)
    }
    const move = (e) => aim((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    // pointeur sorti de la fenêtre : les plans reviennent au centre
    const leave = (e) => !e.relatedTarget && aim(0, 0)

    let onscreen = false
    const setOnscreen = (on) => {
      if (on === onscreen) return
      onscreen = on
      stage.classList.toggle('is-onscreen', on)
      media.style.willChange = copy.style.willChange = on ? 'transform' : ''
      if (on) {
        window.addEventListener('pointermove', move, { passive: true })
        document.addEventListener('pointerout', leave)
      } else {
        window.removeEventListener('pointermove', move)
        document.removeEventListener('pointerout', leave)
      }
    }
    const st = ScrollTrigger.create({
      trigger: stage.parentElement, // .hero (pin compris)
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => setOnscreen(self.isActive),
    })
    setOnscreen(st.isActive)

    return () => {
      setOnscreen(false)
      st.kill()
      ctx.revert()
    }
  }, [fx])

  return (
    <section className="hero" aria-label="911 GT3 Concept">
      <div className="hero-stage" ref={stageRef}>
        {/* Plans visuels (enveloppe : parallaxe au pointeur) */}
        <div className="hero-px hero-px-media">
          <div className="hero-layers" aria-hidden="true">
            <img className="hero-img hero-dark" src="/intro-dark.jpg" alt="" fetchPriority="high" decoding="async" />
            <img className="hero-img hero-lit" src="/intro-lit.jpg" alt="" decoding="async" />
            {/* 0-10 % : une bande de lueur traverse le showroom pendant qu'il s'allume */}
            <div className="hero-sweep" />
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
        </div>

        {/* Vignette statique : bords plus sombres (desktop) */}
        {fx && <div className="hero-vignette" aria-hidden="true" />}

        {/* Texte : toujours sur les zones sombres (enveloppe : parallaxe, moitié de la vidéo) */}
        <div className="hero-px hero-px-copy">
          <div className="hero-copy">
            <div className="blk blk-intro" id="design">
              <h1 className="t-display">
                <LightText text={INTRO.title} />
                <span className="led" />
              </h1>
              <p className="t-sub rise">{INTRO.sub}</p>
            </div>

            <div className="blk blk-stats" id="performance">
              <h2 className="sr-only">Performances</h2>
              <dl className="stats">
                {STATS.map((s) => (
                  <div className="stat" key={s.label}>
                    <dt className="stat-label label rise">{s.label}</dt>
                    <dd className="stat-value">
                      {/* le fantôme réserve la largeur finale : le compteur ne décale rien */}
                      <span className="stat-num rise">
                        <span className="stat-ghost" aria-hidden="true">
                          {s.value}
                        </span>
                        <span className="stat-count">{s.value}</span>
                      </span>
                      <span className="stat-unit rise">{s.unit}</span>
                      <span className="led" />
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="stats-note rise">{STATS_NOTE}</p>
            </div>

            <div className="blk blk-driver" id="habitacle">
              <span className="driver-halo" aria-hidden="true" />
              <h2 className="t-display t-center">
                <LightText text={DRIVER.title} />
                <span className="led led-center" />
              </h2>
              <span className="rise">
                <button type="button" className="btn-outline" onClick={onDiscover}>
                  {DRIVER.cta}
                  <span className="btn-arrow" aria-hidden="true">
                    ↓
                  </span>
                </button>
              </span>
            </div>

            {/* Invitation à défiler : la LED du bas de caisse qui pulse (opacité) */}
            <div className="hero-cue" aria-hidden="true">
              <div className="hero-cue-inner">
                <span className="hero-cue-led" />
              </div>
            </div>
          </div>
        </div>

        {/* Grain de film : tuile de bruit déplacée par paliers (transform), en pause hors champ */}
        {fx && (
          <div className="hero-grain" aria-hidden="true">
            <div className="hero-grain-tex" />
          </div>
        )}

        {/* Sortie : noir par-dessus vidéo + texte (opacité seulement) */}
        <div className="hero-veil" aria-hidden="true" />
      </div>
    </section>
  )
}
