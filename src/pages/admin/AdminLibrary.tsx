import { useEffect, useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import {
  listLibraryAssets,
  listCourses,
  fileUrl,
  categoryLabel,
  LIBRARY_CATEGORIES,
  type Course,
  type LibraryAsset,
  type LibraryCategory,
} from '../../lib/content'
import { saveLibraryAsset, deleteLibraryAsset, uploadFile , errorMessage } from '../../lib/admin'
import '../Login.css'
import './Admin.css'

type Editing = LibraryAsset | 'new' | null

const BLANK = {
  course_id: '' as string,
  title: '',
  category: 'papers' as LibraryCategory,
  description: '',
  external_url: '',
  position: 0,
  published: false,
}

function AdminLibrary() {
  const [assets, setAssets] = useState<LibraryAsset[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [editing, setEditing] = useState<Editing>(null)
  const [form, setForm] = useState({ ...BLANK, file_path: null as string | null })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function refresh() {
    try {
      const [allAssets, allCourses] = await Promise.all([listLibraryAssets(), listCourses()])
      setAssets(allAssets)
      setCourses(allCourses)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  function programLabel(courseId: string | null) {
    if (!courseId) return 'كل البرامج'
    return courses.find((c) => c.id === courseId)?.title ?? '—'
  }

  useEffect(() => {
    refresh()
  }, [])

  function startEdit(asset: Editing) {
    setError('')
    setEditing(asset)
    if (asset === 'new' || asset === null) {
      setForm({ ...BLANK, file_path: null, position: assets.length })
    } else {
      setForm({
        course_id: asset.course_id ?? '',
        title: asset.title,
        category: asset.category,
        description: asset.description ?? '',
        external_url: asset.external_url ?? '',
        position: asset.position,
        published: asset.published,
        file_path: asset.file_path,
      })
    }
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setError('')
    try {
      const path = await uploadFile('library', file, form.category)
      setForm((f) => ({ ...f, file_path: path }))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!form.file_path && !form.external_url.trim()) {
      setError('لازم ترفع ملف أو تحط رابط خارجي.')
      return
    }

    setSaving(true)
    try {
      await saveLibraryAsset({
        ...form,
        course_id: form.course_id || null,
        external_url: form.external_url.trim() || null,
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

  async function handleDelete(asset: LibraryAsset) {
    if (!confirm(`حذف «${asset.title}» من المكتبة؟`)) return
    try {
      await deleteLibraryAsset(asset.id)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <div className="tld-admin__header">
        <div>
          <h1>مكتبة تلاد</h1>
          <p>كل ملف ينتمي لبرنامج ويظهر في مكتبته. الملفات العامة تظهر في كل البرامج.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => startEdit('new')}>
          ملف جديد
        </Button>
      </div>

      {error && <p className="tld-admin__error">{error}</p>}

      {editing !== null && (
        <div className="tld-admin__panel">
          <h2>{editing === 'new' ? 'ملف جديد' : `تعديل: ${editing.title}`}</h2>

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
              <span className="tld-field__label">البرنامج</span>
              <select
                className="tld-field__input"
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">كل البرامج (ملف عام)</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <span className="tld-admin__file-hint">
                الملف يظهر داخل هذا البرنامج فقط. «كل البرامج» يظهر في كل مكتبة.
              </span>
            </label>

            <label className="tld-field">
              <span className="tld-field__label">التصنيف</span>
              <select
                className="tld-field__input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as LibraryCategory })}
              >
                {LIBRARY_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
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
              <span className="tld-field__label">الملف</span>
              <div className="tld-admin__upload">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file)
                  }}
                />
                {uploading && <span className="tld-admin__file-hint">جاري الرفع...</span>}
                {form.file_path && !uploading && (
                  <a
                    className="tld-admin__file-hint"
                    href={fileUrl('library', form.file_path) ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ✓ تم الرفع — معاينة
                  </a>
                )}
              </div>
            </div>

            <label className="tld-field tld-field--full">
              <span className="tld-field__label">أو رابط خارجي</span>
              <input
                className="tld-field__input"
                dir="ltr"
                placeholder="https://..."
                value={form.external_url}
                onChange={(e) => setForm({ ...form, external_url: e.target.value })}
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
                <th>الملف</th>
                <th>البرنامج</th>
                <th>التصنيف</th>
                <th>الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="tld-admin__row-title">{asset.title}</td>
                  <td>{programLabel(asset.course_id)}</td>
                  <td>{categoryLabel(asset.category)}</td>
                  <td>
                    <span className={`tld-admin__badge tld-admin__badge--${asset.published ? 'live' : 'draft'}`}>
                      {asset.published ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td>
                    <div className="tld-admin__table-actions">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(asset)}>
                        تعديل
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(asset)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {assets.length === 0 && <p className="tld-admin__empty">المكتبة فاضية.</p>}
        </div>
      </div>
    </>
  )
}

export default AdminLibrary
