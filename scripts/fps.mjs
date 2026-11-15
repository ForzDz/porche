/*
 * FPS pendant un scroll à la molette dans le hero (1440×900, Chrome stable headless).
 *
 *   npm run fps                 arbre de travail
 *   npm run fps -- --ref HEAD~1 un commit (pour comparer)
 *   --runs 3                    nombre de passes (défaut 2)
 *   --zone sections             part de Lignes (après le hero) et promène le pointeur
 *                               pendant la molette (lampe, révélations, cartes)
 *
 * Mesure requestAnimationFrame pendant ~4 s de molette (défaut : hero, Lenis + scrub vidéo).
 * Headless = pas de vrai GPU ni d'écran : chiffres valables pour COMPARER deux
 * versions, pas comme FPS absolu d'un appareil réel.
 */
import { join } from 'node:path'
import { args, launchChrome, sleep, waitLoader } from './lib/browser.mjs'
import { buildAndServe, SHOTS } from './lib/serve.mjs'

const opt = args()
const runs = Number(opt.runs ?? 2)
const sections = opt.zone === 'sections'
const base = String(opt.ref ?? 'working').replace(/[^\w.~-]+/g, '_')
const site = await buildAndServe({ ref: opt.ref, outDir: join(SHOTS, '.dist', `fps-${base}`) })
const chrome = await launchChrome()
console.log(`▸ ${site.label} · ${runs} passe(s) · zone ${sections ? 'sections (pointeur en mouvement)' : 'hero'}`)
try {
  for (let run = 1; run <= runs; run++) {
    const page = await chrome.newPage({ url: site.url, width: 1440, height: 900, mobile: false, mask: false })
    await waitLoader(page.ev)
    await sleep(2000)
    if (sections) {
      await page.ev(`window.scrollTo(0, document.getElementById('lignes').getBoundingClientRect().top + scrollY - innerHeight)`)
      await sleep(1500)
    }
    await page.ev(`window.__f = []; (function loop(t) { window.__f.push(t); if (window.__f.length < 100000) requestAnimationFrame(loop) })(performance.now())`)
    for (let i = 0; i < 120; i++) {
      const x = sections ? Math.round(720 + 430 * Math.sin(i / 9)) : 700
      const y = sections ? Math.round(450 + 250 * Math.sin(i / 6)) : 450
      if (sections) await page.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
      await page.s('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: 60 })
      await sleep(33)
    }
    const r = await page.ev(`(() => {
      const f = window.__f, d = f.slice(1).map((t, i) => t - f[i])
      const s = (f.at(-1) - f[0]) / 1000
      return { fps: +(d.length / s).toFixed(1), long: d.filter((x) => x > 33.4).length, maxMs: Math.round(Math.max(...d)), scrollY: Math.round(scrollY) }
    })()`)
    console.log(`  passe ${run} : ${r.fps} i/s · images > 33 ms : ${r.long} · pire image : ${r.maxMs} ms · scroll ${r.scrollY}px`)
    await page.close()
  }
} finally {
  await chrome.close()
  await site.close()
}
process.exit(0)
