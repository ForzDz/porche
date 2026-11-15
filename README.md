# 911 GT3 — Concept

Site vitrine **concept non officiel** (tuto YouTube), sans lien avec Porsche AG.
Le scroll pilote une vidéo : la caméra tourne autour de la voiture, longe le profil,
la portière s'ouvre et la caméra entre dans l'habitacle jusqu'au volant.

## Stack

- React 19 + Vite 8
- GSAP 3 + ScrollTrigger (scrub, pin)
- Lenis (smooth scroll, branché sur le ticker GSAP)
- CSS natif, tokens dans `src/index.css`
- Lint : oxlint

Node **≥ 22.13** (voir `.nvmrc`).

## Commandes

```bash
npm install       # dépendances
npm run dev       # serveur de dev (http://localhost:5173)
npm run build     # build de production → dist/
npm run preview   # sert le build
npm run lint      # oxlint
```

**Réglage de la lumière** : ouvrir `http://localhost:5173/?tune`. Un panneau (en bas à droite)
règle en direct la lampe, la texture, le balayage des titres et la lueur de la LED ;
« Copier les valeurs » donne un bloc `:root` à coller dans `src/index.css`. Sans `?tune`,
le panneau n'existe pas (code chargé à la demande, `src/tune/`).

## Vérification

Protocole de captures avant/après, pour tout changement censé être invisible
(ou pour mesurer exactement ce qui a changé). Prérequis : **Chrome stable**
installé (pas le Chromium de Playwright : il ne lit pas l'H.264 de `hero.mp4` ;
chemin personnalisé via `CHROME_PATH`) et **ffmpeg** dans le PATH (pour `compare`).

```bash
npm run shots -- --ref HEAD --name avant   # captures d'un commit → .shots/avant/
npm run shots -- --name apres              # captures de l'arbre de travail → .shots/apres/
npm run compare -- .shots/avant .shots/apres
npm run shots:reduced -- --name apres      # idem avec prefers-reduced-motion → .shots/apres-reduced/
npm run fps                                # FPS pendant un scroll molette (ou --ref <commit>)
npm run fps -- --zone sections             # idem après le hero, pointeur en mouvement
npm run compare:html -- .shots/avant .shots/apres --out .shots/compare.html
npm run record -- --name avant             # vidéo de scroll haut → bas → .shots/avant.mp4
```

- `shots` : build + preview, Chrome headless, attend la fin du loader, capture
  **1440 / 375 / 320 × 11 positions** (hero à 0, 5, 20, 50, 90 % du pin ;
  Lignes ×2, Gamme ×2, Contact, Footer). Vérifie aussi que « Découvrir » et le
  bouton du header arrivent sur `#lignes`, la position des liens de nav et la
  console (`report.json`). Options : `--reduced`, `--sizes 1440,375`, `--no-mask`
  (garde vidéo, bandeau et point du cue, pour une critique visuelle).
- Par défaut, la vidéo/séquence, le bandeau et le point du cue sont **masqués**
  (ils dépendent du temps) et le rendu est logiciel et déterministe :
  deux passes sur le même code donnent 33/33 captures identiques au pixel.
- `compare` : par capture, identique au pixel ou SSIM + écart max (0-255), et une
  image « A | B | différence ×6 » par écart. Rapport : `report.md`. Code de sortie 1
  s'il y a une différence.
- `fps` : chiffres utiles pour **comparer** deux versions dans les mêmes conditions,
  pas comme FPS absolu (headless, pas de vrai écran).
- `compare:html` : page avant | après par position (nom lisible, SSIM et image de
  différence si `compare` a tourné avant ; `--video a.mp4,b.mp4` pour les joindre).
- `record` : 1440×900, ~25 s (`--duration`), scroll régulier, pointeur qui se promène
  (`--no-pointer` pour l'enlever), mp4 H.264. Capturé au ralenti ×4 (horloge de la page
  ralentie, voir l'en-tête du script) puis remis en temps réel : ~40 images/s effectives.
  Côte à côte : `ffmpeg -i .shots/avant.mp4 -i .shots/apres.mp4 -filter_complex hstack -c:v libx264 -pix_fmt yuv420p .shots/avant-apres.mp4`.

Les captures vont dans `.shots/` (ignoré par git).

## Structure

| Chemin | Rôle |
|---|---|
| `src/App.jsx` | ordre des sections, démarrage de Lenis |
| `src/content.js` | tous les textes et données |
| `src/components/` | une section = un `.jsx` + un `.css` |
| `src/lib/scroll.js` | Lenis, GSAP/ScrollTrigger, navigation, verrou de scroll |
| `src/lib/drivers.js` | scrub de `hero.mp4` (desktop) / séquence canvas `frames/` (mobile) |
| `src/lib/ready.js` | signal « hero prêt » pour l'écran de chargement |
| `public/` | vidéo, séquence d'images, images fixes |

Desktop : `public/hero.mp4` (jamais en lecture auto, `currentTime` suit le scroll).
Mobile : `public/frames/f_001.webp` → `f_181.webp` dessinées sur un canvas.
`prefers-reduced-motion` : version statique, sans scrub ni pin.

Consignes de travail et direction artistique : voir `CLAUDE.md`.

---

Projet concept non officiel, sans lien avec Porsche AG. Aucun chiffre ni prix réel.
