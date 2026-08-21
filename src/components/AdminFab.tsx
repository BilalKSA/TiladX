import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isAdmin } from '../lib/admin'
import './AdminFab.css'

// Floating shortcut into /admin, shown only to admins. Mounted once at the app
// root so it follows you across every page, public ones included.
function AdminFab() {
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    let cancelled = false

    async function check(hasSession: boolean) {
      // Skip the RPC entirely when signed out — which is most visitors.
      if (!hasSession) {
        if (!cancelled) setVisible(false)
        return
      }

      try {
        const admin = await isAdmin()
        if (!cancelled) setVisible(admin)
      } catch (err) {
        // Stay hidden, but don't fail silently — a missing is_admin() means
        // the schema hasn't been applied, which is worth seeing in the console
        // rather than mistaking for "this account isn't an admin".
        console.warn('[AdminFab] admin check failed:', err)
        if (!cancelled) setVisible(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => check(Boolean(data.session)))

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      check(Boolean(session))
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  // Pointless while already inside the panel.
  if (!visible || pathname.startsWith('/admin')) return null

  return (
    <Link to="/admin" className="tld-admin-fab" aria-label="لوحة التحكم">
      <span className="tld-admin-fab__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9.1a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03Z" />
        </svg>
      </span>
      <span className="tld-admin-fab__label">لوحة التحكم</span>
    </Link>
  )
}

export default AdminFab
