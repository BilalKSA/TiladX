import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getMyProfile } from '../lib/auth'
import { listCourses, fileUrl, type Course } from '../lib/content'
import { listMyEnrollments, lockStateFor, type Enrollment } from '../lib/enrollments'
import './Home.css'

function Home() {
  const [firstName, setFirstName] = useState('')
  const [gender, setGender] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        if (!profile) return
        setFirstName(profile.fullName?.trim().split(' ')[0] ?? '')
        setGender(profile.gender)
        setIsAdmin(profile.role === 'admin')
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Fetched independently on purpose: if the enrolment lookup fails, the
    // programme list must still render (locked) rather than the page coming up
    // empty. A single Promise.all would have thrown both away together.
    listCourses()
      .then(setCourses)
      .catch((err) => console.warn('[Home] could not load courses:', err))
      .finally(() => setLoading(false))

    listMyEnrollments()
      .then(setEnrollments)
      .catch((err) => console.warn('[Home] could not load enrolments — showing every programme as locked:', err))
  }, [])

  const greeting = gender === 'female' ? 'هلا بصانعة المستقبل' : 'هلا بصانع المستقبل'

  return (
    <div className="tld-home">
      {/* Same panel-as-nav-bar as the course pages; the greeting is its body. */}
      <AppHeader title={`${greeting} ${firstName}`.trim()} subtitle="اختر البرنامج اللي ودّك تتابعه" />

      <section className="tld-section tld-programs">
        <div className="tld-programs__head">
          <h2>برامج تلاد</h2>
          <p className="tld-programs__note">
            <span aria-hidden="true">ⓘ</span>
            تقدر تغيّر البرنامج في أي وقت من القائمة في الأعلى
          </p>
        </div>

        <div className="tld-programs__grid">
          {courses.map((course) => {
            const thumbnail = fileUrl('media', course.thumbnail_path)
            const lock = lockStateFor(course.id, enrollments, isAdmin)
            const open = lock === 'open'

            return (
              <article
                className={`tld-program-card${open ? '' : ' tld-program-card--locked'}`}
                key={course.id}
              >
                <div className="tld-program-card__media">
                  {thumbnail ? (
                    <img src={thumbnail} alt="" loading="lazy" />
                  ) : (
                    <div className="tld-program-card__placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.6 1.6 0 0 0-1.6-1.6H4Z" />
                        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.6 1.6 0 0 1 1.6-1.6H20Z" />
                      </svg>
                    </div>
                  )}
                  <span className="tld-program-card__tag">{course.tag}</span>

                  {!open && (
                    <span className="tld-program-card__ribbon">
                      {lock === 'expired' ? 'انتهت الصلاحية' : 'يتطلب اشتراك'}
                    </span>
                  )}
                </div>

                <div className="tld-program-card__body">
                  <h3>{course.title}</h3>

                  {open ? (
                    <Link
                      to={`/courses/${course.slug}`}
                      className="tld-button tld-button--primary tld-button--md tld-program-card__cta"
                    >
                      ادخل البرنامج
                    </Link>
                  ) : (
                    <span className="tld-program-card__cta tld-program-card__locked-cta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" />
                      </svg>
                      {lock === 'expired' ? 'منتهي الصلاحية' : 'غير مشترك'}
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        {!loading && courses.length === 0 && (
          <p className="tld-programs__empty">ما فيه برامج متاحة حالياً.</p>
        )}
      </section>
    </div>
  )
}

export default Home
