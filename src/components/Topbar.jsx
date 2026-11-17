import { displayName, initialsOf } from '../lib/format.js'
import Icon from './Icons.jsx'
import Logo from './Logo.jsx'

// Barre du haut : logo, et (si l'employé est connecté) son nom, ses initiales et le bouton de déconnexion.
export default function Topbar({ user, onSignOut }) {
  const name = user ? displayName(user) : ''

  return (
    <header className="topbar">
      <Logo />
      {user && (
        <div className="who">
          <div className="who-id" title={user.email}>
            <span className="who-name">{name}</span>
            <span className="who-email">{user.email}</span>
          </div>
          <span className="avatar" aria-hidden="true">
            {initialsOf(name)}
          </span>
          <button type="button" className="circle sm" onClick={onSignOut} aria-label={`Se déconnecter (${name})`} title="Se déconnecter">
            <Icon name="logout" />
          </button>
        </div>
      )}
    </header>
  )
}
