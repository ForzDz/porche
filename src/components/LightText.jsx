/*
 * Texte révélé par la lumière (balayage de phare), sans filter ni clip-path.
 * Trois couches superposées, même texte, même retour à la ligne :
 *   .lt-dim   texte réel (acier) : apparaît dans le noir (opacity)
 *   .lt-mask  fenêtre qui glisse de gauche à droite (xPercent -100 → 0)…
 *   .lt-lit   …avec, dedans, la copie éclairée (chrome) qui compense (100 → 0)
 *   .lt-beam  bande de lumière accrochée au bord avant de la fenêtre
 * État CSS par défaut = texte éclairé (mouvement réduit, avant le JS).
 * Animation : lightReveal() dans lib/light.js.
 */
export default function LightText({ text }) {
  return (
    <span className="lt">
      <span className="lt-dim">{text}</span>
      <span className="lt-mask" aria-hidden="true">
        <span className="lt-lit">{text}</span>
        <span className="lt-beam" />
      </span>
    </span>
  )
}
