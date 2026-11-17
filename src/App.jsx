import { useEffect, useRef, useState } from 'react'
import Hero from './components/Hero.jsx'
import ReceiptForm from './components/ReceiptForm.jsx'
import ReceiptList from './components/ReceiptList.jsx'
import Topbar from './components/Topbar.jsx'

// Étape 1 : tout vit dans l'état React. Au rechargement de la page, tout disparaît.
// Les étapes suivantes ajouteront la connexion (étape 2), Supabase (étape 3) et l'IA (étape 4).
export default function App() {
  const [receipts, setReceipts] = useState([])
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

  function addReceipt(receipt) {
    setReceipts((current) => [{ ...receipt, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...current])
    setSheetOpen(false)
  }

  function removeReceipt(receipt) {
    setReceipts((current) => current.filter((r) => r.id !== receipt.id))
  }

  return (
    <>
      <Topbar />
      <main className="board">
        <div className="col-main">
          <Hero receipts={receipts} onScan={handleScan} activeCategory={filter} onFilter={toggleFilter} />
          <ReceiptList category={filter} onClearFilter={() => setFilter(null)} receipts={receipts} onRemove={removeReceipt} />
        </div>
        <ReceiptForm
          ref={formRef}
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
