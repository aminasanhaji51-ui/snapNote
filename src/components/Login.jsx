import { useState } from 'react'
import { authErrorMessage } from '../lib/authErrors.js'
import { supabase } from '../lib/supabase.js'
import Icon from './Icons.jsx'
import Logo from './Logo.jsx'

// Page de connexion. Aucune création de compte : les comptes sont créés par l'administrateur.
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (authError) setError(authErrorMessage(authError))
      // En cas de succès, App reçoit la session (onAuthStateChange) et affiche l'application.
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <div className="login-bg" aria-hidden="true" />
      <div className="login-in">
        <section className="login-hero">
          <Logo />
          <div className="login-copy">
            <h1>
              Photographie. <em>Envoyé.</em>
            </h1>
          </div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <h2 id="login-title">Connexion</h2>
          <p className="sub">Utilise le compte créé pour toi par l’administrateur.</p>

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@entreprise.fr"
                required
              />
            </label>

            <label className="field">
              <span>Mot de passe</span>
              <span className="pw">
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={show}
                >
                  <Icon name="eye" />
                </button>
              </span>
            </label>

            {error && (
              <p className="alert" role="alert" style={{ margin: 0 }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-orange btn-block" disabled={busy}>
              {busy ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="admin-note">
            <Icon name="lock" />
            <span>Pas de compte ? Demande-le à l’administrateur : il n’y a pas d’inscription.</span>
          </p>
        </section>
      </div>
    </div>
  )
}
