// Textes du hero — carte du texte de CLAUDE.md.
export const INTRO = {
  title: 'Une GT3 de nuit',
  sub: 'La 911 GT3, réimaginée.',
}

// `to` + `decimals` : valeurs des compteurs (format français, virgule décimale)
export const STATS = [
  { value: '510', to: 510, decimals: 0, unit: 'ch', label: 'Puissance' },
  { value: '318', to: 318, decimals: 0, unit: 'km/h', label: 'Vitesse max.' },
  { value: '3,4', to: 3.4, decimals: 1, unit: 's', label: '0-100 km/h' },
]
export const formatStat = (v, decimals) => v.toFixed(decimals).replace('.', ',')
export const STATS_NOTE = 'Chiffres concept'

// Indicateur de défilement (début du hero)
export const CUE = 'Défiler'

export const DRIVER = {
  title: 'Tout part du volant',
  cta: 'Découvrir',
}

/*
 * Sections navigables : UN nom (français) par section, partagé par le header
 * et le footer. `p` = position dans le hero épinglé (progression 0-1),
 * `id` = ancre (repli si le hero scrubé n'existe pas).
 */
const SECTIONS = {
  design: { label: 'Design', id: 'design', p: 0.24 },
  performance: { label: 'Performance', id: 'performance', p: 0.5 },
  habitacle: { label: 'Habitacle', id: 'habitacle', p: 0.86 },
  lignes: { label: 'Lignes', id: 'lignes' },
  gamme: { label: 'Gamme', id: 'gamme' },
  contact: { label: 'Contact', id: 'contact' },
}

// Liens du header
export const NAV = [SECTIONS.design, SECTIONS.performance, SECTIONS.habitacle]
// Bouton du header : même nom que sa destination
export const HEADER_CTA = SECTIONS.lignes

// Bandeau défilant (après le hero)
export const MARQUEE = '911 GT3 · CONCEPT · ÉTUDE DE STYLE · '

// Section design (après le bandeau). Ton concept : intentions, aucune donnée réelle.
export const LINES = {
  title: 'Chaque ligne guide l’air',
  body: [
    "Dans ce concept, aucun trait n'est là pour décorer. L'aileron, la chute du pavillon, les ouïes derrière la portière : chaque ligne a été imaginée pour guider l'air avant de guider le regard.",
    "C'est une étude de style, pas une fiche technique. Une GT3 rêvée pour la nuit : carrosserie noire, détails rouges, lumière rasante. Ce que vous voyez relève de l'intention, pas de l'homologation.",
  ],
  stills: [
    { src: '/stills/still-aero.webp', w: 1600, h: 900, caption: 'Aérodynamique', alt: 'Profil du concept noir, aileron arrière déployé' },
    { src: '/stills/still-wheel.webp', w: 720, h: 900, caption: 'Jantes', alt: 'Jante noire à branches fines et étrier de frein rouge' },
    { src: '/stills/still-light.webp', w: 720, h: 900, caption: 'Lumière', alt: 'Feu arrière rouge sous l’aileron, dans la pénombre' },
  ],
}

// Gamme : versions fictives du concept. Jamais de prix réel.
export const RANGE = {
  title: 'Trois versions imaginées',
  intro: 'Trois versions imaginées pour ce concept. Aucune n’existe, aucune n’est à vendre.',
  price: 'Concept',
  cta: 'Configurer',
  cards: [
    {
      name: 'GT3 Nuit',
      still: '/stills/still-06.webp',
      alt: 'Le concept noir de trois quarts, dans le showroom éclairé de rouge',
      specs: ['Carrosserie noir profond', 'Éclairage de bas de caisse rouge', 'Jantes noir satiné'],
    },
    {
      name: 'GT3 Piste',
      still: '/stills/still-07.webp',
      alt: 'Flanc du concept portière ouverte, étrier de frein rouge',
      specs: ['Aileron fixe en carbone', 'Étriers de frein rouges', 'Sièges baquets'],
    },
    {
      name: 'GT3 Route',
      still: '/stills/still-08.webp',
      alt: 'Habitacle du concept, volant et surpiqûres rouges',
      specs: ['Ligne sans aileron fixe', 'Habitacle cuir et microfibre', 'Éclairage d’ambiance rouge'],
    },
  ],
}

// Contact : formulaire de démo, n'envoie rien.
export const CONTACT = {
  title: 'Formulaire de démo',
  intro: 'Formulaire de démonstration : rien n’est envoyé, rien n’est enregistré.',
  fields: { name: 'Nom', email: 'E-mail', model: 'Model of interest', message: 'Message' },
  submit: 'Send',
  sent: 'Démo : aucun message n’a été envoyé.',
}

// Pied de page : mêmes sections, mêmes noms que le header, dans l'ordre de la page
export const FOOTER_LINKS = [SECTIONS.design, SECTIONS.performance, SECTIONS.lignes, SECTIONS.gamme, SECTIONS.contact]
export const LEGAL = 'Projet concept non officiel, sans lien avec Porsche AG.'
