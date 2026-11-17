import { useEffect, useState } from 'react'
import Icon from './Icons.jsx'

// Écran d'intro affiché une seule fois, au premier chargement de la page (pas à la connexion ni à la déconnexion).
let introPlayed = false
const SHOW_MS = 1500 // durée d'affichage
const LEAVE_MS = 450 // durée du fondu de sortie

export default function Splash() {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [phase, setPhase] = useState(introPlayed || reduceMotion ? 'gone' : 'show') // show → leave → gone

  useEffect(() => {
    if (phase === 'gone') return
    introPlayed = true
    const t1 = setTimeout(() => setPhase('leave'), SHOW_MS)
    const t2 = setTimeout(() => setPhase('gone'), SHOW_MS + LEAVE_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [phase === 'gone']) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'gone') return null
  return (
    <div className={`splash${phase === 'leave' ? ' leave' : ''}`} aria-hidden="true">
      <div className="splash-in">
        <span className="splash-mark">
          <i />
          <Icon name="receipt" />
        </span>
        <span className="splash-word">SnapNote</span>
        <b className="splash-bar" />
      </div>
    </div>
  )
}
