import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { listStudents , errorMessage } from '../../lib/admin'

interface Counts {
  courses: number
  lessons: number
  library: number
  mentors: number
  students: number
  activated: number
}

async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

function AdminHome() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [courses, lessons, library, mentors, students] = await Promise.all([
          countRows('courses'),
          countRows('lessons'),
          countRows('library_assets'),
          countRows('mentors'),
          listStudents(),
        ])

        setCounts({
          courses,
          lessons,
          library,
          mentors,
          students: students.length,
          activated: students.filter((s) => s.activated_at).length,
        })
      } catch (err) {
        setError(errorMessage(err))
      }
    }

    load()
  }, [])

  return (
    <>
      <div className="tld-admin__header">
        <div>
          <h1>نظرة عامة</h1>
          <p>كل المحتوى اللي يظهر في المنصة تقدر تعدّله من هنا، بدون ما تحتاج تحديث للموقع.</p>
        </div>
      </div>

      {error && <p className="tld-admin__error">{error}</p>}

      <div className="tld-admin__stats">
        <div className="tld-admin__stat">
          <strong>{counts?.courses ?? '—'}</strong>
          <span>دورة</span>
        </div>
        <div className="tld-admin__stat">
          <strong>{counts?.lessons ?? '—'}</strong>
          <span>درس</span>
        </div>
        <div className="tld-admin__stat">
          <strong>{counts?.library ?? '—'}</strong>
          <span>ملف في المكتبة</span>
        </div>
        <div className="tld-admin__stat">
          <strong>{counts?.mentors ?? '—'}</strong>
          <span>مرشد</span>
        </div>
      </div>

      <div className="tld-admin__panel">
        <h2>الطلاب</h2>
        <p>
          {counts
            ? `${counts.students} طالب في القائمة، منهم ${counts.activated} فعّلوا حساباتهم.`
            : 'جاري التحميل...'}
        </p>
        <div style={{ marginBlockStart: 'var(--space-4)' }}>
          <Link to="/admin/roster" className="tld-button tld-button--secondary tld-button--sm">
            إدارة الطلاب
          </Link>
        </div>
      </div>
    </>
  )
}

export default AdminHome
