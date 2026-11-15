/*
 * Chrome STABLE en headless, piloté par le Chrome DevTools Protocol.
 * Pas le Chromium de Playwright : il ne décode pas l'H.264 de hero.mp4.
 * Aucune dépendance : WebSocket natif de Node (≥ 22).
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const CANDIDATES = {
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  ],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'],
}

export function findChrome() {
  const list = [process.env.CHROME_PATH, ...(CANDIDATES[process.platform] ?? [])].filter(Boolean)
  const found = list.find((p) => existsSync(p))
  if (!found) throw new Error('Chrome stable introuvable. Définis CHROME_PATH vers chrome.exe / Google Chrome.')
  return found
}

/*
 * Rendu reproductible pour les captures : pas de décodage d'image différé
 * (placeholder basse qualité puis remplacement), pas de raster partiel,
 * pas de lissage LCD, profil couleur fixe. Pas utilisé pour la mesure FPS.
 */
const DETERMINISTIC = ['--disable-gpu', '--disable-checker-imaging', '--disable-partial-raster', '--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb']

/** Lance Chrome et renvoie { send, newPage, close }. */
export async function launchChrome({ deterministic = false } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'shots-chrome-'))
  const proc = spawn(
    findChrome(),
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--mute-audio',
      ...(deterministic ? DETERMINISTIC : []),
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  // Chrome écrit son port de débogage dans le profil
  const portFile = join(profile, 'DevToolsActivePort')
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100)
  const [port, path] = readFileSync(portFile, 'utf8').trim().split('\n')
  const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`)
  await new Promise((r, j) => (ws.addEventListener('open', r, { once: true }), ws.addEventListener('error', j, { once: true })))

  let seq = 0
  const pending = new Map()
  const listeners = new Set()
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id)
      pending.delete(m.id)
      if (m.error) rej(new Error(`${m.error.message} (${m.error.code})`))
      else res(m.result)
    } else if (m.method) listeners.forEach((fn) => fn(m))
  })
  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const id = ++seq
      pending.set(id, { res, rej })
      ws.send(JSON.stringify({ id, method, params, sessionId }))
    })

  /**
   * Nouvel onglet émulé. Renvoie { s, ev, screenshot, logs, close }.
   * mask : cache les éléments non déterministes (média scrubé, bandeau, point du cue).
   */
  async function newPage({ url, width, height, mobile, reduced = false, mask = true }) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
    const s = (m, p) => send(m, p, sessionId)
    const logs = []
    const onEvt = (m) => {
      if (m.sessionId !== sessionId) return
      if (m.method === 'Runtime.exceptionThrown') logs.push(`exception: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`)
      if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type))
        logs.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`)
      if (m.method === 'Log.entryAdded' && ['error', 'warning'].includes(m.params.entry.level)) logs.push(`${m.params.entry.level}: ${m.params.entry.text}`)
    }
    listeners.add(onEvt)
    await s('Runtime.enable')
    await s('Log.enable')
    await s('Page.enable')
    await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
    if (reduced) await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    if (mobile) await s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
    if (mask)
      await s('Page.addScriptToEvaluateOnNewDocument', {
        source: `addEventListener('DOMContentLoaded', () => {
          const st = document.createElement('style')
          st.textContent = '.hero-media, .marquee-track, .hero-cue-dot { visibility: hidden !important }'
          document.head.append(st)
        })`,
      })
    await s('Page.navigate', { url })
    const ev = async (expression) => {
      const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error(`evaluate: ${r.exceptionDetails.exception?.description ?? expression}`)
      return r.result.value
    }
    const screenshot = async () => Buffer.from((await s('Page.captureScreenshot', { format: 'png' })).data, 'base64')
    const close = async () => {
      listeners.delete(onEvt)
      await send('Target.closeTarget', { targetId })
    }
    return { s, ev, screenshot, logs, close }
  }

  const close = async () => {
    try {
      await send('Browser.close')
    } catch {
      /* déjà fermé */
    }
    ws.close()
    proc.kill()
    for (let i = 0; i < 20; i++) {
      try {
        rmSync(profile, { recursive: true, force: true })
        break
      } catch {
        await sleep(150) // Windows : fichiers encore verrouillés quelques ms
      }
    }
  }
  return { send, newPage, close }
}

/** Attend la fin de l'écran de chargement (classe .loader retirée du DOM). */
export async function waitLoader(ev, timeoutMs = 15000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    if (!(await ev(`!!document.querySelector('.loader')`))) return
    await sleep(150)
  }
  throw new Error('Le loader ne disparaît pas')
}

/** Lit les options --clé valeur / --drapeau de la ligne de commande. */
export function args(argv = process.argv.slice(2)) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) out._.push(a)
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[a.slice(2)] = argv[++i]
    else out[a.slice(2)] = true
  }
  return out
}
