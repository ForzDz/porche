/*
 * Deux "drivers" de média avec la même interface :
 *   render(v)  v ∈ [0, 1] = progression dans le média
 *   destroy()
 */

/* ── Desktop : la vidéo, currentTime suit le scroll ─────────────────── */
export function createVideoDriver(video, { onReady, onMeta: onMetaCb } = {}) {
  let duration = 0
  let target = 0
  let ready = false

  // Jamais d'autoplay : on reste en pause, seul currentTime bouge.
  video.pause()

  const seek = () => {
    if (!ready || video.seeking) return // le prochain "seeked" rattrape la cible
    const t = target * duration
    if (Math.abs(video.currentTime - t) > 1 / 48) video.currentTime = t
  }

  const onMeta = () => {
    // on s'arrête juste avant la fin pour garder la dernière image affichée
    duration = Math.max(0, video.duration - 0.05)
    ready = true
    onMetaCb?.()
    seek()
  }
  const onData = () => onReady?.()

  if (video.readyState >= 1) onMeta()
  else video.addEventListener('loadedmetadata', onMeta, { once: true })
  if (video.readyState >= 2) onData()
  else video.addEventListener('loadeddata', onData, { once: true })
  video.addEventListener('seeked', seek)
  video.addEventListener('play', video.pause) // garde-fou anti-autoplay

  return {
    render(v) {
      target = v
      seek()
    },
    destroy() {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('loadeddata', onData)
      video.removeEventListener('seeked', seek)
      video.removeEventListener('play', video.pause)
    },
  }
}

/* ── Mobile : séquence WebP dessinée sur un canvas ──────────────────── */
const FRAME_COUNT = 181
const frameSrc = (i) => `/frames/f_${String(i + 1).padStart(3, '0')}.webp`

// Ordre de chargement progressif : 1re image, puis grille de plus en plus fine,
// pour qu'un scroll rapide trouve toujours une image proche.
function loadOrder(n) {
  const order = [0]
  const seen = new Set(order)
  for (let step = 32; step >= 1; step >>= 1) {
    for (let i = 0; i < n; i += step) {
      if (!seen.has(i)) {
        seen.add(i)
        order.push(i)
      }
    }
  }
  if (!seen.has(n - 1)) order.push(n - 1)
  return order
}

export function createFrameDriver(canvas, { onFirstFrame } = {}) {
  const ctx = canvas.getContext('2d')
  const frames = new Array(FRAME_COUNT)
  let wanted = 0
  let drawn = -1
  let alive = true
  let first = true

  const nearestLoaded = (i) => {
    for (let d = 0; d < FRAME_COUNT; d++) {
      if (frames[i - d]) return i - d
      if (frames[i + d]) return i + d
    }
    return -1
  }

  const draw = (force = false) => {
    const idx = nearestLoaded(wanted)
    if (idx < 0 || (idx === drawn && !force)) return
    const img = frames[idx]
    const cw = canvas.width
    const ch = canvas.height
    // object-fit: cover
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * s
    const h = img.naturalHeight * s
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    drawn = idx
    if (first) {
      first = false
      onFirstFrame?.()
    }
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    ctx.imageSmoothingQuality = 'high'
    draw(true)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  // File de chargement : 6 requêtes en parallèle
  const queue = loadOrder(FRAME_COUNT)
  const next = () => {
    if (!alive || !queue.length) return
    const i = queue.shift()
    const img = new Image()
    img.decoding = 'async'
    img.src = frameSrc(i)
    img
      .decode()
      .then(() => {
        if (!alive) return
        frames[i] = img
        // redessine si cette image est plus proche de la cible que l'actuelle
        if (drawn < 0 || Math.abs(i - wanted) < Math.abs(drawn - wanted)) draw()
      })
      .catch(() => {})
      .finally(next)
  }
  for (let k = 0; k < 6; k++) next()

  return {
    render(v) {
      wanted = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(v * (FRAME_COUNT - 1))))
      draw()
    },
    destroy() {
      alive = false
      ro.disconnect()
    },
  }
}
