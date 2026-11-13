// Textes du hero — carte du texte de CLAUDE.md.
export const INTRO = {
  title: 'Born at Night',
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

export const DRIVER = {
  title: 'Built Around the Driver',
  cta: 'Découvrir',
}

// Liens du header → position dans le hero (progression 0-1) + ancre de repli.
export const NAV = [
  { label: 'Design', p: 0.24, id: 'design' },
  { label: 'Performance', p: 0.5, id: 'performance' },
  { label: 'Habitacle', p: 0.86, id: 'habitacle' },
]

// Bandeau défilant (après le hero)
export const MARQUEE = '911 GT3 · CONCEPT · BORN AT NIGHT · '

// Section design (après le bandeau). Ton concept : intentions, aucune donnée réelle.
export const LINES = {
  title: 'Every Line Has a Purpose',
  body: [
    "Dans ce concept, aucun trait n'est là pour décorer. L'aileron, la chute du pavillon, les ouïes derrière la portière : chaque ligne a été imaginée pour guider l'air avant de guider le regard.",
    "C'est une étude de style, pas une fiche technique. Une GT3 rêvée pour la nuit : carrosserie noire, détails rouges, lumière rasante. Ce que vous voyez relève de l'intention, pas de l'homologation.",
  ],
  stills: [
    { src: '/stills/still-aero.webp', w: 1600, h: 900, caption: 'Aerodynamics', alt: 'Profil du concept noir, aileron arrière déployé' },
    { src: '/stills/still-wheel.webp', w: 720, h: 900, caption: 'Wheels', alt: 'Jante noire à branches fines et étrier de frein rouge' },
    { src: '/stills/still-light.webp', w: 720, h: 900, caption: 'Light', alt: 'Feu arrière rouge sous l’aileron, dans la pénombre' },
  ],
}

// Gamme : versions fictives du concept. Jamais de prix réel.
export const RANGE = {
  title: 'The Range',
  intro: 'Trois versions imaginées pour ce concept. Aucune n’existe, aucune n’est à vendre.',
  price: 'Concept',
  cta: 'Configurer',
  cards: [
    {
      name: 'GT3 Night',
      still: '/stills/still-06.webp',
      alt: 'Le concept noir de trois quarts, dans le showroom éclairé de rouge',
      specs: ['Carrosserie noir profond', 'Éclairage de bas de caisse rouge', 'Jantes noir satiné'],
    },
    {
      name: 'GT3 Track',
      still: '/stills/still-07.webp',
      alt: 'Flanc du concept portière ouverte, étrier de frein rouge',
      specs: ['Aileron fixe en carbone', 'Étriers de frein rouges', 'Sièges baquets'],
    },
    {
      name: 'GT3 Touring',
      still: '/stills/still-08.webp',
      alt: 'Habitacle du concept, volant et surpiqûres rouges',
      specs: ['Ligne sans aileron fixe', 'Habitacle cuir et microfibre', 'Éclairage d’ambiance rouge'],
    },
  ],
}
