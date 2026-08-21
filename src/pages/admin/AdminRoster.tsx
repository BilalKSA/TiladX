import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import { listStudents, addStudent, type RosterStudent , errorMessage } from '../../lib/admin'
import '../Login.css'
import './Admin.css'

const BLANK = { studentNumber: '', fullName: '', email: '', phone: '', gender: '' }

function AdminRoster() {
  const [students, setStudents] = useState<RosterStudent[]>([])
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      setStudents(await listStudents())
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return students
    return students.filter(
      (s) =>
        s.student_number.includes(term) ||
        (s.full_name ?? '').toLowerCase().includes(term) ||
        (s.email ?? '').toLowerCase().includes(term),
    )
  }, [students, query])

  const activated = students.filter((s) => s.activated_at).length

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await addStudent(form)
      setForm(BLANK)
      setAdding(false)
      await refresh()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="tld-admin__header">
        <div>
          <h1>الطلاب</h1>
          <p>
            {students.length} طالب، منهم {activated} فعّلوا حساباتهم.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setAdding((v) => !v)}>
          {adding ? 'إغلاق' : 'إضافة طالب'}
        </Button>
      </div>

      {error && <p className="tld-admin__error">{error}</p>}

      {adding && (
        <div className="tld-admin__panel">
          <h2>طالب جديد</h2>

          <form className="tld-admin__form" onSubmit={handleSubmit}>
            <label className="tld-field">
              <span className="tld-field__label">رقم الحساب</span>
              <input
                className="tld-field__input"
                dir="ltr"
                placeholder="100064"
                value={form.studentNumber}
                onChange={(e) => setForm({ ...form, studentNumber: e.target.value })}
                required
              />
            </label>

            <label className="tld-field">
              <span className="tld-field__label">الاسم الكامل</span>
              <input
                className="tld-field__input"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </label>

            <label className="tld-field">
              <span className="tld-field__label">البريد الإلكتروني</span>
              <input
                className="tld-field__input"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <span className="tld-admin__file-hint">هذا البريد هو اللي بيفعّل فيه الطالب حسابه.</span>
            </label>

            <label className="tld-field">
              <span className="tld-field__label">الجوال (اختياري)</span>
              <input
                className="tld-field__input"
                dir="ltr"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>

            <label className="tld-field">
              <span className="tld-field__label">الجنس</span>
              <select
                className="tld-field__input"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">غير محدد</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              <span className="tld-admin__file-hint">يُستخدم في تحية الصفحة الرئيسية.</span>
            </label>

            <div className="tld-admin__form-actions">
              <Button type="submit" variant="primary" size="md" loading={saving}>
                إضافة
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setAdding(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="tld-admin__panel">
        <label className="tld-field" style={{ marginBlockEnd: 'var(--space-4)' }}>
          <span className="tld-field__label">بحث</span>
          <input
            className="tld-field__input"
            placeholder="رقم الحساب، الاسم، أو البريد"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="tld-admin__table-wrap">
          <table className="tld-admin__table">
            <thead>
              <tr>
                <th>رقم الحساب</th>
                <th>الاسم</th>
                <th>البريد</th>
                <th>الحالة</th>
                <th>الدور</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td dir="ltr" className="tld-admin__row-title">
                    {student.student_number}
                  </td>
                  <td>{student.full_name ?? '—'}</td>
                  <td dir="ltr">{student.email ?? '—'}</td>
                  <td>
                    <span
                      className={`tld-admin__badge tld-admin__badge--${student.activated_at ? 'live' : 'draft'}`}
                    >
                      {student.activated_at ? 'مفعّل' : 'غير مفعّل'}
                    </span>
                  </td>
                  <td>{student.role === 'admin' ? 'مشرف' : 'طالب'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <p className="tld-admin__empty">ما فيه نتائج.</p>}
        </div>
      </div>
    </>
  )
}

export default AdminRoster
