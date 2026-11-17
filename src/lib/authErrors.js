// Traduit une erreur d'authentification Supabase en message français compréhensible.
export function authErrorMessage(error) {
  const code = error?.code ?? ''
  const message = String(error?.message ?? '').toLowerCase()
  const status = error?.status

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.'
  if (code === 'email_not_confirmed' || message.includes('not confirmed')) return 'Ce compte n’est pas encore activé. Contacte l’administrateur.'
  if (code === 'user_banned' || message.includes('banned')) return 'Ce compte est désactivé. Contacte l’administrateur.'
  if (code === 'over_request_rate_limit' || status === 429 || message.includes('rate limit')) {
    return 'Trop de tentatives. Patiente quelques minutes avant de réessayer.'
  }
  if (error?.name === 'AuthRetryableFetchError' || message.includes('fetch') || message.includes('network') || status === 0) {
    return 'Connexion impossible : vérifie ta connexion internet puis réessaie.'
  }
  if (status >= 500) return 'Le service de connexion est indisponible. Réessaie dans un instant.'
  return 'Connexion impossible. Vérifie tes identifiants puis réessaie.'
}
