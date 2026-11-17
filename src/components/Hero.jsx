import { formatEuro, monthTotal, receiptsInMonth } from '../lib/amounts.js'
import { categoryOf } from '../lib/categories.js'
import { monthLabel } from '../lib/format.js'
import { useCountUp } from '../lib/useCountUp.js'
import { sendState } from '../lib/status.js'
import Icon from './Icons.jsx'

const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`

// Carte principale : total du mois en grand, catégories du mois, bouton « Scanner ».
export default function Hero({ receipts, onScan, activeCategory, onFilter }) {
  const total = monthTotal(receipts)
  const animatedTotal = useCountUp(total) // le total « compte » jusqu'à sa valeur quand une note s'ajoute
  const thisMonth = receiptsInMonth(receipts)
  const categories = [...new Set(thisMonth.map((r) => r.category))]

  // Les statuts n'existent qu'à partir de l'étape « base de données ».
  const hasStatus = receipts.some((r) => r.status)
  const states = thisMonth.map((r) => sendState(r))
  const sent = states.filter((s) => s === 'sent').length
  const sending = states.filter((s) => s === 'sending').length
  const unsent = states.filter((s) => s === 'unsent').length
  const statusText = [
    plural(sent, 'envoyée', 'envoyées'),
    sending > 0 && `${sending} en cours`,
    unsent > 0 && plural(unsent, 'non envoyée', 'non envoyées'),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="hero-wrap">
      <section className="hero" aria-label="Résumé du mois">
        <p className="hero-label">Total du mois</p>
        <p className="hero-amount num" aria-label={`Total du mois : ${formatEuro(total)}`}>
          <span aria-hidden="true">{formatEuro(animatedTotal)}</span>
        </p>
        <div className="hero-meta">
          <span className="month-tag">{monthLabel()}</span>
          <span>{plural(thisMonth.length, 'note', 'notes')}</span>
        </div>
        <div className="hero-row">
          {/* Un clic sur une catégorie filtre la liste ; un second clic retire le filtre. */}
          <div className={`stack${activeCategory ? ' filtering' : ''}`} role="group" aria-label="Filtrer par catégorie">
            {categories.map((name) => {
              const cat = categoryOf(name)
              const active = activeCategory === name
              return (
                <button
                  key={name}
                  type="button"
                  className={`circle tone-${cat.tone}${active ? ' active' : ''}`}
                  onClick={() => onFilter(name)}
                  aria-pressed={active}
                  aria-label={`Afficher uniquement ${name}`}
                  title={active ? `Retirer le filtre ${name}` : `Afficher uniquement ${name}`}
                >
                  <Icon name={cat.icon} />
                </button>
              )
            })}
          </div>
          {hasStatus && <span className="hero-status">{statusText}</span>}
        </div>
      </section>
      <button type="button" className="strip" onClick={onScan}>
        <Icon name="plus-circle" />
        Scanner un justificatif
      </button>
    </div>
  )
}
