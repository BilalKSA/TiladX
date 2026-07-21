import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { requestPasswordReset } from '../lib/auth'
import './Login.css'

function ResetPassword() {
  const [studentNumber, setStudentNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(studentNumber)
      setSent(true)
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

        <h1 className="tld-login__title">استعادة كلمة المرور</h1>

        {sent ? (
          <p className="tld-login__subtitle">
            إذا كان الرقم الجامعي مسجّلاً، أرسلنا رابط استعادة كلمة المرور إلى بريدك الإلكتروني.
          </p>
        ) : (
          <>
            <p className="tld-login__subtitle">أدخل رقمك الجامعي وسنرسل رابط استعادة كلمة المرور إلى بريدك المسجّل</p>

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

              {error && <p className="tld-login__error">{error}</p>}

              <Button type="submit" variant="primary" size="lg" className="tld-login__submit" disabled={loading}>
                {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="tld-login__terms">
        تذكرت كلمة المرور؟{' '}
        <Link to="/" className="tld-login__forgot">
          سجّل الدخول
        </Link>
      </p>
    </div>
  )
}

export default ResetPassword
