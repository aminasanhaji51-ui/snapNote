import { useEffect, useRef, useState } from 'react'

// Fait « compter » un nombre jusqu'à sa nouvelle valeur (ex. le total du mois quand une note s'ajoute).
// Si l'utilisateur a demandé moins de mouvement, la valeur change instantanément.
export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target) // valeur affichée à l'instant : on repart de là si la cible change en cours de route

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || fromRef.current === target) {
      fromRef.current = target
      setValue(target)
      return
    }

    const from = fromRef.current
    const start = performance.now()
    let frame
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // démarre vite, termine en douceur
      const current = from + (target - from) * eased
      fromRef.current = current
      setValue(current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
