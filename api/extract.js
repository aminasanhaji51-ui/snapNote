import { getSessionUser } from './_lib/auth.js'
import { callVisionModel } from './_lib/extract.js'
import { sanitizeExtraction } from './_lib/sanitize.js'

// POST /api/extract  { image: "data:image/jpeg;base64,..." }  +  Authorization: Bearer <jeton de session Supabase>
// → 200 { data, warnings } · 400 image invalide · 401 pas de session · 405 · 502 échec de l'IA
const IMAGE_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/
const MAX_IMAGE_CHARS = 3_000_000 // ≈ 2,2 Mo : l'image est déjà réduite par le navigateur

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Méthode non autorisée.' })
  }

  let user
  try {
    user = await getSessionUser(req)
  } catch (error) {
    console.error('[extract] auth', error.message)
    return res.status(500).json({ error: 'Le serveur est mal configuré.' })
  }
  if (!user) return res.status(401).json({ error: 'Connexion requise.' })

  const image = req.body?.image
  if (typeof image !== 'string' || image.length > MAX_IMAGE_CHARS || !IMAGE_PATTERN.test(image)) {
    return res.status(400).json({ error: 'Image invalide ou trop lourde.' })
  }

  try {
    const raw = await callVisionModel(image)
    return res.status(200).json(sanitizeExtraction(raw))
  } catch (error) {
    console.error('[extract] ia', error.message) // jamais la clé, jamais l'image
    return res.status(502).json({ error: 'La lecture automatique a échoué.' })
  }
}
