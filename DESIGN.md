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
| `--lueur` | `#F4EFE6` | **Lumière uniquement** (blanc chaud, légèrement chrome) : halo de la lampe, balayages, reflets. **Jamais une couleur de texte**, jamais un aplat opaque |

Dérivés (toujours via `color-mix()` sur un token, jamais un hex en dur) :
- `--scrim` = nuit 78 %, `--scrim-soft` = nuit 45 % → voiles derrière le texte du hero
- bordures : chrome 55 % (bouton), acier 18 % (carte), acier 45 % (ligne de champ)

Règles : le rouge ne remplit jamais une grande surface (exception assumée : le « 911 » du footer, à remplacer à l'étape 4). Aucun autre accent.

## 3. Typography Rules

**Familles**
- Display : `--font-display` = **Archivo Expanded** (Archivo variable, axe `wdth` à `--stretch-display` 125 %, toujours posé avec la famille), graisse `--fw-display` 500. Titres, chiffres du hero, titres de carte, prix, marque, « 911 » du footer.
- Texte : `--font-text` = **Inter** (variable), poids 300 (courant) et 400 (labels, boutons).
- **Auto-hébergées** (Fontsource, importées dans `main.jsx`, `font-display: swap`) : aucune requête Google Fonts. Pas de fichier italique (−100 Ko) : les accents (« Concept », prix) passent par la couleur (acier), pas par l'italique.

**Échelle** (px à 1440 / 375 / 320)

| Token | Valeur | px | Usage |
|---|---|---|---|
| `--fs-display` | `clamp(2.6rem, 5.4vw, 5.75rem)` | 78 / 42 / 42 | Titres de section |
| `--fs-hero-title` | `clamp(2.5rem, 4.45vw, 4rem)` | 64 / — / — | « Née la nuit » (≥ 768 px) : **une seule ligne** (`nowrap`), dans le mur sombre à gauche, jamais sur la voiture (57 px à 1280) |
| `--fs-h1` | `clamp(2.25rem, 4.6vw, 4.75rem)` | 66 / — / — | « Tout part du volant » (desktop) |
| `--fs-h2` | `clamp(2.25rem, 4vw, 4.25rem)` | 58 / 36 / 36 | Titres de carte, chiffres du hero (desktop, une ligne) |
| `--fs-h3` | `1.375rem` | 22 | Prix des cartes, marque du loader |
| `--fs-lead` | `clamp(1rem, 1.15vw, 1.125rem)` | 17 / 16 / 16 | Chapeaux, sous-titre du hero, marque du header |
| `--fs-body` | `1rem` | 16 | Texte courant, champs (16 px : pas de zoom iOS) |
| `--fs-small` | `0.875rem` | 14 | Specs, légendes, statut |
| `--fs-label` | `0.75rem` | 12 | Labels, liens de nav, boutons |
| `--fs-micro` | `0.6875rem` | 11 | Petites mentions (« Chiffres concept », « Scroll ») |

Décoratif : `--fs-giant` (911 du footer).
Variantes mobiles du hero (≤ 767 px) : `--fs-hero-title-sm`, `--fs-hero-driver-sm`, `--fs-stat-sm` (les labels des chiffres restent en `--fs-micro`, 11 px minimum).

**Interlignage** : `--lh-tight` 1 (chiffres, cartes) · titres de section 1.02 · `--lh-body` 1.55 · `--lh-relaxed` 1.7 (paragraphes longs).
**Approche** : `--tracking-display` −0.01em (titres Archivo Expanded) · `--tracking-text` 0.04em (sous-titres, légendes) · `--tracking-label` 0.2em (capitales).

## 4. Component Stylings

| Composant | Classe | Spécification |
|---|---|---|
| **LED** (signature) | `.led` | Filet `--rouge` 1 px, 7.5rem max sous un titre (2.5–3rem sous un chiffre, une légende, un prix). Entre en `scaleX` 0 → 1 depuis la gauche. |
| **Bouton** | `.btn-outline` | Contour chrome 55 %, angles vifs, `--fs-label` capitales `--tracking-label`, hauteur min 44 px. Survol : remplissage chrome qui glisse de gauche à droite (`scaleX`), texte passe en nuit. Flèche `.btn-arrow` qui descend de 3 px. |
| **Titre de section** | `.section-title` | `--fs-display`, Archivo Expanded 500, interlignage 1.02, suivi d'une `.led`. Marges locales au composant. Texte dans un `LightText` (révélé par la lumière). |
| **Texte éclairé** (signature, direction A) | `LightText` · `.lt` | Le titre est à **25 %** d'opacité (`.lt-dim`), puis une **bande de lumière** `.lt-glint` (largeur `--sweep-width` 3.5em, bords adoucis par un masque statique) le traverse : copie `--lueur` des lettres (le reflet sur le chrome, opacité `--sweep-opacity` 0.9) + lueur radiale douce. Derrière le reflet, `.lt-lit` (100 %) est révélée par `.lt-mask` (`xPercent` opposés, même boîte, débord `--lt-bleed` 0.3em). Le reflet est de la lumière, pas du texte. État CSS par défaut = éclairé. |
| **Lampe** (direction A) | `Lamp` · `.lamp` | Vraie lumière : halo `--lueur` (cœur net, bord doux) d'opacité `--lamp-opacity` (0.12), rayon `--lamp-radius` (420px), + texture « carrosserie » (fines lignes `--lueur` 30 %, pas de 4 px) révélée seulement sous la lampe (masque radial **statique**, opacité `--texture-opacity` 0.5), lignes recalées sur la page en transform. Groupe en `mix-blend-mode: lighten` : seul ce qui est plus sombre que la lumière s'éclaire, jamais le texte. Desktop à pointeur fin seulement. **Au-dessus du hero** (pin + sortie, classe `.is-hero`) : projecteur plus doux, halo à `--lamp-hero-opacity` (0.06), **sans texture**, suivi plus lent (0,9 s). C'est le seul projecteur : jamais de seconde lumière sous le curseur. z-index 40. |
| **LED de transition** | `.lines-led` | `.led` pleine largeur en haut de Lignes (bord à bord) : s'allume de gauche à droite à la sortie du hero, avant le balayage du titre. Lueur rouge autour du filet = dégradé vertical **pré-rendu** (`::before`, 5rem de haut, pas de filter) qui suit son `scaleX`, intensité `--led-glow` (0.7). |
| **Parallaxe du hero** | `.hero-px-media` · `.hero-px-copy` | **Hero uniquement.** Les plans glissent vers le pointeur : vidéo 10 px max (agrandie à `scale` 1.04, aucun bord visible), texte 5 px max. `quickTo` 0,8 s `power3.out`, sur des enveloppes (jamais sur `.hero-layers` / `.hero-copy`, déjà déplacés par la sortie). Retour au centre quand le pointeur quitte la fenêtre. |
| **Vignette** | `.hero-vignette` | Bords du hero assombris : dégradé radial **statique** vers `--vignette` (nuit 70 %). Au-dessus de la vidéo, sous le texte. |
| **Grain** | `.hero-grain` | Tuile de bruit 128 px (`public/grain.png`, 11 Ko, signé clair/sombre : le noir reste noir) à `--grain-opacity` (0.05), déplacée par 8 paliers en `transform` (`steps`) sur `--dur-grain` 0,8 s. Ni filter, ni canvas. Au-dessus du texte. |
| **Progression** | `.scroll-progress` | LED rouge 1 px fixée en haut de l'écran, `scaleX` = progression du scroll de la page (`quickSetter`, suit Lenis). z-index 60. |
| **Cue** | `.hero-cue-led` | La LED du bas de caisse : filet rouge 1 px (10rem max) centré en bas du hero, qui respire en opacité 0,5 ↔ 1. Aucun texte. |
| **Label** | `.label` | `--fs-label`, capitales, `--tracking-label`, acier. La graisse reste à l'élément. |
| **Lien de nav** | `.label.nav-link` | Label + souligné LED rouge au survol (`scaleX`), texte acier → chrome. Graisse 400 partout (header, menu mobile, footer). |
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
- **Ordre de la page** : Loader → Header → Hero (pin 2,75 écrans) → Lignes → Gamme → Contact → Footer (+ lampe fixe, desktop).

## 6. Depth & Elevation

Pas d'ombres, pas de flou. La profondeur vient de :
1. la **lumière** (le showroom s'allume, voiles nuit localisés, vignette du hero, titres balayés par un phare, lampe sous le curseur) ;
2. la **parallaxe du hero** (vidéo et texte sur deux plans, hero uniquement) ;
3. l'**opacité** (voile noir de sortie du hero, carte recouverte assombrie) ;
4. le **recouvrement** (cartes sticky, sections qui montent sur le hero).

z-index : loader 100, progression 60, header 50, lampe 40, le reste en `-1` local sous `isolation: isolate`.

## 7. Motion

- **Easings** : `--ease-out` `cubic-bezier(0.22, 1, 0.36, 1)` (par défaut) · `--ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)` (boucles).
- **Durées** : `--dur-fast` 0.3s (couleurs) · `--dur-base` 0.4s (soulignés, flèches, labels, remplissage bouton) · `--dur-slow` 0.6s (fondus, header, ligne de champ). Chorégraphies : `--dur-loader`, `--delay-loader-out`, `--dur-cue-in`, `--delay-cue-in`, `--dur-cue-loop`.
- **Règle absolue** : n'animer que `transform` et `opacity`. Pas de `filter`, pas de `clip-path`, pas de `backdrop-filter`, pas d'animation de `mask`.
- **La lumière est l'interface (direction A)** :
  - *Révélation des titres* (`lib/light.js`, `lightReveal`) : titre 0 → 25 % (0,35 s), puis la bande de lumière traverse en 1,2 s (`power2.inOut`) en révélant le titre à 100 %, elle apparaît et s'éteint en fondu, puis la LED du titre s'allume. **Une seule fois par titre.** Sections : au scroll (`useTitleReveal`, `once`). Hero : au premier passage de chaque bloc ; ensuite fondu déjà éclairé ; sortie = la lumière s'éteint (opacité).
  - *Showroom (0-10 % du pin)* : pendant que `intro-lit` s'allume, une bande `--lueur` inclinée (`.hero-sweep`, 45vw, opacité `--sweep-opacity`) traverse l'écran une fois, **scrubée** (`xPercent` −100 → 223). Pas de mode de fusion (le calque est au-dessus de la vidéo).
  - *Transition hero → Lignes* : la LED pleine largeur s'allume (1,2 s) puis le titre est balayé. Sa lueur rouge (pré-rendue) s'allume avec elle.
  - *Lampe* : suit le pointeur en `transform` (`quickTo` 0,6 s ; 0,9 s au-dessus du hero), apparaît / s'éteint en opacité (0,6 s).
- **Effets « caméra » du hero** (parallaxe, vignette, grain) + progression : desktop à pointeur fin seulement (`(hover: hover) and (pointer: fine)`, ≥ 768 px), jamais en tactile ni en mouvement réduit. **En pause hors champ** : écoute du pointeur, `will-change` et animation du grain ne tournent que lorsque le hero est à l'écran (`.is-onscreen`).
  - *Cue* : respiration d'opacité sur `--dur-cue-loop`.
- **Scroll** : Lenis + GSAP ScrollTrigger (une seule boucle rAF). La vidéo n'est jamais en lecture : `currentTime` suit le scroll.
- **Mouvement réduit** : version statique du hero (`StaticHero`), pas de Lenis, transitions CSS instantanées, titres directement éclairés, pas de lampe, ni parallaxe, ni grain, ni vignette, ni progression.

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
- La **LED rouge 1 px** sous chaque titre (et la LED pleine largeur entre le hero et Lignes, la LED du cue).
- **La lumière comme interface** : ce qui apparaît est éclairé (phare sur les titres, lampe sous le curseur).
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

**Tropes à éviter — état après l'étape 4c-1** (barrés = remplacés)

| Trope | Où |
|---|---|
| ~~Bandeau défilant en texte contour~~ | **Remplacé (4c-1)** : LED pleine largeur qui s'allume entre le hero et Lignes |
| Chiffre géant en contour qui se remplit | `Footer.jsx` (« 911 ») |
| Cartes sticky empilées qui rétrécissent | `Range.jsx` |
| ~~Boutons magnétiques~~ | **Remplacé (4c-1)** : la lampe sous le curseur (`Lamp.jsx`) |
| Parallaxe au curseur | **Autorisée dans le hero uniquement**, discrète (10 / 5 px, `Hero.jsx`). Nulle part ailleurs. |
| Capitales espacées sur chaque élément secondaire | `.label`, `.btn-outline`, stats (plus le cue) |
| ~~Révélation lettre par lettre flou → net~~ | **Remplacé (4c-1)** : balayage de phare (`LightText`) |
| Compteurs qui montent | `Hero.jsx` (chiffres) — encore présent |
| ~~Indicateur « Scroll » avec trait animé~~ | **Remplacé (4c-1)** : la LED du bas de caisse qui respire |
| ~~Slogans anglais génériques mêlés au français~~ | **Réglé (étape 4b)** : titres courts et factuels en français |
| Grille éditoriale 5/7 texte-à-gauche / images-à-droite | `.grid-5-7` (Lignes, Contact) |
| ~~Combo didone + grotesk light sur noir~~ | **Remplacé** : Archivo Expanded + Inter |

## 10. Agent Prompt Guide

- Avant tout changement visuel, lire ce fichier puis `src/index.css` (`:root`).
- Un nouveau composant réutilise `.section`, `.section-title` + `.led`, `.label`, `.btn-outline` avant de créer du CSS.
- Toute nouvelle valeur récurrente devient un token dans `:root`, documenté ici.
- Réglages de la lumière (`--lamp-opacity`, `--lamp-hero-opacity`, `--grain-opacity`, `--lamp-radius`, `--texture-opacity`, `--sweep-opacity`, `--sweep-width`, `--led-glow`) : les ajuster à l'œil avec `?tune` (panneau `src/tune/`, chargé à la demande), puis coller le bloc copié dans `:root`.
- Vérifier 1440 / 375 / 320 et le FPS ; comparer des captures avant/après pour tout refactor censé être invisible.
