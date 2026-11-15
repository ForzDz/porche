# DESIGN.md — 911 GT3 Concept · « Nuit & Chrome »

> Source de vérité de la direction artistique. Les valeurs ci-dessous sont celles du code
> (`src/index.css`, bloc `:root` et « Classes communes »). Si ce fichier et le code
> divergent, le code a raison et ce fichier doit être corrigé.
> Projet concept non officiel, sans lien avec Porsche AG.

---

## 1. Visual Theme & Atmosphere

- **Mood** : un showroom la nuit. Noir profond, chrome froid, une seule couleur vive : le rouge des LED.
- **Densité** : très aérée. Une idée par écran, beaucoup de noir autour.
- **Narration** : le scroll est une caméra. Elle tourne autour de la voiture, longe le profil, la portière s'ouvre, elle entre dans l'habitacle jusqu'au volant.
- **Règle d'or** : le texte se pose **sur le noir, jamais sur la voiture**. Des voiles (scrims) localisés assombrissent seulement la zone où le texte apparaît.
- **Matière** : surfaces mates, angles vifs, filets de 1 px. Pas d'ombre portée, pas de verre dépoli, pas de dégradé décoratif.

## 2. Color Palette & Roles

| Token | Hex | Rôle |
|---|---|---|
| `--nuit` | `#0A0A0B` | Fond de page, voiles, texte sur bouton survolé |
| `--carbone` | `#16171A` | Surfaces (cartes, fond d'image), filets de séparation |
| `--acier` | `#8A8F98` | Texte secondaire, labels, liens au repos |
| `--chrome` | `#E8E8EA` | Texte principal, titres, contour et remplissage des boutons |
| `--rouge` | `#E10600` | **Accent unique** : LED, soulignés, focus, état actif |

Dérivés (toujours via `color-mix()` sur un token, jamais un hex en dur) :
- `--scrim` = nuit 78 %, `--scrim-soft` = nuit 45 % → voiles derrière le texte du hero
- bordures : chrome 55 % (bouton), acier 18 % (carte), acier 45 % (ligne de champ)

Règles : le rouge ne remplit jamais une grande surface (exception assumée : le « 911 » du footer, à remplacer à l'étape 4). Aucun autre accent.

## 3. Typography Rules

**Familles**
- Display : `--font-display` = Bodoni Moda (didone, éditoriale), poids 400, italique pour les accents (« *Concept* », prix).
- Texte : `--font-text` = Hanken Grotesk, poids 300 (courant) et 400 (labels, boutons).

**Échelle** (px à 1440 / 375 / 320)

| Token | Valeur | px | Usage |
|---|---|---|---|
| `--fs-display` | `clamp(2.6rem, 5.4vw, 5.75rem)` | 78 / 42 / 42 | Titres de section, titre du hero |
| `--fs-h1` | `clamp(2.25rem, 4.6vw, 4.75rem)` | 66 / — / — | « Tout part du volant » (desktop) |
| `--fs-h2` | `clamp(2.25rem, 4vw, 4.25rem)` | 58 / 36 / 36 | Titres de carte, chiffres du hero (desktop) |
| `--fs-h3` | `1.375rem` | 22 | Prix des cartes, marque du loader |
| `--fs-lead` | `clamp(1rem, 1.15vw, 1.125rem)` | 17 / 16 / 16 | Chapeaux, sous-titre du hero, marque du header |
| `--fs-body` | `1rem` | 16 | Texte courant, champs (16 px : pas de zoom iOS) |
| `--fs-small` | `0.875rem` | 14 | Specs, légendes, statut |
| `--fs-label` | `0.75rem` | 12 | Labels, liens de nav, boutons |
| `--fs-micro` | `0.6875rem` | 11 | Petites mentions (« Chiffres concept », « Scroll ») |

Décoratifs : `--fs-marquee` (bandeau), `--fs-giant` (911 du footer).
Variantes mobiles du hero (≤ 767 px) : `--fs-hero-title-sm`, `--fs-hero-driver-sm`, `--fs-stat-sm` (les labels des chiffres restent en `--fs-micro`, 11 px minimum).

**Interlignage** : `--lh-tight` 1 (chiffres, cartes) · titres de section 1.02 · `--lh-body` 1.55 · `--lh-relaxed` 1.7 (paragraphes longs).
**Approche** : `--tracking-display` −0.01em (titres) · `--tracking-text` 0.04em (sous-titres, légendes) · `--tracking-label` 0.2em (capitales).

## 4. Component Stylings

| Composant | Classe | Spécification |
|---|---|---|
| **LED** (signature) | `.led` | Filet `--rouge` 1 px, 7.5rem max sous un titre (2.5–3rem sous un chiffre, une légende, un prix). Entre en `scaleX` 0 → 1 depuis la gauche. |
| **Bouton** | `.btn-outline` | Contour chrome 55 %, angles vifs, `--fs-label` capitales `--tracking-label`, hauteur min 44 px. Survol : remplissage chrome qui glisse de gauche à droite (`scaleX`), texte passe en nuit. Flèche `.btn-arrow` qui descend de 3 px. |
| **Titre de section** | `.section-title` | `--fs-display`, Bodoni 400, interlignage 1.02, suivi d'une `.led`. Marges locales au composant. |
| **Label** | `.label` | `--fs-label`, capitales, `--tracking-label`, acier. La graisse reste à l'élément. |
| **Lien de nav** | `.label.nav-link` | Label + souligné LED rouge au survol (`scaleX`), texte acier → chrome. Header en 400, footer en 300. |
| **Carte** (Gamme) | `.card` | Fond carbone, bordure acier 18 %, image 7/12 + texte 5/12. Desktop : sticky, la carte recouverte recule (`scale` 0.92) et s'assombrit (voile nuit 45 %). |
| **Formulaire** | `.field` | Pas de boîte : une ligne du bas acier 45 %. Label flottant qui monte et rétrécit au focus. Au focus, la ligne rouge grandit depuis la gauche. Démo : n'envoie rien. |

## 5. Layout Principles

- **Gouttières** : `--gutter` = `clamp(1rem, 4.5vw, 4.5rem)` (16 px mobile → 65 px à 1440).
- **Section** : `.section` = padding vertical `--space-section` (`clamp(4rem, 10vh, 6rem)`), fond nuit.
- **Grille éditoriale** : `.grid-5-7` = colonnes 5fr / 7fr, gouttière `--gap-grid`, une colonne sous 768 px.
- **Rythme vertical** (suit la hauteur d'écran) : `--space-section` › `--space-xl` › `--space-l` › `--space-m` › `--space-s` › `--space-xs` › `--space-2xs`.
- **Écarts horizontaux** (suivent la largeur) : `--gap-grid` › `--gap-l` › `--gap-m` › `--gap-s`.
- **Pas fixes** (intérieur des composants) : `--sp-1` 0.25rem … `--sp-12` 3rem.
- **Rayons** : **0 partout**. Angles vifs. Seule exception : le point de statut du formulaire (cercle).
- **Ordre de la page** : Loader → Header → Hero (pin 2,75 écrans) → Bandeau → Lignes → Gamme → Contact → Footer.

## 6. Depth & Elevation

Pas d'ombres, pas de flou. La profondeur vient de :
1. la **lumière** (le showroom s'allume, voiles nuit localisés) ;
2. l'**opacité** (voile noir de sortie du hero, carte recouverte assombrie) ;
3. le **recouvrement** (cartes sticky, sections qui montent sur le hero).

z-index : header 50, loader 100, le reste en `-1` local sous `isolation: isolate`.

## 7. Motion

- **Easings** : `--ease-out` `cubic-bezier(0.22, 1, 0.36, 1)` (par défaut) · `--ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)` (boucles).
- **Durées** : `--dur-fast` 0.3s (couleurs) · `--dur-base` 0.4s (soulignés, flèches, labels, remplissage bouton) · `--dur-slow` 0.6s (fondus, header, ligne de champ). Chorégraphies : `--dur-loader`, `--delay-loader-out`, `--dur-cue-in`, `--delay-cue-in`, `--dur-cue-loop`.
- **Règle absolue** : n'animer que `transform` et `opacity`. Pas de `filter`, pas de `clip-path`, pas de `backdrop-filter` (le flou des titres est une copie pré-floutée en `text-shadow` dont seule l'opacité change).
- **Scroll** : Lenis + GSAP ScrollTrigger (une seule boucle rAF). La vidéo n'est jamais en lecture : `currentTime` suit le scroll.
- **Mouvement réduit** : version statique du hero (`StaticHero`), pas de Lenis, transitions CSS instantanées.

## 8. Responsive Behavior

| Largeur | Comportement |
|---|---|
| ≥ 768 px | Vidéo scrubée, grille 5/7, cartes sticky, liens de nav visibles |
| < 768 px | Séquence WebP sur canvas, une colonne, cartes en carrousel horizontal (scroll-snap), header = marque + bouton + « Menu » (panneau de toutes les sections, affiché / masqué sans animation) |
| < 360 px | Marque, bouton et « Menu » du header resserrés |
| Portrait | Les blocs de texte du hero montent dans le plafond sombre |

Largeurs de contrôle obligatoires : **1440 / 375 / 320**, plus le FPS.

## 9. Do's and Don'ts

**Signature — à garder**
- La **LED rouge 1 px** sous chaque titre.
- La palette Nuit & Chrome, un seul accent rouge.
- La narration caméra → portière → volant pilotée par le scroll.
- Le texte se pose sur le noir, jamais sur la voiture.

**Do**
- Utiliser les tokens (`--fs-*`, `--space-*`, `--gap-*`, `--sp-*`, `--dur-*`) et les classes communes.
- Garder les chiffres et prix explicitement « concept ».

**Don't**
- Aucune couleur, taille de texte ou durée en dur hors `:root`.
- Aucune vraie photo Porsche, aucun prix présenté comme réel, aucun logo.
- Pas de `backdrop-filter`, pas d'ombre portée, pas de rayon.

**Tropes à éviter — présents aujourd'hui, À REMPLACER À L'ÉTAPE 4**

| Trope | Où |
|---|---|
| Bandeau défilant en texte contour | `Marquee.jsx` |
| Chiffre géant en contour qui se remplit | `Footer.jsx` (« 911 ») |
| Cartes sticky empilées qui rétrécissent | `Range.jsx` |
| Boutons magnétiques + parallaxe au curseur | `lib/magnetic.js`, `Hero.jsx` |
| Capitales espacées sur chaque élément secondaire | `.label`, `.btn-outline`, stats, cue |
| Révélation lettre par lettre flou → net + compteurs qui montent | `Hero.jsx`, `BlurText.jsx` |
| Indicateur « Scroll » avec trait animé | `Hero.jsx` (`.hero-cue`) |
| ~~Slogans anglais génériques mêlés au français~~ | **Réglé (étape 4b)** : titres courts et factuels en français |
| Grille éditoriale 5/7 texte-à-gauche / images-à-droite | `.grid-5-7` (Lignes, Contact) |
| Combo didone + grotesk light sur noir | typo globale |

## 10. Agent Prompt Guide

- Avant tout changement visuel, lire ce fichier puis `src/index.css` (`:root`).
- Un nouveau composant réutilise `.section`, `.section-title` + `.led`, `.label`, `.btn-outline` avant de créer du CSS.
- Toute nouvelle valeur récurrente devient un token dans `:root`, documenté ici.
- Vérifier 1440 / 375 / 320 et le FPS ; comparer des captures avant/après pour tout refactor censé être invisible.
