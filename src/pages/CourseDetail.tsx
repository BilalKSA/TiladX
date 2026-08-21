import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import CourseLocked from '../components/CourseLocked'
import Header from '../components/Header'
import BackLink from '../components/BackLink'
import Footer from '../components/Footer'
import { getCourseBySlug, listLessons, type Course, type Lesson } from '../lib/content'
import { canAccessCourse } from '../lib/enrollments'
import { toEmbedUrl } from '../lib/video'
import './CourseDetail.css'

function CourseDetail() {
  const { slug = '' } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [allowed, setAllowed] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const found = await getCourseBySlug(slug)
        setCourse(found)
        if (found) {
          // Per-course gate: enrolment decides, not an account-wide flag.
          // Fails closed — if the check itself errors, treat it as no access
          // rather than letting content through.
          const ok = await canAccessCourse(found.id).catch((err) => {
            console.warn('[course] access check failed, locking:', err)
            return false
          })
          setAllowed(ok)
          if (ok) {
            const courseLessons = await listLessons(found.id)
            setLessons(courseLessons)
            setActiveId(courseLessons[0]?.id ?? null)
          }
        }
      } catch {
        setCourse(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  if (loading) return null

  if (!course) {
    return (
      <div className="tld-home">
        <Header />
        <section className="tld-section">
          <h2>الدورة غير موجودة</h2>
          <p>لم نتمكن من العثور على هذه الدورة.</p>
        </section>
        <BackLink to="/home/courses" label="العودة إلى البرامج" />
        <Footer />
      </div>
    )
  }

  if (!allowed) return <CourseLocked course={course} />

  const active = lessons.find((lesson) => lesson.id === activeId) ?? null
  const embedUrl = toEmbedUrl(active?.video_url)

  return (
    <div className="tld-home">
      <AppHeader tag={course.tag} title={course.title} subtitle={course.description ?? undefined} />

      <section className="tld-section">
        {lessons.length === 0 ? (
          <p>لسا ما أضفنا دروس لهذي الدورة. تابعنا قريباً.</p>
        ) : (
          <div className="tld-course-player">
            <div className="tld-course-player__stage">
              {embedUrl ? (
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title={active?.title ?? ''}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="tld-course-player__empty">ما فيه فيديو لهذا الدرس.</div>
              )}

              {active && (
                <div className="tld-course-player__meta">
                  <h3>{active.title}</h3>
                  {active.description && <p>{active.description}</p>}
                </div>
              )}
            </div>

            <ol className="tld-course-player__list">
              {lessons.map((lesson, index) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    className={`tld-course-player__item${lesson.id === activeId ? ' is-active' : ''}`}
                    onClick={() => setActiveId(lesson.id)}
                  >
                    <span className="tld-course-player__index">{index + 1}</span>
                    <span className="tld-course-player__title">{lesson.title}</span>
                    {lesson.duration_minutes && (
                      <span className="tld-course-player__duration">{lesson.duration_minutes} د</span>
                    )}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* The library and video sections live here, inside a program, rather
          than in a global nav bar. */}
      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>أقسام البرنامج</h2>
        </div>

        <div className="tld-grid tld-grid--2">
          <Link to={`/courses/${course.slug}/library`} className="tld-card tld-course-section">
            <span className="tld-course-section__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.6 1.6 0 0 0-1.6-1.6H4Z" />
                <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.6 1.6 0 0 1 1.6-1.6H20Z" />
              </svg>
            </span>
            <span className="tld-course-section__body">
              <h3>مكتبة تلاد</h3>
              <p>أوراق بحثية، بوسترات، نماذج، وملفات جاهزة للتحميل.</p>
            </span>
            <span className="tld-course-section__chevron" aria-hidden="true">
              ←
            </span>
          </Link>

          <Link to="/home/videos" className="tld-card tld-course-section">
            <span className="tld-course-section__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M8 21h8M12 18v3" />
              </svg>
            </span>
            <span className="tld-course-section__body">
              <h3>الفيديوهات والجلسات المباشرة</h3>
              <p>جلسات مباشرة وتسجيلات تقدر ترجع لها في أي وقت.</p>
            </span>
            <span className="tld-course-section__chevron" aria-hidden="true">
              ←
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default CourseDetail
