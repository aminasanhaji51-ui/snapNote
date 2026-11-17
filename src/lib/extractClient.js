import { resizeImage } from './image.js'

// Envoie la photo (réduite) au backend /api/extract. Ne contient aucun secret :
// le backend vérifie la session Supabase (jeton envoyé en en-tête) et détient la clé IA.
// Lance une Error au message français affichable ; l'appelant garde la saisie manuelle.
export async function extractReceipt(file, accessToken) {
  if (!accessToken) throw new Error('Connecte-toi pour utiliser la lecture automatique. Tu peux saisir à la main.')

  let image
  try {
    image = await resizeImage(file)
  } catch {
    throw new Error('Image illisible. Tu peux saisir à la main.')
  }

  let response
  try {
    response = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ image }),
    })
  } catch {
    throw new Error('Réseau indisponible. Tu peux saisir à la main.')
  }

  if (response.status === 401) throw new Error('Session expirée : reconnecte-toi. Tu peux saisir à la main.')
  if (!response.ok) throw new Error('Lecture automatique impossible. Tu peux saisir à la main.')
  return response.json() // { data, warnings }
}
