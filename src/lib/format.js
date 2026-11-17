// Fonctions pures d'affichage (dates, initiales). Faciles à tester.

// Date + heure au format français : 16/11/2026 00:27
export function formatDateTime(iso) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

// "2018-07-28" → "28 juil. 2018"
export function formatDayMonth(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d))
}

// Date du jour → "Novembre 2026"
export function monthLabel(date = new Date()) {
  const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// "camille.martin@entreprise.fr" → "CM"
export function initials(email) {
  const parts = String(email ?? '').split('@')[0].split(/[._-]+/).filter(Boolean)
  const letters = (parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')
  return letters.toUpperCase()
}

// Nom à afficher pour l'employé connecté.
// 1. le nom saisi dans Supabase (Authentication → Users → user metadata : { "full_name": "Camille Martin" })
// 2. sinon, déduit de l'email : "camille.martin@entreprise.fr" → "Camille Martin"
export function displayName(user) {
  const meta = user?.user_metadata ?? {}
  const given = String(meta.full_name ?? meta.name ?? '').trim()
  if (given) return given
  const local = String(user?.email ?? '').split('@')[0]
  const words = local.split(/[._-]+/).filter(Boolean)
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'Mon compte'
}

// "Camille Martin" → "CM" ; "Test" → "T"
export function initialsOf(name) {
  const words = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? '?') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase()
}
