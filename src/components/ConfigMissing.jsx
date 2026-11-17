import Logo from './Logo.jsx'

// Affiché à la place d'une page blanche quand les variables d'environnement Supabase manquent.
export default function ConfigMissing({ names }) {
  return (
    <main className="login-card" style={{ margin: '0 auto', minHeight: '100dvh', display: 'grid', alignContent: 'center' }}>
      <Logo />
      <h2 style={{ marginTop: 24 }}>Configuration manquante</h2>
      <p className="sub">L’application ne peut pas se connecter à Supabase.</p>
      <p className="alert" role="alert">
        Variable{names.length > 1 ? 's' : ''} manquante{names.length > 1 ? 's' : ''} : <b>{names.join(', ')}</b>
      </p>
      <p className="admin-note">
        <span>
          En local, renseigne-les dans le fichier .env (voir .env.example) puis relance « npm run dev ». Sur Vercel, ajoute-les dans les variables
          d’environnement du projet puis redéploie.
        </span>
      </p>
    </main>
  )
}
