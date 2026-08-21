import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import { listCourses, type Course } from '../../lib/content'
import {
  listEnrollments,
  setEnrollment,
  deleteEnrollment,
  listStudents,
  errorMessage,
  type AdminEnrollment,
  type RosterStudent,
} from '../../lib/admin'
import '../Login.css'
import './Admin.css'

const BLANK = { identifier: '', courseId: '', status: 'active', expiresAt: '' }

function AdminEnrollments() {
  const [rows, setRows] = useState<AdminEnrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<RosterStudent[]>([])
  const [form, setForm] = useState(BLANK)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      const [all, allCourses, allStudents] = await Promise.all([
        listEnrollments(),
        listCourses(),
        listStudents(),
      ])
      setRows(all)
      setCourses(allCourses)
      setStudents(allStudents)
      if (!form.courseId && allCourses.length) setForm((f) => ({ ...f, courseId: allCourses[0].id }))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(
      (r) =>
        r.student_number.includes(term) ||
        (r.full_name ?? '').toLowerCase().includes(term) ||
        (r.email ?? '').toLowerCase().includes(term) ||
        r.course_title.toLowerCase().includes(term),
    )
  }, [rows, query])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await setEnrollment({
        identifier: form.identifier,
        courseId: form.courseId,
        status: form.status,
        // A date-only input means midnight; access should last through that day.
        expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
      })
      setForm({ ...BLANK, courseId: form.courseId })
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(row: AdminEnrollment) {
    if (!confirm(`إلغاء اشتراك ${row.full_name ?? row.student_number} في «${row.course_title}»؟`)) return
    try {
      await deleteEnrollment(row.id)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <div className="tld-admin__header">
        <div>
          <h1>الاشتراكات</h1>
          <p>كل طالب يشترك في برنامج أو أكثر. البرامج غير المشترك فيها تظهر له مقفلة.</p>
        </div>
      </div>

      {error && <p className="tld-admin__error">{error}</p>}

      <div className="tld-admin__panel">
        <h2>إضافة أو تعديل اشتراك</h2>

        <form className="tld-admin__form" onSubmit={handleSubmit}>
          <label className="tld-field">
            <span className="tld-field__label">الطالب</span>
            <input
              className="tld-field__input"
              dir="ltr"
              list="tld-student-options"
              placeholder="البريد الإلكتروني أو رقم الحساب"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              required
            />
            {/* Picker over the real roster — avoids typing an address from
                memory, while still accepting a free-typed value. */}
            <datalist id="tld-student-options">
              {students.map((student) => (
                <option key={student.id} value={student.email ?? student.student_number}>
                  {[student.full_name, student.student_number].filter(Boolean).join(' · ')}
                </option>
              ))}
            </datalist>
            <span className="tld-admin__file-hint">تقدر تكتب البريد أو رقم الحساب.</span>
          </label>

          <label className="tld-field">
            <span className="tld-field__label">البرنامج</span>
            <select
              className="tld-field__input"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              required
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <label className="tld-field">
            <span className="tld-field__label">الحالة</span>
            <select
              className="tld-field__input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">فعّال</option>
              <option value="pending">بانتظار الدفع</option>
              <option value="expired">منتهي</option>
            </select>
          </label>

          <label className="tld-field">
            <span className="tld-field__label">ينتهي في (اختياري)</span>
            <input
              className="tld-field__input"
              type="date"
              dir="ltr"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
            <span className="tld-admin__file-hint">اتركه فاضي لاشتراك بدون تاريخ انتهاء.</span>
          </label>

          <div className="tld-admin__form-actions">
            <Button type="submit" variant="primary" size="md" loading={saving}>
              حفظ الاشتراك
            </Button>
          </div>
        </form>
      </div>

      <div className="tld-admin__panel">
        <label className="tld-field" style={{ marginBlockEnd: 'var(--space-4)' }}>
          <span className="tld-field__label">بحث</span>
          <input
            className="tld-field__input"
            placeholder="رقم الحساب، الاسم، البريد، أو البرنامج"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="tld-admin__table-wrap">
          <table className="tld-admin__table">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>البرنامج</th>
                <th>الحالة</th>
                <th>ينتهي</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="tld-admin__row-title">
                    {row.full_name ?? '—'} <span dir="ltr">({row.student_number})</span>
                  </td>
                  <td>{row.course_title}</td>
                  <td>
                    <span className={`tld-admin__badge tld-admin__badge--${row.active ? 'live' : 'draft'}`}>
                      {row.active ? 'فعّال' : row.status === 'pending' ? 'بانتظار الدفع' : 'منتهي'}
                    </span>
                  </td>
                  <td dir="ltr">{row.expires_at ? row.expires_at.slice(0, 10) : '—'}</td>
                  <td>
                    <div className="tld-admin__table-actions">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
                        إلغاء
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <p className="tld-admin__empty">ما فيه اشتراكات.</p>}
        </div>
      </div>
    </>
  )
}

export default AdminEnrollments
