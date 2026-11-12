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
