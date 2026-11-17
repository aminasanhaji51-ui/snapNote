import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icons.jsx'

// Menu déroulant au design de l'application (remplace le <select> natif, dont l'apparence dépend du système).
// Accessible : flèches haut/bas, Entrée ou Espace pour choisir, Échap pour fermer.
//
//   <Select value={category} onChange={setCategory} options={[{ value, label, icon?, tone? }]} labelId="cat-label" />
export default function Select({ value, onChange, options, labelId, className = '' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value))
  const selected = options[selectedIndex]

  // Fermer en cliquant ou en touchant ailleurs.
  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [open])

  // Garder l'option active visible quand on navigue au clavier.
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  function openMenu() {
    setActive(selectedIndex)
    setOpen(true)
  }

  function choose(index) {
    onChange(options[index].value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function handleKeyDown(event) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openMenu()
      }
      return
    }
    const last = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((i) => (i >= last ? 0 : i + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((i) => (i <= 0 ? last : i - 1))
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(active)
        break
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
    }
  }

  return (
    <div className={`select${open ? ' open' : ''}`} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`select-btn ${className}`.trim()}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        {selected?.icon && (
          <span className={`ico tone-${selected.tone}`}>
            <Icon name={selected.icon} />
          </span>
        )}
        <span className="select-val">{selected?.label}</span>
        <Icon name="chevron-down" className="chev" />
      </button>

      {open && (
        <ul className="select-menu" id={listId} role="listbox" aria-labelledby={labelId} ref={listRef}>
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`select-opt${index === active ? ' active' : ''}`}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(index)}
            >
              {option.icon && (
                <span className={`ico tone-${option.tone}`}>
                  <Icon name={option.icon} />
                </span>
              )}
              <span className="select-val">{option.label}</span>
              {option.value === value && <Icon name="check" className="tick" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
