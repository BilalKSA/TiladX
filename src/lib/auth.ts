import { supabase } from './supabase'

const GENERIC_SIGN_IN_ERROR = 'الرقم الجامعي أو كلمة المرور غير صحيحة، أو الحساب غير مفعّل بعد.'

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

export async function checkStudentNumber(studentNumber: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_student_number', { p_student_number: studentNumber })
  if (error) throw error
  return data ?? false
}

export async function activateStudent(studentNumber: string, email: string, password: string) {
  const isValid = await checkStudentNumber(studentNumber)
  if (!isValid) throw new Error('الرقم الجامعي غير صحيح أو تم تفعيل الحساب مسبقاً.')

  const { error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError) throw signUpError

  const { error: linkError } = await supabase.rpc('link_student_account', {
    p_student_number: studentNumber,
    p_email: email,
  })
  if (linkError) throw linkError
}

// Never reveals whether a student number exists/is activated — the caller
// always shows the same "check your email" message, whether or not an email
// was actually sent, to avoid leaking which IDs are registered.
export async function requestPasswordReset(studentNumber: string) {
  const email = await resolveLoginEmail(studentNumber)
  if (!email) return

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password/confirm`,
  })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}
