import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { registerSelf } from '../lib/auth'
import { errorMessage } from '../lib/errors'
import { useCooldown, cooldownLabel } from '../lib/cooldown'
import { supabase } from '../lib/supabase'
import './Login.css'
import './Activate.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function CheckIcon({ passed }: { passed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {passed ? <path d="m5 12.5 4.5 4.5L19 7" /> : <circle cx="12" cy="12" r="7" strokeWidth="1.8" />}
    </svg>
  )
}

function Register() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)

  // Server-side limits are configured on Supabase Auth; this keeps people from
  // burning their allowance and shows a countdown instead of a rejection.
  const resend = useCooldown('signup-confirm', 60)

  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      letter: /[A-Za-z؀-ۿ]/.test(password),
      number: /\d/.test(password),
    }),
    [password],
  )

  const passwordValid = checks.length && checks.letter && checks.number
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const canSubmit =
    fullName.trim().length >= 2 &&
    EMAIL_PATTERN.test(email.trim()) &&
    passwordValid &&
    passwordsMatch &&
    acceptedTerms

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { confirmed } = await registerSelf(email, password, fullName)
      if (confirmed) {
        navigate('/home')
      } else {
        // Email confirmation is on — no session yet.
        setAwaitingConfirm(true)
        resend.start()
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    try {
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: email.trim() })
      if (resendError) throw resendError
      resend.start()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  if (awaitingConfirm) {
    return (
      <div className="tld-login">
        <div className="tld-login__card">
          <div className="tld-login__logo">
            <Logo />
          </div>
          <h1 className="tld-login__title">تحقّق من بريدك</h1>
          <p className="tld-login__subtitle">
            أرسلنا رمز التأكيد إلى <strong dir="ltr">{email.trim()}</strong>. افتح الرسالة وأكّد حسابك، بعدها سجّل
            دخولك.
          </p>

          {error && <p className="tld-login__error">{error}</p>}

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="tld-login__submit"
            disabled={resend.active}
            onClick={handleResend}
          >
            {resend.active ? cooldownLabel(resend.remaining) : 'إعادة إرسال الرسالة'}
          </Button>

          <p className="tld-field__hint" style={{ marginBlockStart: 'var(--space-3)' }}>
            ما وصلتك؟ تأكد من مجلد الرسائل غير المرغوب فيها (Spam).
          </p>

          <div className="tld-login__divider">
            <span>أو</span>
          </div>

          <Link to="/login" className="tld-button tld-button--primary tld-button--lg tld-login__submit">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tld-login">
      <div className="tld-login__card tld-activate__card">
        <div className="tld-login__top">
          <ThemeToggle />
        </div>

        <div className="tld-login__logo">
          <Logo />
        </div>

        <h1 className="tld-login__title">إنشاء حساب جديد</h1>
        <p className="tld-login__subtitle">سجّل حسابك في تلاد، وفعّل اشتراكك عشان توصل لمحتوى البرامج</p>

        <form className="tld-login__form" onSubmit={handleSubmit} noValidate>
          <label className="tld-field">
            <span className="tld-field__label">الاسم الكامل</span>
            <input
              className="tld-field__input"
              type="text"
              autoComplete="name"
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label className="tld-field">
            <span className="tld-field__label">البريد الإلكتروني</span>
            <input
              className="tld-field__input"
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="tld-field">
            <span className="tld-field__label">كلمة المرور</span>
            <div className="tld-field__password">
              <button
                type="button"
                className="tld-field__eye"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
              <input
                className="tld-field__input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <ul className="tld-activate__checks">
              <li className={checks.length ? 'is-passed' : undefined}>
                <CheckIcon passed={checks.length} />٨ خانات على الأقل
              </li>
              <li className={checks.letter ? 'is-passed' : undefined}>
                <CheckIcon passed={checks.letter} />حرف واحد على الأقل
              </li>
              <li className={checks.number ? 'is-passed' : undefined}>
                <CheckIcon passed={checks.number} />رقم واحد على الأقل
              </li>
            </ul>
          </label>

          <label className="tld-field">
            <span className="tld-field__label">تأكيد كلمة المرور</span>
            <input
              className="tld-field__input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword.length > 0 && (
              <span className={`tld-field__hint${passwordsMatch ? ' is-ok' : ' is-bad'}`}>
                {passwordsMatch ? 'كلمتا المرور متطابقتان ✓' : 'كلمتا المرور غير متطابقتين'}
              </span>
            )}
          </label>

          <label className="tld-activate__terms">
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
            <span>
              أوافق على <a href="#">شروط الخدمة</a> و<a href="#">سياسة الخصوصية</a>
            </span>
          </label>

          {error && <p className="tld-login__error">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="tld-login__submit"
            loading={loading}
            disabled={!canSubmit}
          >
            إنشاء الحساب
          </Button>
        </form>

        <div className="tld-login__divider">
          <span>أو</span>
        </div>

        <Link to="/activate" className="tld-button tld-button--secondary tld-button--lg tld-login__submit">
          عندك حساب من تلاد؟ فعّله بدل ما تسجّل
        </Link>
      </div>

      <p className="tld-login__terms">
        لديك حساب بالفعل؟{' '}
        <Link to="/login" className="tld-login__forgot">
          سجّل الدخول
        </Link>
      </p>
    </div>
  )
}

export default Register
