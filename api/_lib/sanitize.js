// Validation et nettoyage de la réponse de l'IA. Logique pure, sans réseau : facile à tester.
// On ne fait jamais confiance à l'IA : tout ce qui n'est pas valide est retiré (null) et signalé dans `warnings`.

export const CATEGORY_NAMES = ['Restaurant', 'Transport', 'Carburant', 'Fournitures', 'Hébergement', 'Autre']

const MAX_AMOUNT = 100000
const TOLERANCE = 0.02 // écart d'arrondi accepté entre HT + TVA et TTC (en euros)

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

// Extrait l'objet JSON d'une réponse texte (l'IA ajoute parfois des ```json … ```).
export function parseAiJson(text) {
  if (typeof text !== 'string') return null
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    const value = JSON.parse(cleaned)
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end <= start) return null
    try {
      const value = JSON.parse(cleaned.slice(start, end + 1))
      return value && typeof value === 'object' && !Array.isArray(value) ? value : null
    } catch {
      return null
    }
  }
}

// "12,50", "12.50 €", 12.5 → 12.5 ; autre chose → null
function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[€\s ]/g, '').replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null
  return Number(cleaned)
}

// Date réelle au format AAAA-MM-JJ (refuse le 2026-02-31) ; accepte aussi JJ/MM/AAAA.
function toRealDate(value) {
  if (typeof value !== 'string') return null
  let iso = value.trim()
  const fr = iso.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (fr) iso = `${fr[3]}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  const real = date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d
  return real && y >= 2000 ? iso : null
}

function amount(raw, label, warnings) {
  if (raw === null || raw === undefined || raw === '') return null
  const n = toNumber(raw)
  if (n === null) {
    warnings.push(`Montant ${label} illisible : à saisir à la main.`)
    return null
  }
  if (n <= 0 || n > MAX_AMOUNT) {
    warnings.push(`Montant ${label} incohérent (${n}) : ignoré.`)
    return null
  }
  return round2(n)
}

// Retourne { data, warnings } où data a toujours la même forme, valeurs invalides à null.
export function sanitizeExtraction(raw, today = new Date()) {
  const warnings = []
  const input = raw && typeof raw === 'object' ? raw : {}

  const merchantRaw = typeof input.merchant === 'string' ? input.merchant.replace(/\s+/g, ' ').trim().slice(0, 80) : ''
  const merchant = merchantRaw || null
  if (!merchant) warnings.push('Enseigne non lue.')

  let receipt_date = toRealDate(input.receipt_date)
  if (input.receipt_date && !receipt_date) warnings.push('Date illisible ou impossible : à vérifier.')
  if (!input.receipt_date) warnings.push('Date non lue.')
  if (receipt_date && receipt_date > today.toISOString().slice(0, 10)) {
    warnings.push(`La date lue (${receipt_date}) est dans le futur : à vérifier.`)
    receipt_date = null
  }

  let category = null
  if (input.category !== null && input.category !== undefined) {
    const found = CATEGORY_NAMES.find((c) => c.toLowerCase() === String(input.category).trim().toLowerCase())
    if (found) category = found
    else warnings.push(`Catégorie « ${String(input.category).slice(0, 30)} » inconnue : « Autre » proposée.`)
  }
  if (!category) category = 'Autre'

  let amount_ht = amount(input.amount_ht, 'HT', warnings)
  let amount_vat = amount(input.amount_vat, 'TVA', warnings)
  let amount_ttc = amount(input.amount_ttc, 'TTC', warnings)
  if (amount_ttc === null) warnings.push('Montant TTC non lu.')

  // Cohérence des montants.
  if (amount_ht !== null && amount_ttc !== null && amount_ht > amount_ttc + TOLERANCE) {
    warnings.push('Le HT est supérieur au TTC : montants à vérifier.')
    amount_ht = null
    amount_vat = null
  } else if (amount_ht !== null && amount_vat !== null && amount_ttc !== null) {
    if (Math.abs(amount_ht + amount_vat - amount_ttc) > TOLERANCE) {
      warnings.push('HT + TVA ne donne pas le TTC : montants à vérifier.')
    }
  }
  if (amount_vat !== null && amount_ttc !== null && amount_vat >= amount_ttc) {
    warnings.push('La TVA est supérieure ou égale au TTC : à vérifier.')
  }

  return {
    data: { merchant, receipt_date, amount_ht, amount_vat, amount_ttc, category },
    warnings,
  }
}
