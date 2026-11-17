// Vérifie la session Supabase de l'appelant : on demande à Supabase Auth si le jeton est valide.
// Retourne { id, email } ou null. Aucune requête n'atteint l'IA sans passer par ici.
export async function getSessionUser(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return null

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !anonKey) throw new Error('Configuration Supabase manquante côté serveur.')

  const response = await fetch(`${url.replace(/\/+$/, '')}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return null
  const user = await response.json()
  return user?.id ? { id: user.id, email: user.email ?? null } : null
}
