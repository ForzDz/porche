# PORSCHE 911 GT3 — Concept website (non officiel)

## Objectif
Site vitrine concept pour un tuto YouTube. Le scroll pilote une vidéo :
la caméra tourne autour de la voiture, longe le profil, la portière
s'ouvre et la caméra entre dans l'habitacle jusqu'au volant.
Projet concept, sans lien avec Porsche AG.

## Stack
React + Vite + GSAP ScrollTrigger + Lenis. Aucune autre lib d'animation.

## Médias (public/)
- hero.mp4 : 15 s, 1280x720, 24 i/s, GOP 8, sans son. JAMAIS d'autoplay
  sur desktop : le scroll pilote currentTime.
- poster.jpg : première image, affichée pendant le chargement.
- intro-dark.jpg → intro-lit.jpg : le showroom s'allume au début.
- frames/f_001.webp à f_181.webp : séquence pour le mobile (canvas).

## Direction artistique — « Nuit & Chrome »
- Palette (tokens CSS, jamais de couleur en dur) :
  --nuit #0A0A0B / --carbone #16171A / --acier #8A8F98
  --chrome #E8E8EA / --rouge #E10600
- Typo : titres serif élégant (style éditorial), corps sans-serif léger.
- Signature : une ligne LED rouge de 1px sous chaque titre.

## Carte du texte (le texte se pose sur le noir, jamais sur la voiture)
| Scroll | Image | Texte |
|---|---|---|
| 0-10 % | Le showroom s'allume | Rien, seulement l'indicateur de scroll |
| 10-35 % | Orbite de l'avant au profil | GAUCHE : « Born at Night » + « La 911 GT3, réimaginée. » |
| 35-65 % | Travelling le long du profil | HAUT GAUCHE : 3 chiffres « 510 ch », « 318 km/h », « 3,4 s 0-100 » + mention « chiffres concept » |
| 65-100 % | La portière s'ouvre, l'habitacle, le volant | CENTRE BAS : « Built Around the Driver » + bouton « Découvrir » |

## Interdits
- Aucune vraie photo Porsche, aucun prix présenté comme réel.
- Formulaire de démo qui n'envoie rien. Pas de WhatsApp, pas de réservation.
- Footer : « Projet concept non officiel, sans lien avec Porsche AG. »
- Jamais de backdrop-filter sur la vidéo. Animer seulement transform et opacity.

## Méthode
- Montre ton approche en 3 lignes avant de coder.
- Un prompt = un changement. Commit après chaque étape qui marche.
- Vérifier 1440 / 375 / 320 px et le FPS après chaque changement.
