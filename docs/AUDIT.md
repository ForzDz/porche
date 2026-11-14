# AUDIT — porsche-concept

> Date : 2026-11-14 · Commit audité : `5986b03` (branche `master`)
> Mode lecture seule. Commandes lancées : `ls`, `cat`, `grep`, `du`, `git log/ls-files/status`, `npm ls`, `node -v`, `ffprobe`, `oxlint` (lecture), et `vite build --outDir <scratchpad>` (build écrit **hors** du projet, `dist/` non touché). Seul fichier créé : ce `AUDIT.md`.

---

## 1. VUE D'ENSEMBLE

### Stack réelle (versions installées, `npm ls --depth=0`)
| Rôle | Lib | Version |
|---|---|---|
| UI | react / react-dom | 19.3.1 |
| Bundler | vite | 8.3.7 |
| Plugin | @vitejs/plugin-react | 6.3.0 |
| Animation | gsap (+ ScrollTrigger) | 3.15.1 |
| Smooth scroll | lenis | 1.3.27 |
| Lint | oxlint | 1.93.0 |
| CSS | CSS natif, un fichier `.css` par composant + `src/index.css` (tokens). Pas de Tailwind, pas de préprocesseur, pas de CSS-in-JS |
| Langage | JavaScript (JSX). `@types/react*` installés mais **aucun TypeScript** |

- Point d'entrée : `index.html` → `src/main.jsx` → `src/App.jsx`
- Lancer : `npm install` puis `npm run dev` (Vite, port 5173) · `npm run build` → `dist/` · `npm run preview` · `npm run lint`
- Polices : Google Fonts chargées dans `index.html:12-15` (Bodoni Moda + Hanken Grotesk)

### Node
- Installé : **Node v24.18.0**, npm 11.16.0
- Requis : aucun champ `engines` ni `.nvmrc` dans le projet. Minimum de fait imposé par Vite 8 / oxlint / plugin-react : `^20.19.0 || >=22.12.0` (`node_modules/vite/package.json:179`). → OK.

### Arborescence
```
porsche-concept/
├── CLAUDE.md            consignes agent (DA, carte du texte, interdits)
├── README.md            ⚠ README par défaut du template Vite
├── index.html           shell HTML, fonts, preload intro-dark
├── vite.config.js       config minimale (plugin react)
├── .oxlintrc.json       règles lint (rules-of-hooks, only-export-components)
├── src/
│   ├── main.jsx         montage React (StrictMode)
│   ├── App.jsx          ordre des sections + démarrage Lenis
│   ├── content.js       TOUS les textes / données (source unique, bien)
│   ├── index.css        tokens + reset + .led + .btn-outline + reduced-motion global
│   ├── components/      1 composant = 1 .jsx (+ 1 .css)
│   └── lib/
│       ├── scroll.js    Lenis + GSAP/ScrollTrigger, navigation, verrou de scroll
│       ├── drivers.js   scrub vidéo (desktop) / séquence canvas (mobile)
│       ├── media.js     hook useMediaQuery + MQ_MOBILE / MQ_REDUCED
│       ├── magnetic.js  boutons magnétiques
│       └── ready.js     signal « hero prêt » (pour le Loader)
├── public/              médias servis tels quels (11 Mo)
│   ├── hero.mp4, poster.jpg, intro-dark.jpg, intro-lit.jpg
│   ├── frames/          181 WebP (séquence mobile)
│   ├── stills/          13 WebP (sections Lines / Range / hero statique)
│   ├── favicon.svg, icons.svg, robots.txt
├── dist/                build courant (ignoré par git, à jour avec HEAD)
└── dist-base/           ⚠ ANCIEN build, non suivi par git, non ignoré (10 Mo)
```

---

## 2. CE QUI EST VRAIMENT UTILISÉ

### Sections affichées, dans l'ordre (`src/App.jsx:31-43`)
1. `Loader` — écran de chargement plein écran, verrouille le scroll jusqu'au « hero prêt » (max 6 s) — `src/components/Loader.jsx`
2. `Header` — fixe, se cache en descendant — `src/components/Header.jsx`
3. `Hero` (ou `StaticHero` si `prefers-reduced-motion`) — pin 2,75 écrans, showroom qui s'allume, vidéo scrubée, 3 blocs de texte — `src/components/Hero.jsx`, `StaticHero.jsx`
4. `Marquee` — bandeau « 911 GT3 · CONCEPT · BORN AT NIGHT » en contour — `Marquee.jsx`
5. `Lines` — « Every Line Has a Purpose », texte sticky + 3 images révélées — `Lines.jsx`
6. `Range` — « The Range », 3 cartes sticky empilées (carrousel snap sur mobile) — `Range.jsx`
7. `Contact` — « Get in Touch », formulaire de démo (aucun envoi, conforme) — `Contact.jsx`
8. `Footer` — « 911 » géant qui se remplit au scroll + liens + mention légale — `Footer.jsx`

Tous les composants de `src/components/` sont importés et rendus. `BlurText.jsx` est utilisé par `Hero.jsx` uniquement.

### Librairies animation / 3D / scroll
| Lib | Installée | Importée | Utilisée | Où |
|---|---|---|---|---|
| GSAP core | ✅ | ✅ | ✅ | via `src/lib/scroll.js:3` (ré-exporté), utilisé partout |
| ScrollTrigger | ✅ | ✅ | ✅ | `scroll.js:4` ; triggers dans Hero, Lines, Range, Footer |
| Lenis | ✅ | ✅ | ✅ | `scroll.js:1-2`, branché sur `gsap.ticker` (une seule boucle rAF) |
| Scroll scrub vidéo | — | — | ✅ desktop | `lib/drivers.js:8` (`currentTime`, jamais de play) |
| Séquence d'images canvas | — | — | ✅ mobile | `lib/drivers.js:73` (181 WebP) |
| Three.js / R3F / Spline / Framer Motion | ❌ | ❌ | ❌ | absents |

**Aucune lib installée inutilement.** Les dépendances sont exactement celles autorisées par `CLAUDE.md` (React + Vite + GSAP + Lenis). Seul superflu : `@types/react`, `@types/react-dom` (pas de TS).

---

## 3. LE BORDEL (cash)

Verdict général : **le code source est propre**. Le bordel est surtout *autour* du code (builds, assets, restes du template) et dans quelques incohérences fonctionnelles.

### 3.1 Code mort / fichiers inutiles
| Élément | Preuve | Gravité |
|---|---|---|
| `dist-base/` (10 Mo) — ancien build du 11/11, **non suivi, non ignoré** → pollue `git status` et le lint | `git status` : `?? dist-base/` ; absent de `.gitignore:11-12` | Moyenne |
| `public/stills/still-01.webp` → `still-05.webp` (≈300 Ko) — jamais référencés, mais copiés dans chaque build | `grep` : 0 occurrence dans `src/` ; ajoutés au commit `a1d6d6c` | Faible |
| `public/icons.svg` — sprite d'icônes sociales (Bluesky…) du template Vite, jamais utilisé | 0 occurrence ; contient `id="bluesky-icon"` | Faible |
| `public/favicon.svg` — **c'est le logo Vite violet** (`#863bff`), pas une icône du projet | `index.html:5` | Faible (mais visible : onglet hors DA) |
| `README.md` — README par défaut du template Vite | `README.md:1` « # React + Vite » | Faible |
| `@types/react`, `@types/react-dom` — inutiles sans TypeScript | `package.json:18-19` | Négligeable |

Pas de composant mort, pas de CSS orphelin significatif.

### 3.2 Doublons
- `MQ_FINE_POINTER` défini deux fois : `src/components/Hero.jsx:57` et `src/lib/magnetic.js:5` (exporté mais pas réutilisé).
- Règle `prefers-reduced-motion` en double : globale `src/index.css:132-142` + locale redondante `src/components/Contact.css:187-193`.
- Style de grand titre copié-collé (même `font-size: clamp(2.6rem, 5.4vw, 5.75rem)`, `line-height ~1.02`, `letter-spacing -0.01em`) : `Lines.css:17-25`, `Range.css:11-18`, `Contact.css:10-17` (+ variante `Hero.css:164-173`). Devrait être une classe / un token.
- Padding de section `clamp(4rem, 10vh, 6rem) var(--gutter)` répété : `Lines.css:7`, `Range.css:3`, `Contact.css:6`.
- Style des liens nav (uppercase 0.75rem, 0.2em, soulignement rouge) dupliqué : `Header.css:50-77` et `Footer.css:54-81`.
- Grille `5fr / 7fr` dupliquée : `Lines.css:4`, `Contact.css:4`.
- Deux builds en parallèle : `dist/` (à jour) et `dist-base/` (obsolète).
- `ScrollTrigger.refresh()` appelé deux fois au démarrage : `Hero.jsx:287` (fonts) et `Lines.jsx:45-46`. Sans gravité, mais à centraliser.

Pas d'« anciennes versions » de sections laissées en place : `StaticHero.jsx` est **voulu** (fallback reduced-motion), pas un doublon.

### 3.3 Conflits
- **Scroll** : un seul système (Lenis piloté par le ticker GSAP, `scroll.js:16-30`). Pas de ScrollSmoother, pas de `scroll-behavior: smooth` concurrent. Les `position: sticky` (Lines, Range) cohabitent bien avec Lenis (scroll natif). ✅
- **z-index** : sain. Seulement `Header 50` (`Header.css:4`), `Loader 100` (`Loader.css:5`) et des `-1` locaux sous `isolation`. Pas de guerre. ✅
- **Transforms qui se battent** : géré proprement (le bouton magnétique est enveloppé dans `.rise` pour ne pas partager `y`, `Hero.jsx:361-369` ; parallaxe sur `.blk`, sortie sur `.hero-copy`). ✅
- **Bug fonctionnel — bouton « Découvrir » mal ciblé** : `App.jsx:26-29` scrolle vers `#concept`, qui est… le **footer** (`Footer.jsx:46`). Le CTA du hero saute donc Marquee, Lines, Range et Contact. Idem pour « Le projet » du header (`Header.jsx:45-49`). Probablement pas l'intention.
- **Effet magnétique fragile** : `useMagnetic()` (`magnetic.js:21`) fait un `querySelectorAll('[data-magnetic]')` **une seule fois** au montage de `App`. Tout bouton monté plus tard n'est pas pris en compte. Marche aujourd'hui par chance de l'ordre de rendu.
- **Couplage CSS caché** : `.btn-arrow` est défini dans `Hero.css:264-270` mais utilisé dans `Contact.jsx:73`. Ça marche uniquement parce que `Hero.css` est toujours chargé.
- **Incohérence nav FR/EN** : header « Design / Performance / Habitacle / Le projet » (`content.js:22-26`, `Header.jsx:67`) vs footer « Design / Performance / Range / Gallery / Contact » (`content.js:83-89`). « Gallery » pointe vers la section « Every Line Has a Purpose » (`#lignes`).
- **Dérive doc ↔ code** : `CLAUDE.md` ne décrit que le hero ; Marquee, Lines, Range, Contact, Footer, Loader n'y figurent pas. La fenêtre « Built Around the Driver » démarre à 76 % (`Hero.jsx:54`) et non 65 % comme la carte de `CLAUDE.md` (choix commenté, mais la doc n'est pas à jour).
- **Commentaires périmés** : `Range.css:134` (« empilement normal » alors que c'est un carrousel, l. 135-140) ; `Loader.jsx:9` (« métadonnées de hero.mp4 », faux sur mobile).

### 3.4 Erreurs build / lint
- `npx oxlint src` → **0 erreur, 0 warning**.
- `npm run lint` (= `oxlint` sur tout le projet) → **1 333 warnings, tous dans `dist-base/assets/index-CpuD2EoN.js`** (code minifié). Pur bruit causé par `dist-base/` + absence d'`ignorePatterns` dans `.oxlintrc.json`.
- `vite build` → **OK** en 1,1 s, 47 modules. JS 379,7 Ko (126 Ko gzip), CSS 19,2 Ko (4,8 Ko gzip). Hashes identiques à `dist/` → `dist/` est à jour.
- Aucun `console.*` dans `src/`.
- Warnings console probables (non vérifiés en navigateur) :
  - En dev, `StrictMode` double les effets : Lenis/Loader sont protégés, rien de cassant attendu.
  - Le Loader peut atteindre son garde-fou de 6 s sur réseau lent (`hero.mp4` 5,4 Mo en `preload="auto"`).
  - Aucune erreur 404 attendue : tous les assets référencés existent.

### 3.5 Assets lourds
| Fichier | Poids | Remarque |
|---|---|---|
| `public/hero.mp4` | **5,4 Mo** | H.264 1280×720, 24 i/s, 361 images, 15,04 s, GOP 8 (clé toutes les 0,33 s ✅), sans audio ✅, ~2,9 Mbit/s → réencodable plus léger |
| `public/frames/` (181 fichiers) | 3,7 Mo au total | ~20 Ko/frame, **720×406** seulement → floues sur mobile retina (assumé dans `drivers.js:108-110`) |
| `public/intro-lit.jpg` | 256 Ko | 1672×941, JPEG (pas WebP/AVIF) |
| `public/intro-dark.jpg` | 168 Ko | idem |

Seul fichier > 500 Ko : `hero.mp4`. Poids total `public/` : **≈ 11 Mo** (desktop charge ~6 Mo : vidéo + intro + poster ; mobile ~4,3 Mo : frames + intro). `node_modules/` : 72 Mo.

---

## 4. DESIGN ACTUEL

### Tokens réellement définis — `src/index.css:2-20`
| Token | Valeur |
|---|---|
| `--nuit` | `#0a0a0b` (fond) |
| `--carbone` | `#16171a` (cartes, bordures) |
| `--acier` | `#8a8f98` (texte secondaire) |
| `--chrome` | `#e8e8ea` (texte principal) |
| `--rouge` | `#e10600` (accent / LED) |
| `--font-display` | Bodoni Moda (serif didone) |
| `--font-text` | Hanken Grotesk 300/400/500 |
| `--gutter` | `clamp(1rem, 4.5vw, 4.5rem)` |
| `--header-h` | `clamp(3.5rem, 6vw, 4.5rem)` |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--scrim`, `--scrim-soft` | `--nuit` à 78 % / 45 % |

- **Couleurs** : discipline exemplaire. Aucune couleur hexa/rgba en dur dans `src/` hors `:root` (seule exception inévitable : `index.html:7` `theme-color`). Les variantes passent par `color-mix()` sur les tokens.
- **Rayons** : tout est à `0` (`index.css:93`, `Contact.css:52`), sauf le point de statut `50%` (`Contact.css:173`). Choix cohérent (angles vifs).
- **Typo** : tailles **en dur partout**, ~25 `clamp()` différents répartis dans 8 fichiers CSS (ex. titres `Lines.css:21`, `Range.css:15`, `Contact.css:14`, `Hero.css:168`, `Range.css:88`, `Footer.css:15`, `Marquee.css:25`). Pas d'échelle typographique.
- **Espacements** : en dur partout (`clamp(…vh…)`, `rem`), aucune échelle. Seuls `--gutter` et `--header-h` sont tokenisés.
- **Durées / easings** : `--ease-out` tokenisé, mais durées en dur (0.3 / 0.4 / 0.45 / 0.5 / 0.55 / 0.6 s) dans chaque CSS.
- **Labels** : le motif « uppercase 0.6875–0.75rem, letter-spacing 0.2em, couleur acier » est recopié ~8 fois.

**Système** : à moitié. Couleurs + polices = vrai système. Typo, espacements, durées = valeurs en dur. Pas de Tailwind, pas de fichier de design central hors `:root`.

### Ce qui fait « générique / IA »
Soyons honnêtes : chaque brique est un trope Awwwards 2023-2025 reconnaissable.
1. **Serif didone + grotesk light sur fond noir** : le combo « luxe par défaut » que tous les générateurs sortent.
2. **Labels en capitales espacées 0,2 em** sur chaque élément secondaire (nav, stats, footer, cue).
3. **Marquee en texte contour** (`Marquee.jsx`) : vu sur des milliers de templates.
4. **Chiffre géant en contour qui se remplit** dans le footer (`Footer.jsx`).
5. **Cartes sticky empilées qui rétrécissent** (`Range.jsx`).
6. **Boutons magnétiques** + **parallaxe curseur** + **compteurs qui montent** + **révélation lettre par lettre floue→nette**.
7. **Indicateur « Scroll » avec trait animé** (`Hero.css:273-321`).
8. Titres en anglais génériques façon slogan (« Born at Night », « Every Line Has a Purpose », « Get in Touch », « The Range ») mélangés à du corps en français.
9. Grille éditoriale 5/7 texte-à-gauche/images-à-droite (`Lines.css:4`).

Ce qui est **à soi** et mérite d'être gardé : la LED rouge 1 px comme signature, la palette « Nuit & Chrome » sobre, l'idée narrative caméra → portière → volant, la règle « le texte se pose sur le noir, jamais sur la voiture ».

---

## 5. CONFIG AGENT EXISTANTE

| Élément | Présent | Contenu |
|---|---|---|
| `CLAUDE.md` (racine) | ✅ | Objectif, stack imposée, médias, DA « Nuit & Chrome » (5 tokens), carte du texte du hero, interdits (pas de vraie photo, pas de prix réel, formulaire inerte, pas de backdrop-filter, transform/opacity only), méthode (3 lignes d'approche, 1 prompt = 1 changement, commit, tests 1440/375/320 + FPS). **Ne couvre que le hero.** |
| `DESIGN.md` | ❌ | — |
| `.claude/` (projet) | ❌ | — |
| `.mcp.json` | ❌ | — |
| `.nvmrc` / `engines` | ❌ | — |
| Skills utilisateur (`~/.claude/skills/`) | ✅ | `60fps-animation`, `accessible-animation`, `frontend-design`, `gsap-core/frameworks/performance/plugins/react/scrolltrigger/timeline/utils`, `scroll-craft`, `three-brain`, `synced/` |
| `~/.claude/settings.json` | ✅ | `model: opus`, notifications push. Aucun hook, aucune permission projet. |
| taste-skill / awesome-design-md / Awwwards MCP / agent-browser | ❌ | Aucun installé (ni skill, ni `npm -g`) |

Outils globaux présents (`npm ls -g`) : claude-code, gemini-cli, codex, @higgsfield/cli, @superdesign/cli, netlify-cli.

---

## 6. COMPATIBILITÉ AVEC LE WORKFLOW CIBLE

Environnement vérifié : Node **24.18.0** ✅ (≥ 22 et ≥ 22.13) · Chrome stable `C:\Program Files\Google\Chrome\Application\chrome.exe` ✅ · cache Playwright `chromium-1248` + `chromium_headless_shell-1248` ✅ · ffmpeg/ffprobe dans le PATH ✅ (**deux installs** : `Desktop\ffmpeg\…` et WinGet `ffmpeg-9.0.2` — à dédoublonner).
*Les exigences des outils ci-dessous sont celles que tu as données ; je n'ai pas vérifié leur doc.*

| Outil | Verdict | Détails |
|---|---|---|
| **taste-skill** | **Compatible avec adaptations** | Node/Chrome OK. Friction : il part d'un *starter HTML*, toi tu as un projet React/Vite. → Ne pas le laisser générer son starter ; l'utiliser pour la **classification** (ici « product ») et ses **règles de goût**, et pointer sa vérif Chrome headless sur `http://localhost:5173` (`npm run dev`) ou `npm run preview`. Pièges : (1) le Loader masque la page jusqu'à 6 s → attendre la disparition de `.loader` ; (2) le contenu dépend du scroll → une capture à `scrollY=0` ne montre que le showroom, il faut capturer à plusieurs progressions (ex. 0,2 / 0,5 / 0,9 du pin `hero`) ; (3) **le Chromium de Playwright ne lit généralement pas l'H.264** → `hero.mp4` reste noir en headless : utiliser le canal Chrome stable (installé) ou la vue mobile (canvas WebP) ; (4) avec `prefers-reduced-motion` émulé, c'est `StaticHero` qui s'affiche. |
| **DESIGN.md (awesome-design-md)** | **Compatible tel quel** | Simple fichier Markdown. À rédiger **à partir des tokens réels** (`src/index.css:2-20`) et à référencer depuis `CLAUDE.md`, sinon deux sources de vérité (la section « Direction artistique » de `CLAUDE.md` ferait doublon). Profiter de l'occasion pour définir l'échelle typo/espacements qui manque. |
| **Awwwards MCP** | **Compatible tel quel** | Outil d'inspiration/référence, indépendant de la structure du projet. Node 24 ✅, ffmpeg ✅, Playwright ✅. Il faut seulement créer `.mcp.json` (absent). Attention à son usage : il risque d'**aggraver** le côté « trope Awwwards » (cf. §4) si on copie au lieu de s'inspirer. |
| **agent-browser (Vercel)** | **Compatible avec adaptations** | Pas installé. Mêmes pièges que taste-skill (Loader, scroll-driven, H.264 en Chromium). Lenis intercepte la molette : préférer des événements wheel ou `window.scrollTo` + attente (le scrub a 0,3 s de lissage). **Redondant** avec Claude in Chrome déjà disponible dans ta session → en choisir un seul pour éviter deux pilotes Chrome. |

**La structure React va-t-elle gêner ?** Non, sauf la philosophie « starter HTML » de taste-skill. Passer en HTML pur ferait perdre l'architecture actuelle (drivers vidéo/canvas, signal ready, fallback reduced-motion) sans gain pour ces outils, qui ont tous besoin d'une URL et rien d'autre. Garde React + Vite.

---

## 7. VERDICT ET PLAN

### Recommandation : **NETTOYER** (pas repartir de zéro)
Le moteur est sain : lint à 0, build OK, un seul système de scroll, tokens couleur respectés, contraintes de `CLAUDE.md` tenues (pas d'autoplay, pas de backdrop-filter, transform/opacity uniquement, formulaire inerte, mention légale). Le « bordel » est périphérique (build fantôme, 6 assets morts, restes du template, 1 bug de cible, doublons CSS) et se règle en une petite session. Le vrai problème est **le design générique**, et ça c'est une refonte visuelle *dans* cette base, pas une raison de jeter le code.

### À garder absolument
- `src/lib/scroll.js` — Lenis sur le ticker GSAP (`prioritize`), verrou, navigation par progression du pin
- `src/lib/drivers.js` — scrub vidéo desktop + séquence canvas mobile à chargement progressif
- `src/lib/ready.js` + `Loader.jsx` — synchronisation chargement / hero
- `src/components/Hero.jsx` — pin, `MEDIA_KEYS` (calage scroll → image), fenêtres de texte, sortie en voile
- `src/components/BlurText.jsx` — flou→net sans animer `filter` (astuce perf réelle)
- `src/components/StaticHero.jsx` — fallback reduced-motion
- `src/content.js` — tous les textes centralisés
- Tokens de `src/index.css:2-20` + signature `.led`
- Assets : `hero.mp4` (GOP 8 correct), `frames/`, `intro-dark/lit.jpg`, `poster.jpg`, `stills/still-06/07/08/aero/wheel/light`, `profile.webp`, `cockpit.webp`
- `Contact.jsx` (formulaire accessible, inerte, labels flottants)

### Plan d'action
| # | Action | Fichiers | Taille |
|---|---|---|---|
| 1 | Hygiène dépôt : supprimer `dist-base/` (ou l'ajouter à `.gitignore`), ajouter `ignorePatterns: ["dist*"]` à `.oxlintrc.json` → `npm run lint` redevient lisible | `dist-base/`, `.gitignore`, `.oxlintrc.json` | Petit |
| 2 | Corriger la cible de « Découvrir » / « Le projet » (actuellement le footer) — décider la vraie destination (`#lignes` ?) | `App.jsx:26-29`, `Header.jsx:45-49`, `Footer.jsx:46` | Petit |
| 3 | Supprimer les assets morts : `still-01…05.webp`, `icons.svg` ; remplacer `favicon.svg` (logo Vite) ; réécrire `README.md` ; ajouter `engines`/`.nvmrc` (Node ≥ 22.13) ; retirer `@types/*` | `public/`, `README.md`, `package.json` | Petit |
| 4 | Mettre `CLAUDE.md` à jour (toutes les sections, fenêtre driver à 76 %) et créer `DESIGN.md` à partir des tokens réels | `CLAUDE.md`, `DESIGN.md` | Moyen |
| 5 | Dédoublonner : `MQ_FINE_POINTER` unique (`media.js`), supprimer `Contact.css:187-193`, déplacer `.btn-arrow` dans `index.css`, classe commune titre de section / label / lien nav, commentaires périmés | `Hero.jsx`, `magnetic.js`, `*.css` | Petit |
| 6 | Tokeniser typo + espacements + durées (échelle) dans `:root`, remplacer les `clamp()` en dur | `src/index.css`, tous les `*.css` | Moyen |
| 7 | Harmoniser la langue et les noms des liens (FR ou EN, « Gallery » vs « Lines ») | `src/content.js` | Petit |
| 8 | Rendre `useMagnetic` robuste (attacher par composant ou observer le DOM) | `lib/magnetic.js` | Petit |
| 9 | Médias : réencoder `hero.mp4` (~1,5 Mbit/s, garder GOP 8), `intro-*.jpg` en WebP/AVIF, frames mobile en plus haute définition si le budget le permet | `public/` | Moyen |
| 10 | Installer l'outillage : `.mcp.json` (Awwwards MCP), un seul pilote navigateur (agent-browser **ou** Claude in Chrome), taste-skill ; script de vérif qui attend le Loader et capture 1440/375/320 à plusieurs progressions du pin, en Chrome stable | `.mcp.json`, `.claude/` | Moyen |
| 11 | Refonte anti-générique : garder palette + LED + narration caméra, remplacer les tropes (marquee contour, 911 géant, cartes sticky, magnétique, capitales espacées partout) par 1-2 gestes signature propres au concept | sections `Marquee`, `Range`, `Footer`, `Lines` + DA | Gros |
