import { createClient } from '@supabase/supabase-js'

// Seules des variables VITE_* publiques sont lues ici (l'URL du projet et la clé publiable).
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const missingConfig = [
  !url && 'VITE_SUPABASE_URL',
  !key && 'VITE_SUPABASE_PUBLISHABLE_KEY',
].filter(Boolean)

// null si la configuration est incomplète : l'app affiche alors un message au lieu d'une page blanche.
export const supabase = missingConfig.length ? null : createClient(url, key)
