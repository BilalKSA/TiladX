import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../lib/supabase'
import './Login.css'

function ResetPasswordConfirm() {
  const navigate = useNavigate()
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
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
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

        <h1 className="tld-login__title">تعيين كلمة مرور جديدة</h1>
        <p className="tld-login__subtitle">أدخل كلمة المرور الجديدة لحسابك في تلاد</p>

        <form className="tld-login__form" onSubmit={handleSubmit}>
          <label className="tld-field">
            <span className="tld-field__label">كلمة المرور الجديدة</span>
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

          <Button type="submit" variant="primary" size="lg" className="tld-login__submit" loading={loading}>
            حفظ كلمة المرور
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordConfirm
