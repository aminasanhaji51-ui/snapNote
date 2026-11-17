import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { computeVat, formatEuro, parseAmount } from '../lib/amounts.js'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories.js'
import { extractReceipt } from '../lib/extractClient.js'
import { toInput } from '../lib/amounts.js'
import Icon from './Icons.jsx'
import Select from './Select.jsx'

const today = () => new Date().toISOString().slice(0, 10)
const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.name, label: c.name, icon: c.icon, tone: c.tone }))

// Panneau « Nouvelle note » : fixe sur ordinateur, feuille qui remonte du bas sur mobile.
// Après la photo, l'IA (via /api/extract) pré-remplit les champs ; ils restent modifiables,
// et si la lecture échoue la saisie manuelle fonctionne comme avant.
// `accessToken` : jeton de la session Supabase (fourni par l'authentification, étape 3).
const ReceiptForm = forwardRef(function ReceiptForm({ onAdd, onFilePicked, onClose, open, accessToken }, ref) {
  const inputRef = useRef(null)
  const requestId = useRef(0) // ignore la réponse d'une lecture devenue obsolète (nouvelle photo, annulation)
  const [preview, setPreview] = useState(null)
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState(today())
  const [ht, setHt] = useState('')
  const [ttc, setTtc] = useState('')
  const [category, setCategory] = useState(CATEGORY_NAMES[0])
  const [phase, setPhase] = useState('idle') // idle | scanning | done | failed
  const [warnings, setWarnings] = useState([])
  const [error, setError] = useState('')
  const [aiFields, setAiFields] = useState([]) // champs lus par l'IA et pas encore corrigés
  const [source, setSource] = useState('manual') // 'ai' si l'IA a rempli la note, sinon 'manual'
  const [file, setFile] = useState(null) // photo choisie, envoyée dans le bucket à l'enregistrement
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Le bouton « Scanner » de la page ouvre l'appareil photo via cette méthode.
  useImperativeHandle(ref, () => ({ pickPhoto: () => inputRef.current?.click() }))

  const htValue = parseAmount(ht)
  const ttcValue = parseAmount(ttc)
  const vat = computeVat(htValue, ttcValue)

  async function handleFile(event) {
    const picked = event.target.files[0]
    if (!picked) return
    // URL locale de la photo. On ne la libère pas : la note enregistrée s'en sert pour son aperçu.
    setPreview(URL.createObjectURL(picked))
    setFile(picked)
    setSaveError('')
    onFilePicked?.()

    const id = ++requestId.current
    setPhase('scanning')
    setError('')
    setWarnings([])
    setAiFields([])
    setSource('manual')
    try {
      const { data, warnings: found } = await extractReceipt(picked, accessToken)
      if (id !== requestId.current) return
      const filled = []
      // On ne remplit que ce que l'IA a lu et validé ; le reste garde sa valeur (saisie à la main possible).
      if (data.merchant) (setMerchant(data.merchant), filled.push('merchant'))
      if (data.receipt_date) (setDate(data.receipt_date), filled.push('date'))
      if (data.amount_ht !== null) (setHt(toInput(data.amount_ht)), filled.push('ht'))
      if (data.amount_ttc !== null) (setTtc(toInput(data.amount_ttc)), filled.push('ttc'))
      if (data.category) (setCategory(data.category), filled.push('category'))
      setWarnings(found ?? [])
      setAiFields(filled)
      setSource(filled.length ? 'ai' : 'manual')
      setPhase('done')
    } catch (err) {
      if (id !== requestId.current) return
      setError(err.message)
      setPhase('failed')
    }
  }

  // Corriger un champ retire son marquage « lu par l'IA ».
  const edit = (name, setter) => (value) => {
    setter(value)
    setAiFields((current) => current.filter((f) => f !== name))
  }
  const read = (name) => (aiFields.includes(name) ? 'read' : '')

  function reset() {
    requestId.current++
    if (inputRef.current) inputRef.current.value = '' // permet de reprendre la même photo
    setPreview(null)
    setFile(null)
    setSaveError('')
    setMerchant('')
    setDate(today())
    setHt('')
    setTtc('')
    setCategory(CATEGORY_NAMES[0])
    setPhase('idle')
    setWarnings([])
    setError('')
    setAiFields([])
    setSource('manual')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (phase === 'scanning' || saving) return
    if (!merchant.trim() || !date || ttcValue === null) return
    setSaving(true)
    setSaveError('')
    try {
      // Aucun user_id ici : la base le remplit (auth.uid()).
      await onAdd({
        merchant: merchant.trim(),
        receipt_date: date,
        amount_ht: htValue,
        amount_vat: vat,
        amount_ttc: ttcValue,
        category,
        source,
        file,
      })
      reset()
    } catch (err) {
      setSaveError(err.message) // le formulaire reste rempli : on peut réessayer
    } finally {
      setSaving(false)
    }
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

      <div className={`vf${phase === 'scanning' ? ' scanning' : ''}${phase === 'done' ? ' done' : ''}`}>
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
        <i className="scangrid" />
        <i className="scanbeam" />
        <i className="cn a" />
        <i className="cn b" />
        <i className="cn c" />
        <i className="cn d" />
      </div>

      {phase === 'scanning' && (
        <p className="ai-note pulse" role="status">
          <i />
          Lecture du justificatif…
        </p>
      )}
      {phase === 'done' && (
        <div className={`ai-note${warnings.length ? ' warn' : ''}`} role="status">
          <i />
          {source === 'ai' ? 'Lu par l’IA : vérifie les champs avant d’enregistrer.' : 'Rien n’a pu être lu : saisis les champs à la main.'}
          {warnings.length > 0 && (
            <ul>
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {phase === 'failed' && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <div className="fields">
        <label className="field">
          <span>Enseigne</span>
          <input
            className={read('merchant')}
            value={merchant}
            onChange={(e) => edit('merchant', setMerchant)(e.target.value)}
            placeholder="Brasserie du Coin"
            required
          />
        </label>

        <div className="two">
          <label className="field">
            <span>Date</span>
            <input
              className={`num ${read('date')}`.trim()}
              type="date"
              value={date}
              onChange={(e) => edit('date', setDate)(e.target.value)}
              required
            />
          </label>
          <div className="field">
            <span id="category-label">Catégorie</span>
            <Select
              labelId="category-label"
              value={category}
              onChange={edit('category', setCategory)}
              options={CATEGORY_OPTIONS}
              className={read('category')}
            />
          </div>
        </div>

        <div className="two">
          <label className="field">
            <span>Montant HT</span>
            <input
              className={`num ${read('ht')}`.trim()}
              inputMode="decimal"
              value={ht}
              onChange={(e) => edit('ht', setHt)(e.target.value)}
              placeholder="20,00"
            />
          </label>
          <label className="field">
            <span>Montant TTC</span>
            <input
              className={`num ${read('ttc')}`.trim()}
              inputMode="decimal"
              value={ttc}
              onChange={(e) => edit('ttc', setTtc)(e.target.value)}
              placeholder="24,00"
              required
            />
          </label>
        </div>

        {vat !== null && (
          <div className="sumline">
            <span>TVA calculée</span>
            <b className="num">{formatEuro(vat)}</b>
          </div>
        )}

        {saveError && (
          <p className="alert" role="alert" style={{ margin: 0 }}>
            {saveError}
          </p>
        )}

        <button type="submit" className="btn btn-orange btn-block" disabled={saving}>
          <Icon name="check" />
          {saving ? 'Enregistrement…' : 'Enregistrer la note'}
        </button>
      </div>
    </form>
  )
})

export default ReceiptForm
