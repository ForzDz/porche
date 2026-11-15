/*
 * Vidéo de scroll du haut en bas (Chrome stable headless → mp4 H.264).
 *
 *   npm run record -- --name avant          arbre de travail → .shots/avant.mp4
 *   npm run record -- --ref HEAD~1 --name x un commit
 *   --duration 25                           durée totale en s (1 s d'arrêt au début et à la fin)
 *   --no-pointer                            pas de pointeur qui se promène (sinon : lampe visible)
 *
 *   --slow 4                                ralenti de capture (défaut 4, 1 = temps réel)
 *
 * Scroll régulier (vitesse constante, piloté par requestAnimationFrame dans la page),
 * 1440×900, sans masque. Le screencast CDP ne livre que ~9 images/s : pendant
 * l'enregistrement, l'horloge de la page est ralentie (performance.now, Date.now et
 * rAF → GSAP, Lenis ; Animation.setPlaybackRate → transitions et animations CSS),
 * puis les horodatages sont remis à l'échelle : vidéo en temps réel, ~36 images/s
 * effectives, durées d'animation exactes. Le décodage de la vidéo du hero, lui,
 * n'est pas ralenti (il paraît donc un peu plus réactif que sur un vrai écran).
 * Headless : la fluidité de la vidéo n'est PAS une mesure de FPS (voir npm run fps).
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { args, launchChrome, sleep, waitLoader } from './lib/browser.mjs'
import { buildAndServe, SHOTS } from './lib/serve.mjs'

const opt = args()
const W = 1440
const H = 900
const total = Number(opt.duration ?? 25) * 1000
const HOLD = 1000
const scrollMs = total - 2 * HOLD
const SLOW = Number(opt.slow ?? 4)
const base = String(opt.ref ?? 'working').replace(/[^\w.~-]+/g, '_')
const name = String(opt.name ?? base).replace(/[^\w.~-]+/g, '_')
const out = join(SHOTS, `${name}.mp4`)
const dir = join(SHOTS, `.rec-${name}`)
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })

const site = await buildAndServe({ ref: opt.ref, outDir: join(SHOTS, '.dist', `rec-${base}`) })
const chrome = await launchChrome()
console.log(`▸ ${site.label} · ${total / 1000} s · ${W}×${H}`)
const frames = []
try {
  const page = await chrome.newPage({ url: site.url, width: W, height: H, mobile: false, mask: false })
  // horloge de page réglable (voir en-tête) ; vitesse 1 jusqu'au début de l'enregistrement
  await page.s('Page.addScriptToEvaluateOnNewDocument', {
    source: `(() => {
      const pn = performance.now.bind(performance)
      const d0 = Date.now() - pn()
      let rate = 1, aReal = 0, aVirt = 0
      const virt = () => aVirt + (pn() - aReal) * rate
      window.__setClockRate = (r) => { aVirt = virt(); aReal = pn(); rate = r }
      performance.now = virt
      Date.now = () => Math.round(d0 + virt())
      const raf = window.requestAnimationFrame.bind(window)
      window.requestAnimationFrame = (cb) => raf(() => cb(virt()))
    })()`,
  })
  await page.s('Animation.enable')
  await page.s('Page.reload')
  await sleep(500)
  await waitLoader(page.ev)
  await sleep(2500)

  page.on((m) => {
    if (m.method !== 'Page.screencastFrame') return
    const file = `f${String(frames.length).padStart(5, '0')}.jpg`
    writeFileSync(join(dir, file), Buffer.from(m.params.data, 'base64'))
    frames.push({ file, t: m.params.metadata.timestamp / SLOW }) // secondes de page
    page.s('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {})
  })
  await page.ev(`window.__setClockRate(${1 / SLOW})`)
  await page.s('Animation.setPlaybackRate', { playbackRate: 1 / SLOW })
  await page.s('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: W, maxHeight: H })

  // pointeur qui se promène (courbe de Lissajous) pendant tout l'enregistrement
  let walking = !opt['no-pointer']
  const walk = (async () => {
    const t0 = Date.now()
    while (walking) {
      const t = (Date.now() - t0) / 1000 / SLOW // temps de page
      const x = Math.round(W / 2 + W * 0.3 * Math.sin(t * 0.7))
      const y = Math.round(H / 2 + H * 0.28 * Math.sin(t * 1.1))
      await page.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }).catch(() => {})
      await sleep(40 * SLOW)
    }
  })()

  await sleep(HOLD * SLOW)
  await page.ev(`new Promise((res) => {
    const max = document.documentElement.scrollHeight - innerHeight
    const t0 = performance.now()
    ;(function step(t) {
      const k = Math.min(1, (t - t0) / ${scrollMs})
      window.scrollTo(0, max * k)
      if (k < 1) requestAnimationFrame(step)
      else res()
    })(t0)
  })`)
  await sleep(HOLD * SLOW)
  walking = false
  await walk
  await page.s('Page.stopScreencast')
  await sleep(300)
  await page.close()
} finally {
  await chrome.close()
  await site.close()
}

if (frames.length < 2) throw new Error('Aucune image reçue du screencast')
// durée de chaque image = écart avec la suivante (temps réel)
const list = frames.map((f, i) => `file '${f.file}'\nduration ${((frames[i + 1]?.t ?? f.t + 1 / 30) - f.t).toFixed(4)}`)
list.push(`file '${frames.at(-1).file}'`) // concat : la dernière durée n'est prise qu'avec une ligne de plus
writeFileSync(join(dir, 'list.txt'), list.join('\n'))
const r = spawnSync(
  'ffmpeg',
  ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', out],
  { cwd: dir, stdio: 'inherit' },
)
if (r.status !== 0) throw new Error('ffmpeg a échoué')
rmSync(dir, { recursive: true, force: true })
const span = frames.at(-1).t - frames[0].t
console.log(`✔ ${out} · ${frames.length} images pour ${span.toFixed(1)} s de page (${(frames.length / span).toFixed(1)} i/s effectives, ralenti ×${SLOW})`)
process.exit(0)
