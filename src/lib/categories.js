// Catégories de dépenses : un seul endroit pour le nom, l'icône et la couleur.
// `tone` correspond à une classe CSS (.tone-resto, .tone-trans…) définie dans styles.css.
export const CATEGORIES = [
  { name: 'Restaurant', icon: 'utensils', tone: 'resto' },
  { name: 'Transport', icon: 'train', tone: 'trans' },
  { name: 'Carburant', icon: 'fuel', tone: 'fuel' },
  { name: 'Fournitures', icon: 'box', tone: 'fourn' },
  { name: 'Hébergement', icon: 'bed', tone: 'heb' },
  { name: 'Autre', icon: 'tag', tone: 'other' },
]

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name)

// Retourne la catégorie demandée, ou « Autre » si elle est inconnue.
export function categoryOf(name) {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1]
}
