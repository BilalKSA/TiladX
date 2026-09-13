import { supabase } from './supabase'
import { appUrl } from './origins'

const GENERIC_SIGN_IN_ERROR = 'رقم الحساب أو كلمة المرور غير صحيحة، أو الحساب غير مفعّل بعد.'

async function resolveLoginEmail(studentNumber: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('resolve_login_email', { p_student_number: studentNumber })
  if (error) throw error
  return data
}

export async function signInWithStudentId(studentNumber: string, password: string) {
  const email = await resolveLoginEmail(studentNumber)
  if (!email) throw new Error(GENERIC_SIGN_IN_ERROR)

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(GENERIC_SIGN_IN_ERROR)
}

// Individual sign-in: email + password straight through Supabase Auth, with no
// students-table lookup. Note this skips the `activated_at` gate that
// resolve_login_email enforces — anyone holding a working auth.users password
// can sign in here, including an orphaned row (see docs/TECH_STACK.md).
export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(GENERIC_SIGN_IN_ERROR)
}

export async function checkStudentEmail(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_student_email', { p_email: email })
  if (error) throw error
  return data ?? false
}

// Activation is keyed on the roster email — no account number involved.
// The pre-check matters: if we called signUp for an email that isn't on the
// roster, we'd create an auth.users row with nothing to link it to (see the
// orphaned-rows note in docs/TECH_STACK.md).
export async function activateStudent(email: string, password: string) {
  const normalized = email.trim()

  const isValid = await checkStudentEmail(normalized)
  if (!isValid) {
    throw new Error('هذا البريد غير مسجّل في قائمة الطلاب، أو تم تفعيل الحساب مسبقاً.')
  }

  const { error: signUpError } = await supabase.auth.signUp({ email: normalized, password })
  if (signUpError) throw signUpError

  const { error: linkError } = await supabase.rpc('link_student_account_by_email', { p_email: normalized })
  if (linkError) throw linkError
}

// Reset is keyed on email, matching activation and registration. Supabase's
// endpoint returns success for unknown addresses too, so this leaks nothing
// about who has an account — the UI always shows the same message.
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    // Pinned to the app origin, not the current one: the confirm route only
    // exists there once the site and app are split across subdomains.
    redirectTo: appUrl('/reset-password/confirm'),
  })
  if (error) throw error
}

/**
 * Open self-registration. Creates the auth user, then calls register_self to
 * create (or claim) the matching students row.
 *
 * Returns whether a session exists afterwards. With email confirmation ON,
 * signUp returns no session — the caller must then tell the user to confirm,
 * and register_self runs on their first sign-in instead.
 */
export async function registerSelf(
  email: string,
  password: string,
  fullName: string,
): Promise<{ confirmed: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: fullName.trim() } },
  })
  if (error) throw error

  if (!data.session) return { confirmed: false }

  const { error: rpcError } = await supabase.rpc('register_self', { p_full_name: fullName.trim() })
  if (rpcError) throw rpcError

  return { confirmed: true }
}

/**
 * Ensures a students row exists for the signed-in user. Safe to call on every
 * sign-in — register_self is idempotent — and it's what covers the
 * confirmation-required path, where signUp had no session to work with.
 */
export async function ensureRegistered(fullName = 'طالب تلاد'): Promise<void> {
  const { error } = await supabase.rpc('register_self', { p_full_name: fullName })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export interface Profile {
  fullName: string | null
  gender: string | null
  role: string
  accessStatus: string
  studentNumber: string | null
}

/**
 * Renames the signed-in student. The RPC is scoped to auth.uid(), so this can
 * only ever change the caller's own row. Returns the trimmed name the server
 * stored, which may differ from what was typed.
 */
export async function updateMyName(fullName: string): Promise<string> {
  const { data, error } = await supabase.rpc('update_my_name', { p_full_name: fullName })
  if (error) throw error
  return data as string
}

// ------------------------------------------------------------- mentors

// Deterministic, never stored separately — the client can always recompute
// it from the username, matching admin_add_mentor_account() in schema.sql.
function mentorAuthEmail(username: string): string {
  return `${username.trim().toLowerCase()}@mentor.tilad.internal`
}

export async function checkMentorUsername(username: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_mentor_username', { p_username: username })
  if (error) throw error
  return data ?? false
}

/**
 * Single entry point for the mentor login tab: transparently activates on
 * first use (the account was pre-created by an admin with a known default
 * password, not self-registered) or signs in normally afterwards. Both
 * branches collapse to the same generic error — no enumeration of which
 * usernames exist.
 */
export async function signInOrActivateMentor(username: string, password: string) {
  const trimmed = username.trim()
  const notYetActivated = await checkMentorUsername(trimmed)

  if (notYetActivated) {
    const { error: signUpError } = await supabase.auth.signUp({
      email: mentorAuthEmail(trimmed),
      password,
    })
    if (signUpError) throw new Error(GENERIC_SIGN_IN_ERROR)

    const { error: linkError } = await supabase.rpc('link_mentor_account', { p_username: trimmed })
    if (linkError) throw new Error(GENERIC_SIGN_IN_ERROR)
    return
  }

  const { data: email, error } = await supabase.rpc('resolve_mentor_login_email', { p_username: trimmed })
  if (error) throw error
  if (!email) throw new Error(GENERIC_SIGN_IN_ERROR)

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) throw new Error(GENERIC_SIGN_IN_ERROR)
}

export interface MentorProfile {
  username: string
  mustChangePassword: boolean
  mentorName: string | null
}

export async function getMyMentorProfile(): Promise<MentorProfile | null> {
  const { data, error } = await supabase.rpc('get_my_mentor_profile')
  if (error) throw error

  const row = data?.[0]
  if (!row) return null

  return {
    username: row.username,
    mustChangePassword: row.must_change_password,
    mentorName: row.mentor_name,
  }
}

/** Sets a new Supabase Auth password, then clears the forced-change flag. */
export async function changeMentorPassword(newPassword: string): Promise<void> {
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) throw updateError

  const { error: clearError } = await supabase.rpc('clear_mentor_must_change_password')
  if (clearError) throw clearError
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.rpc('get_my_profile')
  if (error) throw error

  const row = data?.[0]
  if (!row) return null

  return {
    fullName: row.full_name,
    gender: row.gender,
    role: row.role,
    accessStatus: row.access_status ?? 'active',
    studentNumber: row.student_number ?? null,
  }
}
