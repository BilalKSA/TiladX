import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { requestPasswordReset } from '../lib/auth'
import { errorMessage } from '../lib/errors'
import { useCooldown, cooldownLabel } from '../lib/cooldown'
import './Login.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  // Server-side limits are configured on Supabase Auth; this stops people
  // burning their allowance and shows a countdown instead of a rejection.
  const cooldown = useCooldown('password-reset', 60)

  // Shared by the initial send and the resend button.
  async function send() {
    setError('')

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('تأكد من بريدك الإلكتروني، يبدو فيه شي ناقص.')
      return
    }

    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
      cooldown.start()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    send()
  }

  return (
    <div className="tld-login">
      <div className="tld-login__card">
        <div className="tld-login__top">
          <ThemeToggle />
        </div>

        <div className="tld-login__logo">
          <Logo />
        </div>

        <h1 className="tld-login__title">استعادة كلمة المرور</h1>

        {sent ? (
          <>
            <p className="tld-login__subtitle">
              إذا كان هذا البريد مسجّلاً عندنا، أرسلنا له رابط تغيير كلمة المرور.
            </p>

            {error && <p className="tld-login__error">{error}</p>}

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="tld-login__submit"
              loading={loading}
              disabled={cooldown.active}
              onClick={send}
            >
              {cooldown.active ? cooldownLabel(cooldown.remaining) : 'إعادة إرسال الرابط'}
            </Button>

            <p className="tld-field__hint" style={{ marginBlockStart: 'var(--space-3)' }}>
              ما وصلتك؟ تأكد من مجلد الرسائل غير المرغوب فيها (Spam).
            </p>
          </>
        ) : (
          <>
            <p className="tld-login__subtitle">أدخل بريدك الإلكتروني وبنرسل لك رابط تغيير كلمة المرور</p>

            <form className="tld-login__form" onSubmit={handleSubmit} noValidate>
              <label className="tld-field">
                <span className="tld-field__label">البريد الإلكتروني</span>
                <input
                  className="tld-field__input"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  dir="ltr"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="tld-field__hint">نفس البريد اللي فعّلت فيه حسابك.</span>
              </label>

              {error && <p className="tld-login__error">{error}</p>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="tld-login__submit"
                loading={loading}
                disabled={cooldown.active}
              >
                {cooldown.active ? cooldownLabel(cooldown.remaining) : 'إرسال رابط الاستعادة'}
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="tld-login__terms">
        تذكرت كلمة المرور؟{' '}
        <Link to="/login" className="tld-login__forgot">
          سجّل الدخول
        </Link>
      </p>
    </div>
  )
}

export default ResetPassword
