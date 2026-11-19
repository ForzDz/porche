/*
 * Captures de référence : 1440 / 375 / 320 × 11 positions de scroll.
 *
 *   npm run shots                         arbre de travail → .shots/working/
 *   npm run shots -- --name avant         → .shots/avant/
 *   npm run shots -- --ref HEAD~1         un commit → .shots/HEAD~1/ (nom par défaut = ref)
 *   npm run shots:reduced                 prefers-reduced-motion émulé (suffixe -reduced)
 *   --no-mask                             garde vidéo, bandeau et point du cue (critique visuelle)
 *   --sizes 1440,375                      sous-ensemble de largeurs
 *
 * Écrit aussi report.json : vérifications de navigation + messages console.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { args, launchChrome, sleep, waitLoader } from './lib/browser.mjs'
import { buildAndServe, SHOTS } from './lib/serve.mjs'

const opt = args()
const reduced = !!opt.reduced
const mask = !opt['no-mask']
const ALL_SIZES = {
  1440: { width: 1440, height: 900, mobile: false },
  375: { width: 375, height: 812, mobile: true },
  320: { width: 320, height: 640, mobile: true },
}
const sizes = String(opt.sizes ?? '1440,375,320').split(',')
const base = String(opt.name ?? opt.ref ?? 'working').replace(/[^\w.~-]+/g, '_')
const name = `${base}${reduced ? '-reduced' : ''}${mask ? '' : '-nomask'}`
const out = join(SHOTS, name)
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const t0 = Date.now()
const site = await buildAndServe({ ref: opt.ref, outDir: join(SHOTS, '.dist', base) })
console.log(`▸ ${site.label} servi sur ${site.url}${reduced ? ' · mouvement réduit' : ''}${mask ? '' : ' · sans masque'}`)
const chrome = await launchChrome({ deterministic: true })
const report = { source: site.label, reduced, mask, date: new Date().toISOString(), shots: [], checks: {}, console: {} }

try {
  for (const key of sizes) {
    const size = ALL_SIZES[key]
    if (!size) throw new Error(`Largeur inconnue : ${key}`)
    const page = await chrome.newPage({ url: site.url, ...size, reduced, mask })
    const { ev } = page
    await waitLoader(ev)
    await sleep(size.mobile ? 4000 : 2500) // séquence d'images (mobile) / vidéo
    const PIN = 1.25 * size.height // longueur du pin du hero (= PIN_LENGTH, Hero.jsx)
    const goto = async (y, wait = 2600) => {
      await ev(`window.scrollTo(0, ${Math.round(y)})`)
      await sleep(wait)
    }
    const top = (sel) => ev(`document.querySelector('${sel}').getBoundingClientRect().top + window.scrollY`)
    const shot = async (label) => {
      // images chargées entièrement décodées + 2 frames : rendu stable avant capture
      await ev(`Promise.all([...document.images].filter((i) => i.complete && i.naturalWidth).map((i) => i.decode().catch(() => {})))
        .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))`)
      const file = `${key}-${label}.png`
      writeFileSync(join(out, file), await page.screenshot())
      report.shots.push(file)
    }

    // 11 positions : 5 dans le hero, 6 dans la page
    for (const [label, p] of [['p00', 0], ['p05', 0.05], ['p20', 0.2], ['p50', 0.5], ['p90', 0.9]]) {
      await goto(p * PIN)
      await shot(label)
    }
    for (const [label, sel, off] of [['lignes', '#lignes', 0], ['lignes2', '#lignes', 0.9], ['gamme', '#gamme', 0], ['gamme2', '#gamme', 1.3], ['contact', '#contact', 0]]) {
      await goto((await top(sel)) + off * size.height)
      await shot(label)
    }
    await goto(await ev('document.documentElement.scrollHeight'))
    await shot('footer')

    // Vérifications fonctionnelles
    const c = {}
    const lignesTop = () => ev(`Math.round(document.getElementById('lignes').getBoundingClientRect().top)`)
    await goto(0.95 * PIN)
    await ev(`document.querySelector('.blk-driver button').click()`)
    await sleep(3200)
    c.discoverLignesTop = await lignesTop() // 0 = « Découvrir » arrive sur Lignes
    await goto(0, 1500)
    await ev(`document.querySelector('.site-header .btn-outline').click()`)
    await sleep(3200)
    c.headerCtaLignesTop = await lignesTop()
    c.nav = {}
    for (const id of ['design', 'performance', 'habitacle']) {
      await goto(0, 1200)
      await ev(`document.querySelector('.site-nav a[href="#${id}"]').click()`)
      await sleep(3000)
      const y = await ev('scrollY')
      c.nav[id] = reduced ? y : +(y / PIN).toFixed(3) // progression du pin (ou scrollY sans pin)
    }
    c.footerLinks = await ev(`[...document.querySelectorAll('.ft-links a')].map((a) => a.textContent).join(' · ')`)
    report.checks[key] = c
    report.console[key] = page.logs
    await page.close()
    console.log(`  ${key} ✓  Découvrir→Lignes ${c.discoverLignesTop}px · nav ${Object.values(c.nav).join(' / ')} · console ${page.logs.length}`)
  }
} finally {
  await chrome.close()
  await site.close()
}
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2))
console.log(`✔ ${report.shots.length} captures → ${out} (${Math.round((Date.now() - t0) / 1000)} s)`)
process.exit(0)
