/*
 * Page HTML de comparaison avant | après, à ouvrir dans le navigateur.
 *
 *   npm run compare:html -- .shots/avant .shots/apres --out .shots/compare.html
 *   --video a.mp4,b.mp4     vidéos à afficher en tête (chemins relatifs à --out ou absolus)
 *
 * Une ligne par capture (même nom de fichier dans les deux dossiers), avec le nom
 * lisible de la position. Si `npm run compare` a été lancé avant, le pourcentage
 * SSIM de son report.md est repris et l'image « différence ×6 » est en lien.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { args } from './lib/browser.mjs'

const opt = args()
const [a, b] = opt._.map((p) => resolve(p))
if (!a || !b) throw new Error('Usage : compare-html <dossier avant> <dossier après> [--out page.html]')
const out = resolve(opt.out ?? join(dirname(a), `compare-${basename(a)}-vs-${basename(b)}.html`))
const rel = (p) => relative(dirname(out), p).split('\\').join('/')

const POS = {
  p00: 'Hero 0 % · showroom éteint',
  p05: 'Hero 5 % · le showroom s’allume',
  p20: 'Hero 20 % · titre d’ouverture',
  p50: 'Hero 50 % · chiffres',
  p90: 'Hero 90 % · habitacle',
  lignes: 'Lignes · entrée',
  lignes2: 'Lignes · images',
  gamme: 'Gamme · entrée',
  gamme2: 'Gamme · cartes',
  contact: 'Contact',
  footer: 'Pied de page',
}

// SSIM / écart repris du rapport de compare.mjs, s'il existe
const cmpDir = join(dirname(a), `compare-${basename(a)}-vs-${basename(b)}`)
const stats = {}
if (existsSync(join(cmpDir, 'report.md')))
  for (const line of readFileSync(join(cmpDir, 'report.md'), 'utf8').split('\n')) {
    // | 1440-contact.png | diff | 0.982822 | 222 |
    const [, file, status, ssim] = line.split('|').map((c) => c.trim())
    if (/^\d+-\w+\.png$/.test(file ?? '')) stats[file] = status === 'diff' ? `SSIM ${ssim}` : 'identique'
  }

const files = readdirSync(a).filter((f) => f.endsWith('.png') && existsSync(join(b, f)))
const sizes = [...new Set(files.map((f) => f.split('-')[0]))].sort((x, y) => y - x)
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const videos = String(opt.video ?? '').split(',').filter(Boolean)

const rows = (size) =>
  files
    .filter((f) => f.startsWith(`${size}-`))
    .sort((x, y) => Object.keys(POS).indexOf(x.slice(size.length + 1, -4)) - Object.keys(POS).indexOf(y.slice(size.length + 1, -4)))
    .map((f) => {
      const key = f.slice(size.length + 1, -4)
      const st = stats[f]
      const diff = existsSync(join(cmpDir, f)) ? ` · <a href="${rel(join(cmpDir, f))}">différence ×6</a>` : ''
      return `<figure>
  <figcaption><strong>${esc(POS[key] ?? key)}</strong> <span>${size} px · ${f}${st ? ` · ${st}` : ''}${diff}</span></figcaption>
  <div class="pair">
    <a href="${rel(join(a, f))}"><img src="${rel(join(a, f))}" alt="Avant : ${esc(POS[key] ?? key)}, ${size} px" loading="lazy"><span>Avant</span></a>
    <a href="${rel(join(b, f))}"><img src="${rel(join(b, f))}" alt="Après : ${esc(POS[key] ?? key)}, ${size} px" loading="lazy"><span>Après</span></a>
  </div>
</figure>`
    })
    .join('\n')

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Avant | après · ${esc(basename(a))} / ${esc(basename(b))}</title>
<style>
  :root { --bg: #0a0a0b; --card: #16171a; --fg: #e8e8ea; --dim: #8a8f98; --red: #e10600; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 system-ui, sans-serif; }
  header { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: baseline;
    padding: 14px 24px; background: var(--bg); border-bottom: 1px solid var(--card); }
  h1 { margin: 0; font-size: 17px; font-weight: 600; }
  nav a { color: var(--dim); margin-right: 14px; }
  a { color: var(--fg); }
  main { padding: 0 24px 64px; }
  h2 { margin: 40px 0 12px; font-size: 15px; color: var(--dim); font-weight: 500; text-transform: uppercase; letter-spacing: .12em; }
  h2::after { content: ''; display: block; width: 48px; height: 1px; margin-top: 8px; background: var(--red); }
  figure { margin: 0 0 28px; }
  figcaption { margin-bottom: 8px; }
  figcaption span { color: var(--dim); margin-left: 8px; font-size: 13px; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
  .pair a { position: relative; display: block; background: var(--card); }
  .pair img { display: block; width: 100%; height: auto; }
  .pair span { position: absolute; left: 8px; top: 8px; padding: 2px 8px; background: rgb(10 10 11 / .8); font-size: 12px; text-decoration: none; }
  .mobile .pair { grid-template-columns: repeat(2, minmax(0, 375px)); }
  video { display: block; width: 100%; max-width: 1800px; background: #000; margin-bottom: 12px; }
  @media (max-width: 700px) { .pair, .mobile .pair { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header>
  <h1>Avant | après</h1>
  <span style="color:var(--dim)">${esc(basename(a))} → ${esc(basename(b))} · ${files.length} paires</span>
  <nav>${videos.length ? '<a href="#videos">Vidéos</a>' : ''}${sizes.map((s) => `<a href="#w${s}">${s} px</a>`).join('')}</nav>
</header>
<main>
${videos.length ? `<h2 id="videos">Vidéos</h2>\n${videos.map((v) => `<p>${esc(basename(v))}</p><video src="${esc(v)}" controls preload="metadata"></video>`).join('\n')}` : ''}
${sizes.map((s) => `<section id="w${s}" class="${Number(s) < 768 ? 'mobile' : ''}"><h2>${s} px</h2>\n${rows(s)}</section>`).join('\n')}
</main>
</body>
</html>
`
writeFileSync(out, html)
console.log(`✔ ${out} · ${files.length} paires`)
