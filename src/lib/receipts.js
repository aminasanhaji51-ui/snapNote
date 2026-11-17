import { resizeToBlob } from './image.js'
import { supabase } from './supabase.js'

const BUCKET = 'receipts'
const COLUMNS = 'id, user_email, merchant, receipt_date, amount_ht, amount_vat, amount_ttc, category, image_path, source, status, created_at, sent_at'

// Liste des notes de l'employé connecté (la RLS ne renvoie que les siennes).
export async function fetchReceipts() {
  const { data, error } = await supabase.from('receipts').select(COLUMNS).order('created_at', { ascending: false })
  if (error) throw new Error('Impossible de charger tes notes. Réessaie dans un instant.')
  return data
}

// Enregistre une note : photo dans le bucket (dossier = id de l'employé), puis ligne en base.
// On n'envoie JAMAIS user_id, user_email, created_at ni status : la base les impose.
// `userId` ne sert qu'à construire le dossier de la photo, que les règles du bucket vérifient.
export async function createReceipt({ userId, file, fields }) {
  let image_path = null
  if (file) {
    image_path = `${userId}/${crypto.randomUUID()}.jpg`
    let blob
    try {
      blob = await resizeToBlob(file)
    } catch {
      throw new Error('Photo illisible. Reprends-la puis réessaie.')
    }
    const { error } = await supabase.storage.from(BUCKET).upload(image_path, blob, { contentType: 'image/jpeg' })
    if (error) throw new Error('La photo n’a pas pu être enregistrée. Réessaie.')
  }

  const { data, error } = await supabase
    .from('receipts')
    .insert({ ...fields, image_path })
    .select(COLUMNS)
    .single()
  if (error) {
    if (image_path) await supabase.storage.from(BUCKET).remove([image_path]) // pas de photo orpheline
    throw new Error('La note n’a pas pu être enregistrée. Réessaie.')
  }
  return data
}

// Supprime une note en brouillon (la RLS refuse les autres) puis sa photo.
export async function deleteReceipt(receipt) {
  const { error } = await supabase.from('receipts').delete().eq('id', receipt.id)
  if (error) throw new Error('La note n’a pas pu être supprimée.')
  if (receipt.image_path) await supabase.storage.from(BUCKET).remove([receipt.image_path])
}

// URL signée temporaire (60 s) pour afficher une photo du bucket privé.
export async function signedPhotoUrl(path) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60)
  if (error) throw new Error('Justificatif indisponible.')
  return data.signedUrl
}
