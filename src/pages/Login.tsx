import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    navigate('/home')
  }

  return (
    <div className="tld-login">
      <div className="tld-login__card">
        <div className="tld-login__logo">
          <Logo variant="ink" />
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
            <input className="tld-field__input" type="text" inputMode="numeric" placeholder="202XXXXXX" required />
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
                required
              />
            </div>
          </label>

          <div className="tld-login__row">
            <label className="tld-login__remember">
              <input type="checkbox" />
              تذكرني
            </label>
            <a className="tld-login__forgot" href="#">
              نسيت كلمة المرور؟
            </a>
          </div>

          <Button type="submit" variant="primary" size="lg" className="tld-login__submit">
            تسجيل الدخول
          </Button>
        </form>

        <div className="tld-login__divider">
          <span>أو</span>
        </div>

        <Button type="button" variant="secondary" size="lg" className="tld-login__submit">
          فعّل حسابك الآن
        </Button>
      </div>

      <p className="tld-login__terms">
        بتسجيل الدخول، أنت توافق على <a href="#">شروط الخدمة</a> و<a href="#">سياسة الخصوصية</a>
      </p>
    </div>
  )
}

export default Login
