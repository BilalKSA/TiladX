import { useEffect, useState, type FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import Button from '../../components/Button'
import { listLessons, listCourses, type Lesson, type Course } from '../../lib/content'
import { saveLesson, deleteLesson , errorMessage } from '../../lib/admin'
import { toEmbedUrl, isEmbeddable } from '../../lib/video'
import '../Login.css'
import './Admin.css'

type Editing = Lesson | 'new' | null

const BLANK = { title: '', description: '', video_url: '', duration_minutes: '', position: 0, published: false }

function AdminLessons() {
  const { courseId = '' } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [editing, setEditing] = useState<Editing>(null)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      const [allCourses, courseLessons] = await Promise.all([listCourses(), listLessons(courseId)])
      setCourse(allCourses.find((c) => c.id === courseId) ?? null)
      setLessons(courseLessons)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  function startEdit(lesson: Editing) {
    setError('')
    setEditing(lesson)
    if (lesson === 'new' || lesson === null) {
      setForm({ ...BLANK, position: lessons.length })
    } else {
      setForm({
        title: lesson.title,
        description: lesson.description ?? '',
        video_url: lesson.video_url ?? '',
        duration_minutes: lesson.duration_minutes?.toString() ?? '',
        position: lesson.position,
        published: lesson.published,
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await saveLesson({
        id: editing !== 'new' && editing !== null ? editing.id : undefined,
        course_id: courseId,
        title: form.title,
        description: form.description,
        video_url: form.video_url || null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        position: form.position,
        published: form.published,
      })
      setEditing(null)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(lesson: Lesson) {
    if (!confirm(`حذف درس «${lesson.title}»؟`)) return
    try {
      await deleteLesson(lesson.id)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const embedPreview = toEmbedUrl(form.video_url)
  const badLink = form.video_url.length > 0 && !isEmbeddable(form.video_url)

  return (
    <>
      <div className="tld-admin__header">
        <div>
          <h1>دروس {course?.title ?? ''}</h1>
          <p>
            <Link to="/admin/courses" className="tld-admin__exit" style={{ color: 'var(--primary)' }}>
              ← رجوع للدورات
            </Link>
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => startEdit('new')}>
          درس جديد
        </Button>
      </div>

      {error && <p className="tld-admin__error">{error}</p>}

      {editing !== null && (
        <div className="tld-admin__panel">
          <h2>{editing === 'new' ? 'درس جديد' : `تعديل: ${editing.title}`}</h2>

          <form className="tld-admin__form" onSubmit={handleSubmit}>
            <label className="tld-field">
              <span className="tld-field__label">عنوان الدرس</span>
              <input
                className="tld-field__input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label className="tld-field">
              <span className="tld-field__label">المدة (بالدقائق)</span>
              <input
                className="tld-field__input"
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
              />
            </label>

            <label className="tld-field tld-field--full">
              <span className="tld-field__label">رابط الفيديو (YouTube أو Vimeo)</span>
              <input
                className="tld-field__input"
                dir="ltr"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              />
              {badLink && (
                <span className="tld-admin__file-hint">
                  ما قدرنا نتعرّف على الرابط. الصق رابط فيديو من YouTube أو Vimeo.
                </span>
              )}
              {embedPreview && <span className="tld-admin__file-hint">✓ الرابط جاهز للعرض</span>}
            </label>

            <label className="tld-field tld-field--full">
              <span className="tld-field__label">الوصف</span>
              <textarea
                className="tld-field__input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

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
                منشور للطلاب
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
                <th>#</th>
                <th>الدرس</th>
                <th>المدة</th>
                <th>الفيديو</th>
                <th>الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson, index) => (
                <tr key={lesson.id}>
                  <td>{index + 1}</td>
                  <td className="tld-admin__row-title">{lesson.title}</td>
                  <td>{lesson.duration_minutes ? `${lesson.duration_minutes} د` : '—'}</td>
                  <td>{toEmbedUrl(lesson.video_url) ? '✓' : '—'}</td>
                  <td>
                    <span className={`tld-admin__badge tld-admin__badge--${lesson.published ? 'live' : 'draft'}`}>
                      {lesson.published ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td>
                    <div className="tld-admin__table-actions">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(lesson)}>
                        تعديل
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(lesson)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {lessons.length === 0 && <p className="tld-admin__empty">ما فيه دروس في هذي الدورة بعد.</p>}
        </div>
      </div>
    </>
  )
}

export default AdminLessons
