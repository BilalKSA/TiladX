import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Settings2 } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import './PrefsMenu.css'

// Language and appearance live behind one trigger so the public bar stays down
// to the wordmark and the two auth actions. English is listed but inert — the
// site has no translation layer yet, and hiding the row would leave visitors
// guessing whether one is coming.
function PrefsMenu() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click and on Escape; Escape hands focus back to the
  // trigger so keyboard users don't get dropped at the top of the document.
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="tld-prefs" ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className="tld-prefs__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="اللغة والمظهر"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings2 size={17} strokeWidth={2} aria-hidden="true" />
        <ChevronDown className="tld-prefs__caret" size={14} strokeWidth={2.5} aria-hidden="true" />
      </button>

      {open && (
        <div className="tld-prefs__panel">
          <div role="radiogroup" aria-label="اللغة">
            <p className="tld-prefs__label">اللغة</p>

            <button type="button" role="radio" aria-checked="true" className="tld-prefs__option">
              العربية
              <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            </button>

            <button type="button" role="radio" aria-checked="false" className="tld-prefs__option" disabled>
              English
              <span className="tld-prefs__soon">قريباً</span>
            </button>
          </div>

          <div className="tld-prefs__divider" />

          <div className="tld-prefs__row">
            <span>المظهر</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  )
}

export default PrefsMenu
