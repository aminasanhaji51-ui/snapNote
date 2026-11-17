// Logique pure (sans React) : facile à tester à l'étape 6.

// Arrondi à 2 décimales (évite les 0.1 + 0.2 = 0.30000000000000004).
export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

// Convertit une saisie ("12,50" ou "12.50") en nombre, ou null si invalide.
export function parseAmount(input) {
  if (input === '' || input === null || input === undefined) return null
  const n = Number(String(input).replace(',', '.'))
  return Number.isFinite(n) ? round2(n) : null
}

// TVA = TTC - HT. Retourne null si l'un des deux montants manque.
export function computeVat(ht, ttc) {
  if (ht === null || ttc === null) return null
  return round2(ttc - ht)
}

// Format monétaire français : 1 234,50 €
export function formatEuro(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}

// Clé « 2026-11 » du mois auquel une note appartient.
// Une note compte pour le mois où elle a été ENREGISTRÉE (created_at), pas pour la date imprimée sur le ticket :
// un ticket de mars scanné en novembre fait partie des notes de novembre. Sans created_at (starter), on prend la date du ticket.
function monthKey(receipt) {
  if (receipt.created_at) {
    const d = new Date(receipt.created_at)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  return receipt.receipt_date.slice(0, 7)
}

// Notes enregistrées dans le mois de `today`.
export function receiptsInMonth(receipts, today = new Date()) {
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  return receipts.filter((r) => monthKey(r) === key)
}

// Total TTC des notes du mois.
export function monthTotal(receipts, today = new Date()) {
  return round2(receiptsInMonth(receipts, today).reduce((sum, r) => sum + r.amount_ttc, 0))
}

// Nombre → texte pour un champ de saisie (27.27 → "27,27"), vide si null.
export function toInput(value) {
  return value === null || value === undefined ? '' : String(value).replace('.', ',')
}

