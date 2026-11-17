import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { computeVat, formatEuro, parseAmount } from '../lib/amounts.js'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories.js'
import Icon from './Icons.jsx'
import Select from './Select.jsx'

const today = () => new Date().toISOString().slice(0, 10)
const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.name, label: c.name, icon: c.icon, tone: c.tone }))

// Panneau « Nouvelle note » : fixe sur ordinateur, feuille qui remonte du bas sur mobile.
// Étape 1 : saisie manuelle. L'étape 4 ajoutera la lecture automatique par l'IA.
const ReceiptForm = forwardRef(function ReceiptForm({ onAdd, onFilePicked, onClose, open }, ref) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState(today())
  const [ht, setHt] = useState('')
  const [ttc, setTtc] = useState('')
  const [category, setCategory] = useState(CATEGORY_NAMES[0])

  // Le bouton « Scanner » de la page ouvre l'appareil photo via cette méthode.
  useImperativeHandle(ref, () => ({ pickPhoto: () => inputRef.current?.click() }))

  const htValue = parseAmount(ht)
  const ttcValue = parseAmount(ttc)
  const vat = computeVat(htValue, ttcValue)

  function handleFile(event) {
    const picked = event.target.files[0]
    if (!picked) return
    // URL locale de la photo. On ne la libère pas : la note enregistrée s'en sert pour son aperçu.
    setPreview(URL.createObjectURL(picked))
    onFilePicked?.()
  }

  function reset() {
    if (inputRef.current) inputRef.current.value = '' // permet de reprendre la même photo
    setPreview(null)
    setMerchant('')
    setDate(today())
    setHt('')
    setTtc('')
    setCategory(CATEGORY_NAMES[0])
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!merchant.trim() || !date || ttcValue === null) return
    onAdd({
      merchant: merchant.trim(),
      receipt_date: date,
      amount_ht: htValue,
      amount_vat: vat,
      amount_ttc: ttcValue,
      category,
      image_url: preview,
    })
    reset()
  }

  return (
    <form className={`panel${open ? ' open' : ''}`} onSubmit={handleSubmit} aria-label="Nouvelle note">
      <div className="panel-grab" aria-hidden="true" />
      <div className="panel-head">
        <h2>Nouvelle note</h2>
        <button type="button" className="circle sm panel-close" onClick={onClose} aria-label="Fermer">
          <Icon name="x" />
        </button>
      </div>

      {/* capture="environment" ouvre l'appareil photo arrière sur mobile (HTTPS requis). */}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} hidden />

      <div className="vf">
        {preview ? (
          <>
            <img src={preview} alt="Aperçu du justificatif" />
            <button type="button" className="vf-retake" onClick={() => inputRef.current?.click()}>
              Reprendre
            </button>
          </>
        ) : (
          <button type="button" className="vf-empty" onClick={() => inputRef.current?.click()}>
            <Icon name="camera" />
            <span>Photographier le justificatif</span>
            <small>ou choisir une image</small>
          </button>
        )}
        <i className="cn a" />
        <i className="cn b" />
        <i className="cn c" />
        <i className="cn d" />
      </div>

      <div className="fields">
        <label className="field">
          <span>Enseigne</span>
          <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Brasserie du Coin" required />
        </label>

        <div className="two">
          <label className="field">
            <span>Date</span>
            <input className="num" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <div className="field">
            <span id="category-label">Catégorie</span>
            <Select labelId="category-label" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
          </div>
        </div>

        <div className="two">
          <label className="field">
            <span>Montant HT</span>
            <input className="num" inputMode="decimal" value={ht} onChange={(e) => setHt(e.target.value)} placeholder="20,00" />
          </label>
          <label className="field">
            <span>Montant TTC</span>
            <input className="num" inputMode="decimal" value={ttc} onChange={(e) => setTtc(e.target.value)} placeholder="24,00" required />
          </label>
        </div>

        {vat !== null && (
          <div className="sumline">
            <span>TVA calculée</span>
            <b className="num">{formatEuro(vat)}</b>
          </div>
        )}

        <button type="submit" className="btn btn-orange btn-block">
          <Icon name="check" />
          Enregistrer la note
        </button>
      </div>
    </form>
  )
})

export default ReceiptForm
