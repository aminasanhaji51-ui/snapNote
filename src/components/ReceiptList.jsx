import { formatEuro } from '../lib/amounts.js'
import { categoryOf } from '../lib/categories.js'
import { formatDateTime, formatDayMonth } from '../lib/format.js'
import { sendState } from '../lib/status.js'
import { useState } from 'react'
import Icon from './Icons.jsx'
import ReceiptViewer from './ReceiptViewer.jsx'

// Libellé, icône et couleur de tuile pour chaque état d'envoi.
// sent = vert · sending = orange qui respire · unsent = brun (l'envoi a échoué) · plain = gris (pas de statut)
const STATES = {
  sent: { tone: 'sent', label: 'Envoyée', icon: 'check-circle' },
  sending: { tone: 'sending', label: 'Envoi en cours', icon: 'loader', spin: true },
  unsent: { tone: 'draft', label: 'Non envoyée', icon: 'alert' },
}

function ReceiptTile({ receipt: r, onRemove, onView, index }) {
  const category = categoryOf(r.category)
  const state = sendState(r)
  const info = STATES[state]
  // On ne supprime pas une note pendant son envoi, ni une note déjà envoyée.
  const canDelete = state === 'unsent' || state === 'plain'

  return (
    // --i : rang de la tuile, pour les faire apparaître l'une après l'autre.
    <li className={`tx ${info?.tone ?? 'plain'}`} style={{ '--i': Math.min(index, 8) }}>
      <span className={`ico tone-${category.tone}`}>
        <Icon name={category.icon} />
      </span>

      <div className="tx-main">
        <strong>{r.merchant}</strong>
        <small>
          {formatDayMonth(r.receipt_date)} · {r.category}
        </small>
        {/* Traçabilité : qui a scanné, et quand (valeurs imposées par la base à partir de l'étape 3). */}
        {r.user_email && r.created_at && (
          <small className="trace">
            Scanné par {r.user_email} · {formatDateTime(r.created_at)}
            {r.source === 'ai' && ' · lu par l’IA'}
          </small>
        )}
      </div>

      <div className="tx-side">
        <span className="amt num">{formatEuro(r.amount_ttc)}</span>
        {/* key={state} : le libellé est recréé à chaque changement, ce qui rejoue la petite animation d'apparition. */}
        {info && (
          <span className="st" key={state} role="status">
            <Icon name={info.icon} className={info.spin ? 'spin' : ''} />
            {info.label}
          </span>
        )}
      </div>

      <div className="tx-actions">
        {r.image_url && (
          <button type="button" className="tx-btn" onClick={() => onView(r)} aria-label={`Voir le justificatif ${r.merchant}`} title="Voir le justificatif">
            <Icon name="image" />
          </button>
        )}
        {canDelete && (
          <button type="button" className="tx-btn" onClick={() => onRemove(r)} aria-label={`Supprimer ${r.merchant}`} title="Supprimer">
            <Icon name="x" />
          </button>
        )}
      </div>
    </li>
  )
}

export default function ReceiptList({ receipts, loading, onRemove, category, onClearFilter }) {
  const [viewing, setViewing] = useState(null) // note dont on affiche le justificatif
  const visible = category ? receipts.filter((r) => r.category === category) : receipts
  const sorted = [...visible].sort(
    (a, b) => b.receipt_date.localeCompare(a.receipt_date) || String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')),
  )

  return (
    <section aria-label="Dernières notes">
      <div className="sec">
        <h2>Dernières notes</h2>
        {category && (
          <button type="button" className="filter-chip" onClick={onClearFilter} aria-label={`Retirer le filtre ${category}`}>
            {category}
            <Icon name="x" />
          </button>
        )}
        <span className="count">{sorted.length}</span>
      </div>

      {loading ? (
        <ul className="list" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="tx skeleton" />
          ))}
        </ul>
      ) : sorted.length === 0 ? (
        <p className="empty">
          {category ? `Aucune note « ${category} » pour l’instant.` : 'Aucune note pour l’instant. Photographiez un premier justificatif.'}
        </p>
      ) : (
        <ul className="list">
          {sorted.map((r, index) => (
            <ReceiptTile key={r.id} receipt={r} onRemove={onRemove} onView={setViewing} index={index} />
          ))}
        </ul>
      )}
      {viewing && <ReceiptViewer receipt={viewing} onClose={() => setViewing(null)} />}
    </section>
  )
}
