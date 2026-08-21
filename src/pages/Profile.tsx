import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BackLink from '../components/BackLink'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { getMyProfile, updateMyName, type Profile as ProfileData } from '../lib/auth'
import { errorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'
import './Home.css'
import './Login.css'
import './Profile.css'

function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [me, session] = await Promise.all([getMyProfile(), supabase.auth.getUser()])
        setProfile(me)
        // The email lives on the auth user, not on get_my_profile().
        setEmail(session.data.user?.email ?? null)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  function startEdit() {
    setDraft(profile?.fullName ?? '')
    setError('')
    setSaved(false)
    setEditing(true)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      // The server trims and validates, and returns what it actually stored.
      const stored = await updateMyName(draft)
      setProfile((p) => (p ? { ...p, fullName: stored } : p))
      setEditing(false)
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const firstName = profile?.fullName?.trim().split(' ')[0] ?? ''
  const initial = firstName.charAt(0) || '؟'

  return (
    <div className="tld-home">
      <Header />
      <BackLink to="/home" label="العودة إلى البرامج" />

      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>الملف الشخصي</h2>
        </div>

        {loading ? null : (
          <div className="tld-profile">
            <div className="tld-profile__card">
              <div className="tld-profile__avatar" aria-hidden="true">
                {initial}
              </div>
              <div className="tld-profile__identity">
                <h3>{profile?.fullName ?? 'حسابك في تلاد'}</h3>
                {profile?.role === 'admin' && <span className="tld-pill-tag">مشرف</span>}
              </div>
            </div>

            {editing ? (
              <form className="tld-profile__edit" onSubmit={handleSave}>
                <label className="tld-field">
                  <span className="tld-field__label">الاسم</span>
                  <input
                    className="tld-field__input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    minLength={2}
                    maxLength={120}
                    autoFocus
                    required
                  />
                  <span className="tld-admin__file-hint">هذا الاسم اللي يظهر لك في المنصة.</span>
                </label>

                {error && (
                  <p className="tld-login__error" role="alert">
                    {error}
                  </p>
                )}

                <div className="tld-profile__edit-actions">
                  <Button type="submit" variant="primary" size="md" loading={saving}>
                    حفظ
                  </Button>
                  <Button type="button" variant="ghost" size="md" onClick={() => setEditing(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="tld-profile__fields">
                <div>
                  <dt>الاسم</dt>
                  <dd>
                    {profile?.fullName ?? '—'}
                    <button type="button" className="tld-profile__edit-link" onClick={startEdit}>
                      تعديل
                    </button>
                  </dd>
                </div>
                <div>
                  <dt>البريد الإلكتروني</dt>
                  <dd dir="ltr">{email ?? '—'}</dd>
                </div>
                <div>
                  <dt>الصفة</dt>
                  <dd>{profile?.role === 'admin' ? 'مشرف' : 'طالب'}</dd>
                </div>
              </dl>
            )}

            {saved && !editing && <p className="tld-profile__saved">تم حفظ اسمك ✓</p>}

            <div className="tld-profile__actions">
              <Link to="/reset-password" className="tld-button tld-button--secondary tld-button--md">
                تغيير كلمة المرور
              </Link>
              <Link to="/home" className="tld-button tld-button--primary tld-button--md">
                تغيير البرنامج
              </Link>
            </div>

            <p className="tld-profile__note">
              بريدك ورقم حسابك مرتبطين بقائمة الطلاب — لتعديلهما تواصل مع إدارة تلاد.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

export default Profile
