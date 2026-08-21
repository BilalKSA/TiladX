import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BackLink from '../components/BackLink'
import Footer from '../components/Footer'
import { listCourses, fileUrl, type Course } from '../lib/content'
import './Home.css'

function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="tld-home">
      <Header />
      <BackLink to="/home" label="العودة إلى الرئيسية" />

      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>البرامج</h2>
        </div>

        <div className="tld-grid tld-grid--3">
          {courses.map((course) => (
            <div className="tld-card" key={course.id}>
              {course.thumbnail_path && (
                <img
                  src={fileUrl('media', course.thumbnail_path) ?? ''}
                  alt=""
                  style={{
                    inlineSize: '100%',
                    aspectRatio: '16/9',
                    objectFit: 'contain',
                    background: 'var(--surface-tint)',
                    borderRadius: 'var(--radius-input)',
                  }}
                />
              )}
              <span className="tld-pill-tag tld-pill-tag--outline">{course.tag}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <Link to={`/courses/${course.slug}`} className="tld-button tld-button--primary tld-button--sm">
                استعرض البرنامج
              </Link>
            </div>
          ))}
        </div>

        {!loading && courses.length === 0 && <p>ما فيه برامج متاحة حالياً.</p>}
      </section>

      <Footer />
    </div>
  )
}

export default Courses
