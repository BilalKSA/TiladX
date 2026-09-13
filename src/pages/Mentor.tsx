import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Skeleton from '../components/Skeleton'
import { getMyMentorProfile, changeMentorPassword, signOut, type MentorProfile } from '../lib/auth'
import { errorMessage } from '../lib/errors'
import './Login.css'
import './Mentor.css'

// Minimal landing for a mentor session — proves the login/activation flow
// works and enforces the forced password change. There is no mentor
// dashboard/portal yet; that's future work once there's content to put here.
function Mentor() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMyMentorProfile()
      .then((data) => {
        // A signed-in session with no mentor_accounts row (e.g. a student who
        // wandered onto this URL) doesn't belong here.
        if (!data) {
          navigate('/home', { replace: true })
          return
        }
        setProfile(data)
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false))
  }, [navigate])

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('كلمة المرور لازم تكون 8 أحرف على الأقل.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }

    setSaving(true)
    try {
      await changeMentorPassword(newPassword)
      setProfile((p) => (p ? { ...p, mustChangePassword: false } : p))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="tld-login">
        <div className="tld-login__card">
          <Skeleton style={{ inlineSize: '60%', blockSize: 28, marginInline: 'auto' }} />
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="tld-login">
      <div className="tld-login__card">
        <div className="tld-login__top">
          <ThemeToggle />
        </div>

        <div className="tld-login__logo">
          <Logo />
        </div>

        {profile.mustChangePassword ? (
          <>
            <h1 className="tld-login__title">غيّر كلمة المرور</h1>
            <p className="tld-login__subtitle">
              حسابك مفعّل بكلمة مرور مؤقتة — لازم تغيّرها قبل ما تكمل.
            </p>

            <form className="tld-login__form" onSubmit={handleChangePassword}>
              <label className="tld-field">
                <span className="tld-field__label">كلمة المرور الجديدة</span>
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
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
                  minLength={8}
                  required
                />
              </label>

              {error && <p className="tld-login__error">{error}</p>}

              <Button type="submit" variant="primary" size="lg" className="tld-login__submit" loading={saving}>
                حفظ كلمة المرور
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="tld-login__title">أهلاً {profile.mentorName ?? profile.username}</h1>
            <p className="tld-login__subtitle">تم تسجيل دخولك بنجاح.</p>
            <p className="tld-mentor__note">
              صفحة المرشدين لسه قيد التطوير — تواصل مع إدارة تلاد إذا احتجت أي شي بعد.
            </p>
            <Button variant="secondary" size="md" className="tld-login__submit" onClick={handleSignOut}>
              تسجيل الخروج
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default Mentor
