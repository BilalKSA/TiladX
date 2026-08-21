import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { activateStudent } from '../lib/auth'
import './Login.css'
import './Activate.css'

function CheckIcon({ passed }: { passed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {passed ? <path d="m5 12.5 4.5 4.5L19 7" /> : <circle cx="12" cy="12" r="7" strokeWidth="1.8" />}
    </svg>
  )
}

function Activate() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      letter: /[A-Za-z؀-ۿ]/.test(password),
      number: /\d/.test(password),
    }),
    [password],
  )

  const passedCount = Object.values(checks).filter(Boolean).length
  const strength = useMemo(() => {
    if (!password) return 0
    let score = passedCount
    if (password.length >= 12) score += 1
    if (/[^A-Za-z0-9؀-ۿ]/.test(password)) score += 1
    return Math.min(score, 4)
  }, [password, passedCount])

  const strengthLabel = ['', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'][strength]
  const passwordValid = checks.length && checks.letter && checks.number
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const canSubmit = passwordValid && passwordsMatch && acceptedTerms && email.trim().length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    if (!passwordValid) {
      setFieldErrors({ password: 'كلمة المرور ما تحقق الشروط المطلوبة.' })
      return
    }
    if (!passwordsMatch) {
      setFieldErrors({ confirmPassword: 'كلمتا المرور غير متطابقتين.' })
      return
    }

    setLoading(true)
    try {
      await activateStudent(email, password)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع، حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
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

        <h1 className="tld-login__title">تفعيل الحساب</h1>
        <p className="tld-login__subtitle">
          أدخل بريدك الإلكتروني المسجّل في تلاد واختر كلمة مرور قوية لحسابك
        </p>

        <form className="tld-login__form" onSubmit={handleSubmit} noValidate>
          <label className="tld-field">
            <span className="tld-field__label">البريد الإلكتروني</span>
            <input
              className="tld-field__input"
              type="email"
              autoComplete="email"
              autoFocus
              dir="ltr"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="tld-field__hint">لازم يكون نفس البريد اللي وصلتك عليه رسالة تلاد.</span>
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
                aria-invalid={Boolean(fieldErrors.password)}
              />
            </div>

            {password && (
              <div className="tld-activate__strength">
                <div className="tld-activate__strength-bars" aria-hidden="true">
                  {[1, 2, 3, 4].map((level) => (
                    <span key={level} className={level <= strength ? 'is-on' : undefined} />
                  ))}
                </div>
                <span className="tld-activate__strength-label">قوة كلمة المرور: {strengthLabel}</span>
              </div>
            )}

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
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
            />
            {confirmPassword.length > 0 && (
              <span className={`tld-field__hint${passwordsMatch ? ' is-ok' : ' is-bad'}`}>
                {passwordsMatch ? 'كلمتا المرور متطابقتان ✓' : 'كلمتا المرور غير متطابقتين'}
              </span>
            )}
            {fieldErrors.confirmPassword && (
              <span className="tld-field__error" role="alert">
                {fieldErrors.confirmPassword}
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
            تفعيل الحساب
          </Button>
        </form>
      </div>

      <p className="tld-login__terms">
        ما عندك حساب من تلاد؟{' '}
        <Link to="/register" className="tld-login__forgot">
          أنشئ حساب جديد
        </Link>
        {' · '}
        <Link to="/login" className="tld-login__forgot">
          سجّل الدخول
        </Link>
      </p>
    </div>
  )
}

export default Activate
