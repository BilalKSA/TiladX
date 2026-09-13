import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { ensureRegistered } from '../lib/auth'

function RequireAuth() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)

      // Covers the email-confirmation signup path: signUp() has no session to
      // call register_self with when confirmation is pending, so it runs here
      // instead, on the confirmed user's first real sign-in. register_self is
      // idempotent, so it's a no-op for everyone else.
      if (event === 'SIGNED_IN') {
        ensureRegistered().catch(() => {})
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (session === null) return <Navigate to="/login" replace />

  return <Outlet />
}

export default RequireAuth
