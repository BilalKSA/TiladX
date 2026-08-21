import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { signOut } from '../lib/auth'
import { socials } from '../data/social'
import './AppHeader.css'

interface AppHeaderProps {
  /** Headline for the panel — a course title, or the home greeting. */
  title: string
  /** Optional pill above the title (a course tag). */
  tag?: string
  subtitle?: string
}

// The maroon panel doubles as the nav bar across the signed-in app: there's no
// separate top strip. Everything that used to live in one is inside the menu.
function AppHeader({ title, tag, subtitle }: AppHeaderProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/')
  }

  return (
    <header className="tld-app-header halftone">
      <div className="tld-app-header__bar">
        {/* The wordmark always goes home, matching every other page. */}
        <Link to="/home" aria-label="الرئيسية" className="tld-app-header__brand">
          <Logo variant="white" />
        </Link>

        <div className="tld-app-header__menu" ref={menuRef}>
          <button
            type="button"
            className="tld-app-header__trigger"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="القائمة"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span>القائمة</span>
          </button>

          {open && (
            <div className="tld-app-header__panel" role="menu">
              <Link role="menuitem" to="/home" onClick={() => setOpen(false)}>
                الرئيسية
              </Link>
              <Link role="menuitem" to="/home" onClick={() => setOpen(false)}>
                تغيير البرنامج
              </Link>
              <Link role="menuitem" to="/profile" onClick={() => setOpen(false)}>
                الملف الشخصي
              </Link>
              <Link role="menuitem" to="/reset-password" onClick={() => setOpen(false)}>
                تغيير كلمة المرور
              </Link>
              <Link role="menuitem" to="/#contact" onClick={() => setOpen(false)}>
                تواصل معنا
              </Link>

              <div className="tld-app-header__divider" />

              <div className="tld-app-header__socials">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              <div className="tld-app-header__divider" />

              <div className="tld-app-header__theme">
                <span>المظهر</span>
                <ThemeToggle />
              </div>

              <button type="button" className="tld-app-header__signout" onClick={handleSignOut} disabled={signingOut}>
                {signingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="tld-app-header__body">
        {tag && <span className="tld-pill-tag tld-app-header__tag">{tag}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  )
}

export default AppHeader
