import { useEffect, useRef, useState } from 'react'
import { formatEuro } from '../lib/amounts.js'
import { formatDateTime, formatDayMonth } from '../lib/format.js'
import Icon from './Icons.jsx'

// Fenêtre qui affiche le justificatif d'une note, sur la même page (au lieu d'un nouvel onglet).
// Se ferme avec la croix, la touche Échap ou un clic en dehors.
export default function ReceiptViewer({ receipt, onClose }) {
  const closeRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden' // la page derrière ne défile pas
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus?.() // on rend le focus au bouton qui a ouvert la fenêtre
    }
  }, [onClose])

  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="viewer" role="dialog" aria-modal="true" aria-label={`Justificatif ${receipt.merchant}`} onClick={(e) => e.stopPropagation()}>
        <div className="viewer-head">
          <div>
            <h2>{receipt.merchant}</h2>
            <p>
              {formatDayMonth(receipt.receipt_date)} · {receipt.category}
            </p>
          </div>
          <button ref={closeRef} type="button" className="circle sm" onClick={onClose} aria-label="Fermer">
            <Icon name="x" />
          </button>
        </div>

        <div className={`viewer-photo${loaded ? ' loaded' : ''}`}>
          <img src={receipt.image_url} alt={`Justificatif ${receipt.merchant}`} onLoad={() => setLoaded(true)} />
          <i className="cn a" />
          <i className="cn b" />
          <i className="cn c" />
          <i className="cn d" />
        </div>

        <div className="viewer-foot">
          <span className="viewer-amt num">{formatEuro(receipt.amount_ttc)}</span>
          {receipt.user_email && receipt.created_at && (
            <small>
              Scanné par {receipt.user_email} · {formatDateTime(receipt.created_at)}
            </small>
          )}
          <a className="viewer-link" href={receipt.image_url} target="_blank" rel="noreferrer">
            Ouvrir dans un nouvel onglet
          </a>
        </div>
      </div>
    </div>
  )
}
