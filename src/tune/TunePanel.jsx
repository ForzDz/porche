import { useState } from 'react'
import { replayLight } from '../lib/light.js'
import './tune.css'

/*
 * Panneau de réglage de la lumière : uniquement avec ?tune dans l'URL.
 * Chargé à la demande (React.lazy dans App.jsx) : sans ?tune, ce code et ce
 * CSS ne sont jamais téléchargés.
 * Les sliders écrivent les variables CSS de :root en direct ; « Copier les
 * valeurs » donne un bloc :root prêt à coller dans src/index.css.
 */
const CONTROLS = [
  { v: '--lamp-opacity', label: 'Lampe · intensité', min: 0, max: 0.5, step: 0.01 },
  { v: '--lamp-radius', label: 'Lampe · rayon', min: 150, max: 800, step: 10, unit: 'px' },
  { v: '--texture-opacity', label: 'Texture sous la lampe', min: 0, max: 1, step: 0.05 },
  { v: '--sweep-opacity', label: 'Balayage · intensité', min: 0, max: 1, step: 0.05 },
  { v: '--sweep-width', label: 'Balayage · largeur', min: 1, max: 8, step: 0.25, unit: 'em', replay: true },
  { v: '--led-glow', label: 'LED · lueur', min: 0, max: 1, step: 0.05 },
]

const root = document.documentElement
const read = (c) => parseFloat(getComputedStyle(root).getPropertyValue(c.v)) || 0
const fmt = (c, n) => `${+n.toFixed(3)}${c.unit ?? ''}`

export default function TunePanel() {
  const [values, setValues] = useState(() => Object.fromEntries(CONTROLS.map((c) => [c.v, read(c)])))
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState('')

  const change = (c) => (e) => {
    const n = Number(e.target.value)
    root.style.setProperty(c.v, fmt(c, n))
    setValues((v) => ({ ...v, [c.v]: n }))
  }

  const css = () => `:root {\n${CONTROLS.map((c) => `  ${c.v}: ${fmt(c, values[c.v])};`).join('\n')}\n}\n`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css())
      setCopied('Copié')
    } catch {
      setCopied('Copie refusée : bloc affiché dans la console')
      console.info(css())
    }
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <aside className="tune" aria-label="Réglages de la lumière">
      <header className="tune-head">
        <strong>Lumière</strong>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Réduire' : 'Ouvrir'}
        </button>
      </header>
      {open && (
        <>
          {CONTROLS.map((c) => (
            <label className="tune-row" key={c.v}>
              <span>
                {c.label} <output>{fmt(c, values[c.v])}</output>
              </span>
              <input type="range" min={c.min} max={c.max} step={c.step} value={values[c.v]} onChange={change(c)} onPointerUp={c.replay ? replayLight : undefined} />
            </label>
          ))}
          <div className="tune-actions">
            <button type="button" onClick={replayLight}>
              Rejouer les balayages
            </button>
            <button type="button" onClick={copy}>
              Copier les valeurs
            </button>
          </div>
          <p className="tune-note" role="status">
            {copied || 'Lampe : desktop, après le hero. Copie : bloc :root pour src/index.css.'}
          </p>
        </>
      )}
    </aside>
  )
}
