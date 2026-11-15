# PORSCHE 911 GT3 — Concept website (non officiel)

## Objectif
Site vitrine concept pour un tuto YouTube. Le scroll pilote une vidéo :
la caméra tourne autour de la voiture, longe le profil, la portière
s'ouvre et la caméra entre dans l'habitacle jusqu'au volant.
Projet concept, sans lien avec Porsche AG.

## Stack
React + Vite + GSAP ScrollTrigger + Lenis. Aucune autre lib d'animation.
Node ≥ 22.13 (`.nvmrc`). Ne pas modifier sans raison `src/lib/scroll.js`,
`src/lib/drivers.js`, `src/lib/ready.js` (moteur de scroll et de média).

## Direction artistique
**La DA fait foi dans `DESIGN.md`** (palette, typo, tokens, composants,
motion, tropes à éviter). Une seule source de vérité : ne pas la recopier ici.
Tokens dans `src/index.css` (`:root`) : aucune couleur, taille de texte ou
durée en dur ailleurs.

## Médias (public/)
- hero.mp4 : 15 s, 1280x720, 24 i/s, GOP 8, sans son. JAMAIS d'autoplay
  sur desktop : le scroll pilote currentTime.
- poster.jpg : première image, affichée pendant le chargement.
- intro-dark.jpg → intro-lit.jpg : le showroom s'allume au début.
- frames/f_001.webp à f_181.webp : séquence pour le mobile (canvas).
- stills/ : images fixes (Lignes, Gamme, hero statique).

## Page (ordre réel, `src/App.jsx`)
| # | Section | Fichier | Ancre | Rôle |
|---|---|---|---|---|
| 0 | Loader | `Loader.jsx` | — | Écran de chargement jusqu'au « hero prêt » (6 s max), scroll verrouillé |
| 1 | Header | `Header.jsx` | — | Fixe, se cache en descendant. Liens Design / Performance / Habitacle + bouton « Découvrir » (→ `#lignes`). Mobile : bouton « Menu » → toutes les sections |
| 2 | Hero | `Hero.jsx` (`StaticHero.jsx` si mouvement réduit) | `#design` `#performance` `#habitacle` | Pin de 2,75 écrans, vidéo scrubée, carte du texte ci-dessous |
| 3 | Lignes | `Lines.jsx` | `#lignes` | LED rouge pleine largeur qui s’allume (transition depuis le hero), puis « L’air d’abord » balayé par la lumière ; texte sticky + 3 images révélées |
| 4 | Gamme | `Range.jsx` | `#gamme` | 3 versions fictives (cartes sticky desktop, carrousel mobile). Prix = « Concept » |
| 5 | Contact | `Contact.jsx` | `#contact` | Formulaire de démo, n'envoie rien. Libellés honnêtes (« Tester l’envoi ») |
| 6 | Footer | `Footer.jsx` | `#concept` | Liens + mention légale |

Textes et navigation : tous dans `src/content.js` (source unique).
Navigation en français, un nom par section, partagé header / footer :
Design, Performance, Habitacle, Lignes, Gamme, Contact.
« Découvrir » (hero) et le bouton du header mènent à `#lignes`.

## Carte du texte du hero (le texte se pose sur le noir, jamais sur la voiture)
Progression du pin (0-1). Fenêtres exactes dans `PHASES` (`Hero.jsx`).
| Scroll | Image | Texte |
|---|---|---|
| 0-10 % | Le showroom s'allume | Rien, seulement l'indicateur de scroll |
| 12-31 % | Orbite de l'avant au profil | GAUCHE : « Née la nuit » + « La 911 GT3, réimaginée. » |
| 37-60 % | Travelling le long du profil | HAUT GAUCHE : 3 chiffres « 510 ch », « 318 km/h », « 3,4 s 0-100 » + mention « chiffres concept » |
| 65-76 % | La portière s'ouvre | Rien (le texte attend d'être dans l'habitacle) |
| 76-100 % | L'habitacle, le volant | CENTRE BAS : « Tout part du volant » + bouton « Découvrir » |

Liens du header → position dans le pin : Design 24 %, Performance 50 %, Habitacle 86 %.

## Interdits
- Aucune vraie photo Porsche, aucun prix présenté comme réel.
- Formulaire de démo qui n'envoie rien. Pas de WhatsApp, pas de réservation.
- Footer : « Projet concept non officiel, sans lien avec Porsche AG. »
- Jamais de backdrop-filter sur la vidéo. Animer seulement transform et opacity.

## Méthode
- Montre ton approche en 3 lignes avant de coder.
- Un prompt = un changement. Commit après chaque étape qui marche.
- `npm run lint` + `npm run build` doivent passer avant chaque commit.
- Vérifier 1440 / 375 / 320 px et le FPS après chaque changement.
- Refactor censé être invisible : comparer des captures avant/après
  (`npm run shots` / `npm run compare`, voir README « Vérification »).
- En cas de conflit entre un skill et DESIGN.md / CLAUDE.md, DESIGN.md et CLAUDE.md gagnent.

## Outils agent (scope projet)
- **Impeccable** (`.claude/skills/impeccable`, v4.9.1, sans hooks) : utilisé pour
  `critique` et `audit`. NE JAMAIS lancer `/impeccable document`, ni laisser
  `init`, `new-work` ou un sous-agent `impeccable-documenter` écrire ou remplacer
  `DESIGN.md` : toute modification de DESIGN.md est faite à la main, sur demande.
  Pas de mode `live` (il peut lancer un agent sans permissions).
- **Awwwards MCP** (`.mcp.json`, version figée) : inspiration personnelle
  uniquement, pas de scraping massif, rien de republié.
- **Pas d'agent-browser** : `scripts/shots.mjs` (captures reproductibles) et
  Claude in Chrome (inspection interactive) suffisent.

## Docs
- `DESIGN.md` : direction artistique (fait foi).
- `docs/AUDIT.md` : audit initial (état au commit 5986b03).
