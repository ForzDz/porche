/*
 * Compare deux dossiers de captures (produits par shots.mjs).
 *
 *   npm run compare -- .shots/avant .shots/apres [--out .shots/compare-x]
 *
 * Par paire : identique au pixel ? sinon SSIM + écart max (0-255) et une
 * image côte à côte « avant | après | différence ×6 ». Rapport : report.md.
 * Code de sortie 1 s'il y a au moins une différence. Nécessite ffmpeg.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { args } from './lib/browser.mjs'

const opt = args()
const [A, B] = opt._.map((p) => resolve(p))
if (!A || !B) {
  console.error('Usage : npm run compare -- <dossier A> <dossier B> [--out <dossier>]')
  process.exit(2)
}
if (spawnSync('ffmpeg', ['-version']).status !== 0) {
  console.error('ffmpeg introuvable dans le PATH (nécessaire pour SSIM et images de différence).')
  process.exit(2)
}
const out = resolve(opt.out ?? join(A, '..', `compare-${basename(A)}-vs-${basename(B)}`))
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const ff = (a) => spawnSync('ffmpeg', ['-hide_banner', ...a], { encoding: 'utf8' }).stderr
const files = readdirSync(A).filter((f) => f.endsWith('.png')).sort()
const rows = []
for (const f of files) {
  const a = join(A, f)
  const b = join(B, f)
  if (!existsSync(b)) {
    rows.push({ f, status: 'absent dans B' })
    continue
  }
  if (readFileSync(a).equals(readFileSync(b))) {
    rows.push({ f, status: 'identique', ssim: 1, ymax: 0 })
    continue
  }
  const ssim = +(ff(['-i', a, '-i', b, '-lavfi', 'ssim', '-f', 'null', '-']).match(/All:([\d.]+)/)?.[1] ?? NaN)
  const ymax = +(
    ff(['-i', a, '-i', b, '-lavfi', 'blend=all_mode=difference,format=gray,signalstats,metadata=print:key=lavfi.signalstats.YMAX', '-f', 'null', '-']).match(
      /YMAX=(\d+)/,
    )?.[1] ?? NaN
  )
  // côte à côte : A | B | différence amplifiée
  const amp = "lutrgb=r='min(255,val*6)':g='min(255,val*6)':b='min(255,val*6)'"
  ff(['-loglevel', 'error', '-y', '-i', a, '-i', b, '-filter_complex', `[0:v]split[a0][a1];[1:v]split[b0][b1];[a0][b0]blend=all_mode=difference,${amp}[d];[a1][b1][d]hstack=inputs=3`, join(out, f)])
  rows.push({ f, status: 'diff', ssim, ymax })
}

const same = rows.filter((r) => r.status === 'identique').length
const line = (r) => `| ${r.f} | ${r.status} | ${r.ssim?.toFixed?.(6) ?? '—'} | ${r.ymax ?? '—'} |`
const consoleCount = (dir) => {
  try {
    return Object.values(JSON.parse(readFileSync(join(dir, 'report.json'), 'utf8')).console).flat().length
  } catch {
    return '?'
  }
}
const md = [
  `# Comparaison de captures`,
  ``,
  `- A : \`${A}\``,
  `- B : \`${B}\``,
  `- **${same}/${rows.length} identiques au pixel**`,
  `- Messages console (warnings/erreurs) : A ${consoleCount(A)} · B ${consoleCount(B)}`,
  ``,
  `Écart max : 0-255 (1-2 = arrondi d'anti-aliasing). Images côte à côte : A | B | différence ×6.`,
  ``,
  `| Capture | Statut | SSIM | Écart max |`,
  `|---|---|---|---|`,
  ...rows.map(line),
].join('\n')
writeFileSync(join(out, 'report.md'), md + '\n')
for (const r of rows) console.log(`${r.status === 'identique' ? '  =' : '  ≠'} ${r.f.padEnd(20)} ${r.status === 'diff' ? `ssim ${r.ssim.toFixed(6)} · écart max ${r.ymax}` : r.status}`)
console.log(`\n${same}/${rows.length} identiques · rapport : ${join(out, 'report.md')}`)
process.exit(same === rows.length ? 0 : 1)
