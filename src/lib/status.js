// État d'envoi d'une note : logique pure, facile à tester.
//
// En base, une note a deux statuts : 'draft' (pas encore partie) et 'sent' (le comptable l'a reçue).
// Comme l'envoi est automatique à l'enregistrement, un 'draft' récent signifie « envoi en cours ».
// Au-delà de la fenêtre ci-dessous, on considère que l'envoi a échoué : la note est « non envoyée ».
export const SENDING_WINDOW_MS = 2 * 60 * 1000

// Retourne : 'sent' | 'sending' | 'unsent' | 'plain' (pas de statut : starter, avant la base de données)
export function sendState(receipt, now = Date.now()) {
  if (receipt.status === 'sent') return 'sent'
  if (receipt.status !== 'draft') return 'plain'
  const age = now - new Date(receipt.created_at).getTime()
  return age < SENDING_WINDOW_MS ? 'sending' : 'unsent'
}
