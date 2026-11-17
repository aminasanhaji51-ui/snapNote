import { useEffect, useRef, useState } from 'react'
import Hero from './components/Hero.jsx'
import ReceiptForm from './components/ReceiptForm.jsx'
import ReceiptList from './components/ReceiptList.jsx'
import ConfigMissing from './components/ConfigMissing.jsx'
import Login from './components/Login.jsx'
import Topbar from './components/Topbar.jsx'
import { createReceipt, deleteReceipt, fetchReceipts } from './lib/receipts.js'
import { missingConfig, supabase } from './lib/supabase.js'

// Pas de routeur : l'app bascule selon la session Supabase.
// Configuration absente → message ; pas de session → connexion seule ; session → application.
export default function App() {
  const [session, setSession] = useState(undefined) // undefined = vérification en cours

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabase) return <ConfigMissing names={missingConfig} />
  if (session === undefined) return null // le Splash couvre ce bref instant
  if (!session) return <Login />
  return <Board user={session.user} accessToken={session.access_token} onSignOut={() => supabase.auth.signOut()} />
}

// Les notes viennent de Supabase (table receipts protégée par RLS) ; les photos sont dans le bucket privé.
function Board({ user, accessToken, onSignOut }) {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchReceipts()
      .then((rows) => !cancelled && setReceipts(rows))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])
  const [filter, setFilter] = useState(null) // catégorie sélectionnée dans la carte du total (null = toutes)
  const toggleFilter = (name) => setFilter((current) => (current === name ? null : name))
  const [sheetOpen, setSheetOpen] = useState(false) // mobile : feuille « Nouvelle note »
  const formRef = useRef(null)

  // Ordinateur : « Scanner » ouvre d'abord le panneau (on y choisit la photo ou on saisit à la main).
  // Téléphone : « Scanner » ouvre directement l'appareil photo.
  function handleScan() {
    if (window.matchMedia('(min-width: 900px)').matches) setSheetOpen(true)
    else formRef.current?.pickPhoto()
  }

  // La touche Échap ferme le panneau.
  useEffect(() => {
    if (!sheetOpen) return
    const onKey = (event) => event.key === 'Escape' && setSheetOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen])

  // Lance une Error (message français) si l'enregistrement échoue : le formulaire reste ouvert, rien n'est perdu.
  async function addReceipt({ file, ...fields }) {
    const saved = await createReceipt({ userId: user.id, file, fields })
    setReceipts((current) => [saved, ...current])
    setSheetOpen(false)
  }

  async function removeReceipt(receipt) {
    setError('')
    try {
      await deleteReceipt(receipt)
      setReceipts((current) => current.filter((r) => r.id !== receipt.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <Topbar user={user} onSignOut={onSignOut} />
      <main className="board">
        <div className="col-main">
          <Hero receipts={receipts} onScan={handleScan} activeCategory={filter} onFilter={toggleFilter} />
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
          <ReceiptList
            category={filter}
            onClearFilter={() => setFilter(null)}
            receipts={receipts}
            loading={loading}
            onRemove={removeReceipt}
          />
        </div>
        <ReceiptForm
          ref={formRef}
          accessToken={accessToken}
          open={sheetOpen}
          onFilePicked={() => setSheetOpen(true)}
          onClose={() => setSheetOpen(false)}
          onAdd={addReceipt}
        />
      </main>
      {sheetOpen && <div className="scrim" onClick={() => setSheetOpen(false)} aria-hidden="true" />}
    </>
  )
}
