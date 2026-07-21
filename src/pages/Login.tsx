import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { signInWithStudentId } from '../lib/auth'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [studentNumber, setStudentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithStudentId(studentNumber, password)
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
        <p className="tld-login__subtitle">سجّل الدخول عبر مؤسستك للوصول إلى برامجك </p>

        <div className="tld-login__modes" role="tablist" aria-label="طريقة تسجيل الدخول">
          <button type="button" role="tab" aria-selected="true" className="tld-login__mode tld-login__mode--active">
            دخول المؤسسات
          </button>
          <button type="button" role="tab" aria-selected="false" className="tld-login__mode" disabled>
            حساب فردي
          </button>
        </div>

        <form className="tld-login__form" onSubmit={handleSubmit}>
          <label className="tld-field">
            <span className="tld-field__label">المؤسسة</span>
            <select className="tld-field__input" defaultValue="kfupm" disabled>
              <option value="kfupm">جامعة الملك فهد للبترول والمعادن (KFUPM)</option>
            </select>
          </label>

          <label className="tld-field">
            <span className="tld-field__label">الرقم الجامعي</span>
            <input
              className="tld-field__input"
              type="text"
              inputMode="numeric"
              placeholder="202XXXXXX"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
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

          <Button type="submit" variant="primary" size="lg" className="tld-login__submit" disabled={loading}>
            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>

        <div className="tld-login__divider">
          <span>أو</span>
        </div>

        <Link to="/activate" className="tld-button tld-button--secondary tld-button--lg tld-login__submit">
          فعّل حسابك الآن
        </Link>
      </div>

      <p className="tld-login__terms">
        بتسجيل الدخول، أنت توافق على <a href="#">شروط الخدمة</a> و<a href="#">سياسة الخصوصية</a>
      </p>
    </div>
  )
}

export default Login
