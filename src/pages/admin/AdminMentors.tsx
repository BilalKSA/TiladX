import { useEffect, useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import { listMentors, fileUrl, type Mentor } from '../../lib/content'
import { saveMentor, deleteMentor, uploadFile , errorMessage } from '../../lib/admin'
import '../Login.css'
import './Admin.css'

type Editing = Mentor | 'new' | null

const BLANK = { name: '', title: '', bio: '', track: '', position: 0, published: false }

function AdminMentors() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [editing, setEditing] = useState<Editing>(null)
  const [form, setForm] = useState({ ...BLANK, photo_path: null as string | null })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function refresh() {
    try {
      setMentors(await listMentors())
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  function startEdit(mentor: Editing) {
    setError('')
    setEditing(mentor)
    if (mentor === 'new' || mentor === null) {
      setForm({ ...BLANK, photo_path: null, position: mentors.length })
    } else {
      setForm({
        name: mentor.name,
        title: mentor.title ?? '',
        bio: mentor.bio ?? '',
        track: mentor.track ?? '',
        position: mentor.position,
        published: mentor.published,
        photo_path: mentor.photo_path,
      })
    }
  }

  async function handlePhoto(file: File) {
    setUploading(true)
    setError('')
    try {
      const path = await uploadFile('media', file, 'mentors')
      setForm((f) => ({ ...f, photo_path: path }))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await saveMentor({
        ...form,
        id: editing !== 'new' && editing !== null ? editing.id : undefined,
      })
      setEditing(null)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(mentor: Mentor) {
    if (!confirm(`حذف «${mentor.name}» من المرشدين؟`)) return
    try {
      await deleteMentor(mentor.id)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  // Tracks already in use, offered as autocomplete below.
  const tracks = [...new Set(mentors.map((m) => m.track).filter((t): t is string => !!t))].sort()

  return (
    <>
      <div className="tld-admin__header">
        <div>
          <h1>المرشدون</h1>
          <p>يظهرون في الشريط المتحرك في الصفحة الرئيسية، وفي صفحة «مرشدونا» مقسّمين على المسارات.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => startEdit('new')}>
          مرشد جديد
        </Button>
      </div>

      {error && <p className="tld-admin__error">{error}</p>}

      {editing !== null && (
        <div className="tld-admin__panel">
          <h2>{editing === 'new' ? 'مرشد جديد' : `تعديل: ${editing.name}`}</h2>

          <form className="tld-admin__form" onSubmit={handleSubmit}>
            <label className="tld-field">
              <span className="tld-field__label">الاسم</span>
              <input
                className="tld-field__input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className="tld-field">
              <span className="tld-field__label">التخصص</span>
              <input
                className="tld-field__input"
                placeholder="باحث في الذكاء الاصطناعي"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>

            <label className="tld-field">
              <span className="tld-field__label">المسار</span>
              <input
                className="tld-field__input"
                list="mentor-tracks"
                placeholder="بحث علمي"
                value={form.track}
                onChange={(e) => setForm({ ...form, track: e.target.value })}
              />
              {/* Existing tracks offered as suggestions: the /mentors filter
                  groups by exact text, so a typo would split one track in two. */}
              <datalist id="mentor-tracks">
                {tracks.map((track) => (
                  <option value={track} key={track} />
                ))}
              </datalist>
            </label>

            <label className="tld-field tld-field--full">
              <span className="tld-field__label">نبذة</span>
              <textarea
                className="tld-field__input"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </label>

            <div className="tld-field tld-field--full">
              <span className="tld-field__label">الصورة</span>
              <div className="tld-admin__upload">
                {form.photo_path && (
                  <img className="tld-admin__thumb" src={fileUrl('media', form.photo_path) ?? ''} alt="" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhoto(file)
                  }}
                />
                {uploading && <span className="tld-admin__file-hint">جاري الرفع...</span>}
              </div>
              <span className="tld-admin__file-hint">صورة مربعة تعطي أفضل نتيجة.</span>
            </div>

            <label className="tld-field">
              <span className="tld-field__label">الترتيب</span>
              <input
                className="tld-field__input"
                type="number"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
              />
            </label>

            <div className="tld-admin__form-actions">
              <label className="tld-admin__checkbox">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                ظاهر في الموقع
              </label>

              <Button type="submit" variant="primary" size="md" loading={saving}>
                حفظ
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setEditing(null)}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="tld-admin__panel">
        <div className="tld-admin__table-wrap">
          <table className="tld-admin__table">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>الاسم</th>
                <th>التخصص</th>
                <th>المسار</th>
                <th>الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {mentors.map((mentor) => (
                <tr key={mentor.id}>
                  <td>
                    {mentor.photo_path ? (
                      <img className="tld-admin__thumb" src={fileUrl('media', mentor.photo_path) ?? ''} alt="" />
                    ) : (
                      <span className="tld-admin__file-hint">—</span>
                    )}
                  </td>
                  <td className="tld-admin__row-title">{mentor.name}</td>
                  <td>{mentor.title || '—'}</td>
                  <td>{mentor.track || '—'}</td>
                  <td>
                    <span className={`tld-admin__badge tld-admin__badge--${mentor.published ? 'live' : 'draft'}`}>
                      {mentor.published ? 'ظاهر' : 'مخفي'}
                    </span>
                  </td>
                  <td>
                    <div className="tld-admin__table-actions">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(mentor)}>
                        تعديل
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(mentor)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {mentors.length === 0 && <p className="tld-admin__empty">ما فيه مرشدين بعد.</p>}
        </div>
      </div>
    </>
  )
}

export default AdminMentors
