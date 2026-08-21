import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { signInWithStudentId, signInWithEmail } from '../lib/auth'
import './Login.css'

type Mode = 'organization' | 'individual'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('organization')
  const [showPassword, setShowPassword] = useState(false)
  const [studentNumber, setStudentNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    setError('')
    setPassword('')
    setShowPassword(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'organization') {
        await signInWithStudentId(studentNumber, password)
      } else {
        await signInWithEmail(email, password)
      }
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع، حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
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

        <h1 className="tld-login__title">مرحباً بك في تلاد</h1>
        <p className="tld-login__subtitle">
          {mode === 'organization'
            ? 'سجّل الدخول عبر مؤسستك للوصول إلى برامجك'
            : 'سجّل الدخول ببريدك الإلكتروني وكلمة المرور'}
        </p>

        <div className="tld-login__modes" role="tablist" aria-label="طريقة تسجيل الدخول">
          <button
            type="button"
            role="tab"
            id="tld-login-tab-organization"
            aria-selected={mode === 'organization'}
            aria-controls="tld-login-panel"
            className={`tld-login__mode${mode === 'organization' ? ' tld-login__mode--active' : ''}`}
            onClick={() => switchMode('organization')}
          >
            دخول المؤسسات
          </button>
          <button
            type="button"
            role="tab"
            id="tld-login-tab-individual"
            aria-selected={mode === 'individual'}
            aria-controls="tld-login-panel"
            className={`tld-login__mode${mode === 'individual' ? ' tld-login__mode--active' : ''}`}
            onClick={() => switchMode('individual')}
          >
            حساب فردي
          </button>
        </div>

        <form
          className="tld-login__form"
          onSubmit={handleSubmit}
          id="tld-login-panel"
          role="tabpanel"
          aria-labelledby={mode === 'organization' ? 'tld-login-tab-organization' : 'tld-login-tab-individual'}
        >
          {mode === 'organization' ? (
            <>
              <label className="tld-field">
                <span className="tld-field__label">المؤسسة</span>
                <select className="tld-field__input" defaultValue="kfupm" disabled>
                  <option value="kfupm">جامعة الملك فهد للبترول والمعادن (KFUPM)</option>
                </select>
              </label>

              <label className="tld-field">
                <span className="tld-field__label"> رقم الحساب</span>
                <input
                  className="tld-field__input"
                  type="text"
                  inputMode="numeric"
                  placeholder="100001"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  required
                />
              </label>
            </>
          ) : (
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
          )}

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
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <div className="tld-login__row">
            <label className="tld-login__remember">
              <input type="checkbox" />
              تذكرني
            </label>
            <Link className="tld-login__forgot" to="/reset-password">
              نسيت كلمة المرور؟
            </Link>
          </div>

          {error && <p className="tld-login__error">{error}</p>}

          <Button type="submit" variant="primary" size="lg" className="tld-login__submit" loading={loading}>
            تسجيل الدخول
          </Button>
        </form>

        <div className="tld-login__divider">
          <span>أو</span>
        </div>

        <Link to="/register" className="tld-button tld-button--secondary tld-button--lg tld-login__submit">
          أنشئ حساب جديد
        </Link>

        <p className="tld-login__register">
          عندك حساب من تلاد وما فعّلته؟{' '}
          <Link to="/activate" className="tld-login__forgot">
            فعّل حسابك
          </Link>
        </p>
      </div>

      <p className="tld-login__terms">
        بتسجيل الدخول، أنت توافق على <a href="#">شروط الخدمة</a> و<a href="#">سياسة الخصوصية</a>
      </p>
    </div>
  )
}

export default Login
