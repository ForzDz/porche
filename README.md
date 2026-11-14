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
