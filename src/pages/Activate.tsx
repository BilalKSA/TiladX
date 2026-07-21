import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { activateStudent } from '../lib/auth'
import './Login.css'

function Activate() {
  const navigate = useNavigate()
  const [studentNumber, setStudentNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }

    setLoading(true)
    try {
      await activateStudent(studentNumber, email, password)
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

        <h1 className="tld-login__title">تفعيل الحساب</h1>
        <p className="tld-login__subtitle">أدخل رقمك الجامعي وبريدك الإلكتروني لتفعيل حسابك في تلاد</p>

        <form className="tld-login__form" onSubmit={handleSubmit}>
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
            <span className="tld-field__label">البريد الإلكتروني</span>
            <input
              className="tld-field__input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="tld-field">
            <span className="tld-field__label">كلمة المرور</span>
            <input
              className="tld-field__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          <label className="tld-field">
            <span className="tld-field__label">تأكيد كلمة المرور</span>
            <input
              className="tld-field__input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && <p className="tld-login__error">{error}</p>}

          <Button type="submit" variant="primary" size="lg" className="tld-login__submit" disabled={loading}>
            {loading ? 'جارٍ التفعيل...' : 'تفعيل الحساب'}
          </Button>
        </form>
      </div>

      <p className="tld-login__terms">
        لديك حساب بالفعل؟{' '}
        <Link to="/" className="tld-login__forgot">
          سجّل الدخول
        </Link>
      </p>
    </div>
  )
}

export default Activate
