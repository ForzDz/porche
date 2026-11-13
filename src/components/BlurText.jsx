import { Fragment } from 'react'

/*
 * Flou → net sans animer `filter` (CLAUDE.md : transform + opacity seulement).
 * Chaque glyphe existe deux fois : une copie floutée une fois pour toutes en CSS
 * (.bt-blur) et une copie nette (.bt-sharp). On ne fait que croiser leurs opacités.
 */

/** Titre découpé lettre par lettre. Le texte réel reste lisible par les lecteurs d'écran. */
export function BlurLetters({ text }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="bt" aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className="bt-word">
              {[...word].map((c, i) => (
                <span className="bt-ch" key={i}>
                  <span className="bt-sharp">{c}</span>
                  <span className="bt-blur">{c}</span>
                </span>
              ))}
            </span>
            {w < words.length - 1 && ' '}
          </Fragment>
        ))}
      </span>
    </>
  )
}

/**
 * Bloc entier (sous-titre, valeur de compteur) : SANS flou.
 * Le flou est réservé aux grands titres (BlurLetters) ; ici la révélation
 * est seulement opacité + translation.
 * Un « fantôme » invisible réserve la largeur finale : le compteur
 * peut changer de texte sans jamais décaler la mise en page.
 */
export function BlurLine({ text, className = '' }) {
  return (
    <span className={`bt-line ${className}`}>
      <span className="bt-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="bt-sharp">{text}</span>
    </span>
  )
}
