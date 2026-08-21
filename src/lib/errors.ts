/**
 * Supabase rejects with a PostgrestError object, which is NOT an Error
 * instance — so `err instanceof Error` is false and naive handlers swallow the
 * real message. Always route caught errors through this.
 */
export function errorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: string; hint?: string; code?: string }
    if (e.message) {
      const code = e.code ? ` (${e.code})` : ''
      return e.hint ? `${e.message}${code} — ${e.hint}` : `${e.message}${code}`
    }
  }
  if (err instanceof Error) return err.message
  return 'حدث خطأ غير متوقع.'
}
