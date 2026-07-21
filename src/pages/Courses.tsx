import { Link } from 'react-router-dom'
import Header from '../components/Header'
import BackLink from '../components/BackLink'
import Button from '../components/Button'
import { courses } from '../data/courses'
import './Home.css'

function Courses() {
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
            <div className={`tld-card${course.disabled ? ' tld-card--disabled' : ''}`} key={course.id}>
              <span className="tld-pill-tag tld-pill-tag--outline">{course.tag}</span>
              {course.disabled && <span className="tld-pill-tag tld-course-soon">غير مشترك</span>}
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              {course.disabled ? (
                <Button variant="primary" size="sm" disabled>
                  استعرض البرنامج
                </Button>
              ) : (
                <Link to={`/courses/${course.id}`} className="tld-button tld-button--primary tld-button--sm">
                  استعرض البرنامج
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="tld-footer">
        <p>&copy; {new Date().getFullYear()} تلاد. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}

export default Courses
