import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import { listCourses, fileUrl, type Course } from '../../lib/content'
import { saveCourse, deleteCourse, uploadFile , errorMessage } from '../../lib/admin'
import '../Login.css'
import './Admin.css'

type Editing = Course | 'new' | null

const BLANK = { slug: '', tag: '', title: '', description: '', position: 0, published: false }

function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [editing, setEditing] = useState<Editing>(null)
  const [form, setForm] = useState({ ...BLANK, thumbnail_path: null as string | null })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function refresh() {
    try {
      setCourses(await listCourses())
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  function startEdit(course: Editing) {
    setError('')
    setEditing(course)
    if (course === 'new' || course === null) {
      setForm({ ...BLANK, thumbnail_path: null, position: courses.length })
    } else {
      setForm({
        slug: course.slug,
        tag: course.tag,
        title: course.title,
        description: course.description ?? '',
        position: course.position,
        published: course.published,
        thumbnail_path: course.thumbnail_path,
      })
    }
  }

  async function handleThumbnail(file: File) {
    setUploading(true)
    setError('')
    try {
      const path = await uploadFile('media', file, 'courses')
      setForm((f) => ({ ...f, thumbnail_path: path }))
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
      await saveCourse({
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

  async function handleDelete(course: Course) {
    if (!confirm(`حذف «${course.title}» وكل دروسها؟ ما تقدر تتراجع عن هذي الخطوة.`)) return
    try {
      await deleteCourse(course.id)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <div className="tld-admin__header">
        <div>
          <h1>الدورات والدروس</h1>
          <p>أضف دورة، ثم افتح «الدروس» عشان تضيف فيديوهات الدورة.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => startEdit('new')}>
          دورة جديدة
        </Button>
      </div>

      {error && <p className="tld-admin__error">{error}</p>}

      {editing !== null && (
        <div className="tld-admin__panel">
          <h2>{editing === 'new' ? 'دورة جديدة' : `تعديل: ${editing.title}`}</h2>

          <form className="tld-admin__form" onSubmit={handleSubmit}>
            <label className="tld-field">
              <span className="tld-field__label">العنوان</span>
              <input
                className="tld-field__input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label className="tld-field">
              <span className="tld-field__label">الوسم (ISEF، STEM Racing...)</span>
              <input
                className="tld-field__input"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                required
              />
            </label>

            <label className="tld-field">
              <span className="tld-field__label">المعرّف في الرابط</span>
              <input
                className="tld-field__input"
                dir="ltr"
                placeholder="isef"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
              <span className="tld-admin__file-hint">يظهر في الرابط: /courses/{form.slug || 'isef'}</span>
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

            <label className="tld-field tld-field--full">
              <span className="tld-field__label">الوصف</span>
              <textarea
                className="tld-field__input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <div className="tld-field tld-field--full">
              <span className="tld-field__label">صورة الدورة</span>
              <div className="tld-admin__upload">
                {form.thumbnail_path && (
                  <img className="tld-admin__thumb" src={fileUrl('media', form.thumbnail_path) ?? ''} alt="" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleThumbnail(file)
                  }}
                />
                {uploading && <span className="tld-admin__file-hint">جاري الرفع...</span>}
              </div>
            </div>

            <div className="tld-admin__form-actions">
              <label className="tld-admin__checkbox">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                منشورة للطلاب
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
                <th>الدورة</th>
                <th>الوسم</th>
                <th>الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="tld-admin__row-title">{course.title}</td>
                  <td>{course.tag}</td>
                  <td>
                    <span className={`tld-admin__badge tld-admin__badge--${course.published ? 'live' : 'draft'}`}>
                      {course.published ? 'منشورة' : 'مسودة'}
                    </span>
                  </td>
                  <td>
                    <div className="tld-admin__table-actions">
                      <Link
                        to={`/admin/courses/${course.id}/lessons`}
                        className="tld-button tld-button--secondary tld-button--sm"
                      >
                        الدروس
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(course)}>
                        تعديل
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(course)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {courses.length === 0 && <p className="tld-admin__empty">ما فيه دورات بعد.</p>}
        </div>
      </div>
    </>
  )
}

export default AdminCourses
