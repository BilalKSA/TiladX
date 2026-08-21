import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { isAdmin } from '../lib/admin'

type State = { kind: 'checking' } | { kind: 'allowed' } | { kind: 'denied' } | { kind: 'error'; message: string }

// Convenience guard only — it keeps non-admins from seeing a broken screen.
// The real enforcement is the is_admin() RLS policy on every table, which the
// browser cannot bypass.
function RequireAdmin() {
  const [state, setState] = useState<State>({ kind: 'checking' })

  useEffect(() => {
    isAdmin()
      .then((admin) => setState({ kind: admin ? 'allowed' : 'denied' }))
      .catch((err) => setState({ kind: 'error', message: err?.message ?? String(err) }))
  }, [])

  if (state.kind === 'checking') return null
  if (state.kind === 'allowed') return <Outlet />

  // A failed check is a setup problem, not a permissions one — say so instead
  // of silently redirecting, which looks identical to being denied.
  if (state.kind === 'error') {
    const missingFunction = state.message.includes('is_admin')

    return (
      <div style={{ maxWidth: 560, margin: '15vh auto', padding: 'var(--space-6)', textAlign: 'start' }}>
        <h1 style={{ fontSize: 26, marginBlockEnd: 'var(--space-3)' }}>ما قدرنا نتحقق من صلاحياتك</h1>
        <p style={{ marginBlockEnd: 'var(--space-4)' }}>
          {missingFunction
            ? 'قاعدة البيانات ناقصة الإعداد: الدالة is_admin() غير موجودة. شغّل supabase/schema.sql في SQL Editor أولاً، بعدها supabase/admin-setup.sql.'
            : 'صار خطأ أثناء التحقق من صلاحياتك.'}
        </p>
        <pre
          style={{
            direction: 'ltr',
            textAlign: 'left',
            background: 'var(--surface-tint)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-input)',
            padding: 'var(--space-4)',
            fontSize: 12.5,
            overflowX: 'auto',
            marginBlockEnd: 'var(--space-4)',
          }}
        >
          {state.message}
        </pre>
        <Link to="/home" className="tld-button tld-button--secondary tld-button--md">
          العودة للرئيسية
        </Link>
      </div>
    )
  }

  return <Navigate to="/home" replace />
}

export default RequireAdmin
