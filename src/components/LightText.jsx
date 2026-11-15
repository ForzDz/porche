/*
 * Texte révélé par la lumière (balayage de phare), sans filter ni clip-path.
 * Couches superposées, même texte, même retour à la ligne :
 *   .lt-dim         texte réel, à 25 % d'opacité avant le passage du phare
 *   .lt-mask        fenêtre qui glisse de gauche à droite (xPercent -100 → 0)…
 *   .lt-lit         …avec, dedans, la copie à 100 % qui compense (100 → 0)
 *   .lt-glint       bande de lumière (--sweep-width) qui traverse le titre…
 *   .lt-glint-text  …avec une copie --lueur des lettres : le reflet sur le chrome
 * État CSS par défaut = texte éclairé (mouvement réduit, avant le JS).
 * Animation : lightReveal() dans lib/light.js.
 */
export default function LightText({ text }) {
  return (
    <span className="lt">
      <span className="lt-dim">{text}</span>
      <span className="lt-mask" aria-hidden="true">
        <span className="lt-lit">{text}</span>
      </span>
      <span className="lt-glint" aria-hidden="true">
        <span className="lt-glint-text">{text}</span>
      </span>
    </span>
  )
}
