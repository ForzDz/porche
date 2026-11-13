/*
 * Signal unique « le hero peut s'afficher » :
 *   desktop → métadonnées de hero.mp4 chargées
 *   mobile  → première image de la séquence dessinée
 *   mouvement réduit → immédiat (images statiques)
 */
let ready = false
const subs = new Set()

export function markHeroReady() {
  if (ready) return
  ready = true
  subs.forEach((fn) => fn())
  subs.clear()
}

export function onHeroReady(fn) {
  if (ready) {
    fn()
    return () => {}
  }
  subs.add(fn)
  return () => subs.delete(fn)
}
