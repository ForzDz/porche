# DIRECTION — préparation de l'étape 4 (refonte)

> État analysé : commit `7940d0b` (fin de l'étape 2 + outillage). Lecture seule, aucun code.
> Captures : `npm run shots -- --name critique --no-mask` (1440 / 375 / 320 × 11 positions).
> **Le choix de la direction appartient à Yacine.** Ce document ne tranche pas.
>
> **Choix de Yacine (15/11/2026) : direction A, « Le showroom s'allume », plus la seule
> voix honnête de B** (titres et légendes factuels en français, libellés qui disent ce qui
> se passe vraiment). Le reste de B (dossier numéroté, planche comparative, colophon) et
> la direction C ne sont pas retenus.

---

## ⛔ Point bloquant avant toute publication

Les médias contiennent le **blason Porsche et le logo « PORSCHE »**, contraire à `CLAUDE.md`
(« aucune vraie photo Porsche », « sans lien avec Porsche AG ») :

| Média | Où |
|---|---|
| `public/intro-dark.jpg`, `public/intro-lit.jpg` | Blason + mot « PORSCHE » au mur du showroom, juste au-dessus du titre « Born at Night » |
| `public/hero.mp4` | Blason au centre du volant (fin de la vidéo, 85-100 %) ; à vérifier sur toute la durée |
| Dérivés de la vidéo | `public/poster.jpg`, `public/frames/f_*.webp` (séquence mobile), `public/stills/cockpit.webp`, `still-08.webp` (carte « GT3 Touring »), probablement d'autres stills |

À faire : **inpainting qui conserve le mouvement caméra** (mur et volant neutres, même lumière),
puis régénérer `poster.jpg`, `frames/` et `stills/` depuis la vidéo nettoyée, en gardant
1280×720, 24 i/s, GOP 8. Vérification : `npm run shots -- --no-mask` + contrôle image par image
du volant. La direction C (ci-dessous) demande de nouveaux plans de toute façon : les deux
chantiers peuvent être menés ensemble.

---

## Les 3 directions possibles

### A — « Le showroom s'allume » : la lumière est l'interface
- **Concept** : la nuit est totale ; tout ce qui apparaît est *éclairé*. Le geste du début (le showroom s'allume) devient la grammaire de tout le site.
- **Remplace** : flou→net lettre à lettre → balayage de phare qui révèle le titre ; boutons magnétiques et parallaxe → sur desktop, le curseur est une lampe (halo rouge discret) qui éclaire les détails ; cartes empilées → **une seule voiture, trois éclairages** (Night / Track / Touring = trois presets de lumière sur le même plan) ; « 911 » rouge plein → les lumières s'éteignent une à une (fin de page) ; indicateur « Scroll » → la LED du bas de caisse qui pulse.
- **Garde** : LED rouge 1 px (devient la source de lumière), palette Nuit & Chrome, narration caméra intacte.
- **Risque** : sombre = contraste et lisibilité à surveiller ; l'effet lampe ne doit jamais masquer le texte. **Effort : moyen** (surtout CSS/opacity + 3 éclairages de stills).
- **Références** : [Forge Automotive](https://forgeautomotive.co.uk/) (élément « Pointlight Fake 3D » : la lumière suit le pointeur), [Cartier — Le Chœur des Pierres](https://www.cartier.com/en-fr/lechoeurdespierres) (révélation par le médium du sujet : masque gouache).

### B — « Dossier d'étude » : le concept comme document d'atelier
- **Concept** : assumer que c'est une étude de style. Le site devient un dossier technique numéroté (01 → 05) calé sur les arrêts de la caméra, avec légendes factuelles en français.
- **Remplace** : slogans anglais → légendes précises (« L'aileron fixe… », chiffres datés « concept ») ; capitales espacées partout → numéros de chapitre en chasse fixe + texte en casse normale ; compteurs → lecture d'instrument (aiguille de compte-tours, une seule fois) ; cartes sticky → **planche comparative** des 3 versions (même cadrage, détails recadrés côte à côte) ; grille 5/7 → image en médaillon sur sa version floutée plein cadre ; « 911 » géant → colophon (crédits, outils, mention concept) ; bandeau défilant → supprimé.
- **Garde** : LED rouge 1 px (soulignés, repères de chapitre), palette, narration caméra = table des matières du dossier.
- **Risque** : peut devenir froid ou statique ; demande une vraie rigueur typographique. **Effort : moyen** (refonte des sections après le hero, hero quasi intact).
- **Références** : [The Cartier Roadster](https://www.cartier.com/en-us/roadster-universe.html) (index de détails : gros plan + vignette + légende), [Forge Automotive](https://forgeautomotive.co.uk/) (chapitres 01/03, image sur sa version floutée), [STILL / FORM](https://stillform.homes/) (footer en colophon calme).

### C — « Plan-séquence » : un seul film, du showroom au générique
- **Concept** : prolonger la narration caméra à toute la page. Après le volant, la caméra ne s'arrête pas : elle ressort, passe sur la jante, l'aileron, le feu arrière… Plus de « sections », des **plans**.
- **Remplace** : Lignes / Gamme → arrêts de caméra dans la même séquence scrubée (les 3 versions = 3 passages de la caméra autour de la voiture) ; indicateur « Scroll » → timecode de film (00:00 → 00:15) ; texte posé en profondeur, devant/derrière la voiture (sans jamais la couvrir) au lieu du flou lettre à lettre ; « 911 » géant → **générique de fin** (crédits qui défilent dans le noir) ; bandeau → supprimé ; magnétique → supprimé (le film est l'interaction).
- **Garde** : LED rouge 1 px (fil conducteur, timecode), palette, et la narration — qui devient le site entier.
- **Risque** : poids média et FPS (plus de vidéo ou de séquences), cohérence des nouveaux plans générés ; formulaire de contact à replacer (fin de générique ?). **Effort : gros** — mais la vidéo doit de toute façon être retravaillée (logos).
- **Références** : [The Watch — 60fps](https://thewatch.60fps.fr/) (typographie géante en profondeur autour de l'objet, chapitres comptés en minutes), [Forge Automotive](https://forgeautomotive.co.uk/) (« Introduction Scrubbing » : poussée caméra scrubée qui porte le titre).

---

## Annexe 1 — Critique design (Impeccable `critique`)

> ⚠️ **DEGRADED : single-context** (sous-agents non lancés : la session ne lance pas de sous-agents sans demande explicite). Assessment A puis B faits ici, A d'abord.
> Mode de la surface : **Persuade / Experience** (vitrine concept) → heuristiques 7 et 10 en `n/a`.

### Score (heuristiques de Nielsen)

| # | Heuristique | Score | Constat principal |
|---|---|---|---|
| 1 | Visibilité de l'état | 2 | Loader correct, mais aucune notion de progression dans un pin de 2,75 écrans ; le cue « Scroll » disparaît à 5 % |
| 2 | Correspondance avec le monde réel | 2 | FR/EN mélangés (nav FR, titres et formulaire EN : « Name », « Send », « Model of interest ») ; bouton principal du header = « Lignes », un nom de section, pas une action |
| 3 | Contrôle et liberté | 3 | Liens de nav → positions du pin fiables ; header qui revient en remontant ; scroll lissé mais pas piégé |
| 4 | Cohérence et standards | 2 | Liens header 400 / footer 300 ; « Configurer » ouvre un formulaire de contact ; même image dans Lignes et dans Gamme |
| 5 | Prévention des erreurs | 2 | Validation native OK, mais « Configurer » et « Send » promettent ce qu'ils ne font pas (démo) |
| 6 | Reconnaissance plutôt que rappel | 2 | Sur mobile, la nav disparaît : seul « Lignes » reste ; aucun moyen de rejoindre Gamme/Contact sans scroller |
| 7 | Flexibilité | n/a | Vitrine Persuade |
| 8 | Esthétique minimaliste | 3 | Retenue réelle (palette, noir, LED), mais l'empilement de tropes ajoute du bruit après le hero |
| 9 | Récupération d'erreur | 2 | Messages natifs du navigateur ; message de succès en anglais (« Concept site, no message sent. ») |
| 10 | Aide | n/a | Vitrine Persuade |
| **Total** | | **18/32** (56 %) | **Acceptable** — fondation solide, page générique après le hero |

### Verdict de spécificité
- **Évaluation** : le **hero est spécifique** (showroom qui s'allume, caméra qui entre dans l'habitacle : propre au sujet). **Tout ce qui suit est interchangeable** : bandeau contour, grille 5/7, cartes sticky, formulaire à labels flottants, chiffre géant — une marque de montres ou un hôtel pourraient l'utiliser tel quel.
- **Détecteur** (`impeccable detect`) : source `src/` → **0 constat** ; page rendue (`localhost:5173`) → **1 constat** : `p.ft-legal`, approche 0.08em sur du texte courant (mention légale du footer). Aucun faux positif. Le détecteur ne voit pas les tropes de composition : c'est la revue qui les relève.

### Ce qui marche
1. **La narration caméra** : avant → profil → portière → volant, pilotée au scroll, avec texte posé dans les zones sombres. C'est l'idée qui porte tout le site.
2. **La retenue chromatique** : Nuit & Chrome + un seul rouge ; la LED 1 px est une vraie signature, cohérente avec les feux et le bas de caisse de la voiture.
3. **La rigueur technique** : 60 i/s, version mouvement réduit complète, tokens et classes communes.

### Problèmes prioritaires
- **[P0] Logos Porsche dans les médias** — blason au mur et sur le volant. *Pourquoi* : contredit le cadre « non officiel » du projet, bloque la publication. *Fix* : inpainting (voir point bloquant). *Commande* : hors Impeccable (médias).
- **[P1] La narration s'arrête au volant** — après le pic émotionnel (90 %), la page enchaîne un bandeau de texte puis des sections catalogue. *Pourquoi* : règle pic-fin ratée ; la fin (footer rouge plein) n'a aucun lien avec la caméra. *Fix* : faire des sections suivantes des « plans » ou des « chapitres » de la même histoire (directions A, B ou C). *Commande* : `/impeccable shape` puis `layout`.
- **[P1] Texte sur le blason, pas sur le noir** — à 1440, « Born at Night » est à côté du blason ; en mouvement réduit à 375 px, le sous-titre le chevauche. *Pourquoi* : viole la règle d'or de DESIGN.md. *Fix* : réglé par l'inpainting + recadrage des zones de texte. *Commande* : `adapt`.
- **[P1] Promesses de commerce factices** — « Configurer », « Prix : Concept », « Model of interest », « Send ». *Pourquoi* : un visiteur (Riley) clique « Configurer » et tombe sur un formulaire qui n'envoie rien ; perte de confiance. *Fix* : verbes honnêtes (« Voir les détails », « Écrire »), ou assumer la démo dans le libellé. *Commande* : `clarify`.
- **[P2] Mélange de langues et voix générique** — slogans anglais + corps français. *Fix* : une langue, des phrases factuelles propres au concept. *Commande* : `clarify`.

### Personas
- **Jordan (première visite)** : comprend vite le hero, mais le bouton du header « Lignes » ne dit pas ce qu'il fait ; sur mobile, ne trouve ni Gamme ni Contact sans faire défiler tout le site.
- **Riley (stress test)** : « Configurer » → formulaire générique ; envoi → message en anglais ; même photo vue deux fois (Lignes « Aerodynamics » ≈ carte « GT3 Night ») : l'illusion de trois versions tombe.
- **Casey (mobile, distrait)** : 3,7 Mo de séquence d'images avant que le hero soit fluide ; labels des chiffres à 9 px ; le cue « Scroll » est presque invisible sur le sol.

### Observations mineures
- Le « 911 » rouge plein du footer enfreint la règle « le rouge ne remplit jamais une grande surface » (DESIGN.md §2).
- Le titre « Born at Night » coupe sur deux lignes à 1440 (« Born at / Night ») : rythme étrange.
- Le compteur « 3,4 s » est capturé à « 3,1 » à 50 % : les chiffres bougent encore quand on s'arrête.
- Avertissement de préchargement inutile d'`intro-dark.jpg` en mouvement réduit.

### Questions
- Et si la page entière était le film, au lieu d'un film suivi d'un site ?
- Une seule voiture pouvant porter trois éclairages ne raconterait-elle pas mieux « trois versions » que trois cartes ?
- Que dirait ce site s'il n'avait le droit qu'à une seule animation ?

---

## Annexe 2 — Références Awwwards par trope (DESIGN.md §9)

Source : Awwwards MCP (index local + vidéos d'éléments primés regardées image par image).
On analyse **le geste** (ce qui résout le besoin), pas le style à copier.
« vu » = vidéo d'élément examinée ; « fiche » = description/éléments de la fiche seulement.

| Trope | Besoin réel | Référence 1 — geste | Référence 2 — geste |
|---|---|---|---|
| Bandeau défilant contour | Rythmer la sortie du hero, répéter la marque | **Forge** (vu) : le titre se pose *mot à mot pendant la poussée caméra* — le rythme vient du mouvement, pas d'un bandeau | **The Watch** (vu) : mots géants qui passent *en profondeur* autour de l'objet — la typo habite la scène |
| Chiffre géant qui se remplit | Signer la fin de page | **STILL / FORM** (vu, « Editorial Footer ») : l'image se retire en bandeau et laisse un colophon calme | **Cartier Chœur** (vu) : fin de chapitre = aplat de couleur + une phrase |
| Cartes sticky empilées | Présenter 3 versions | **Forge** (vu, « USP ») : un chapitre à la fois, numéroté 01/03, image en médaillon sur sa version floutée | **Cartier Roadster** (vu + fiche « Product Configurator ») : un produit fixe, les détails changent en gros plan à côté |
| Boutons magnétiques + parallaxe | Rendre l'interface vivante | **Forge** (fiche, « Pointlight Fake 3D ») : la *lumière* suit le pointeur — interaction liée au sujet | **The Watch** (vu, « Product Interactions ») : c'est l'objet qui réagit, pas les boutons |
| Capitales espacées partout | Hiérarchie secondaire | **Cartier Chœur** (vu) : légendes en petite serif, casse normale ; hiérarchie par taille et position | **Forge** (vu) : seuls les numéros de chapitre sont en petit ; titres en serif, rien d'autre en capitales |
| Flou→net lettre à lettre + compteurs | Faire apparaître titres et chiffres | **Cartier Chœur** (vu, « Gouaché reveal ») : révélation par le *médium du sujet* (coup de pinceau) → pour une voiture : la lumière d'un phare | **The Watch** (vu) : compteur de chapitre en minutes (05′ 06′), lié au sujet (une montre) |
| Indicateur « Scroll » | Inviter à défiler, situer | **Forge** (vu) : la caméra bouge dès le premier cran, le mouvement est l'invitation | **The Watch** (vu) : le compteur de chapitre sert d'indicateur de progression |
| Slogans anglais génériques | Donner une voix | **Cartier Chœur** (vu) : phrases factuelles (« Five Colombian emeralds determined the structure… ») | **Cartier Roadster** (vu) : un titre = un détail précis (« A trailblazing bracelet ») + sa description |
| Grille 5/7 texte \| images | Mettre texte et images en relation | **Cartier Chœur** (vu) : collage asymétrique, recadrages à plusieurs échelles qui bougent indépendamment | **Forge** (vu) : image sur sa propre version floutée plein cadre, texte à côté |
| Didone + grotesk light | Identité typographique | **The Watch** (vu) : une linéale technique très large, à très grande échelle — typo d'instrument | **STILL / FORM** (vu) : une seule famille, serrée, en casse normale (« Space, considered. ») |

Autres sites trouvés mais non examinés (à regarder avant de s'en servir) :
[Porsche Taycan — CNN](https://advertisementfeature.cnn.com/2020/experience-taycan/) (Honorable Mention 2020),
[Zenith](https://www.zenith-watches.com/), [Heirest](https://heirest.com/), [Emergence Magazine](https://emergencemagazine.org/) (SOTD, éditorial).
Usage : inspiration personnelle uniquement, rien de republié.
