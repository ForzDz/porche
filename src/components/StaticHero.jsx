import { DRIVER, INTRO, STATS, STATS_NOTE } from '../content.js'
import { useEffect } from 'react'
import { markHeroReady } from '../lib/ready.js'
import './Hero.css'

/*
 * prefers-reduced-motion : aucun scrub, aucun pin, aucun lissage.
 * Le showroom est directement allumé ; les trois temps du récit
 * restent lisibles sous forme de panneaux fixes.
 */
export default function StaticHero({ onDiscover }) {
  // images statiques : rien à attendre
  useEffect(markHeroReady, [])

  return (
    <section className="hero hero--static" aria-label="911 GT3 Concept">
      <div className="panel" id="design">
        <img className="hero-img hero-lit-static" src="/intro-lit.jpg" alt="" fetchPriority="high" />
        <div className="scrim scrim-left" />
        <div className="hero-copy">
          <div className="blk blk-intro">
            <h1 className="t-display">
              {INTRO.title}
              <span className="led" />
            </h1>
            <p className="t-sub">{INTRO.sub}</p>
          </div>
        </div>
      </div>

      <div className="panel" id="performance">
        <img className="hero-img" src="/stills/profile.webp" alt="" loading="lazy" />
        <div className="scrim scrim-top" />
        <div className="hero-copy">
          <div className="blk blk-stats">
            <h2 className="sr-only">Performances</h2>
            <dl className="stats">
              {STATS.map((s) => (
                <div className="stat" key={s.label}>
                  <dt className="stat-label">{s.label}</dt>
                  <dd className="stat-value">
                    {s.value}
                    <span className="stat-unit">{s.unit}</span>
                    <span className="led" />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="stats-note">{STATS_NOTE}</p>
          </div>
        </div>
      </div>

      <div className="panel" id="habitacle">
        <img className="hero-img" src="/stills/cockpit.webp" alt="" loading="lazy" />
        <div className="scrim scrim-bottom" />
        <div className="hero-copy">
          <div className="blk blk-driver">
            <h2 className="t-display t-center">
              {DRIVER.title}
              <span className="led led-center" />
            </h2>
            <button type="button" className="btn-outline" onClick={onDiscover}>
              {DRIVER.cta}
              <span className="btn-arrow" aria-hidden="true">
                ↓
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
