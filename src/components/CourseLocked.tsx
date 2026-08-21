import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import type { Course } from '../lib/content'
import './CourseLocked.css'

// Shown when someone reaches a course page without a live enrolment — either
// by typing the URL or after an enrolment lapsed. The home card already shows
// the same state; this is the direct-navigation backstop.
function CourseLocked({ course }: { course: Course }) {
  return (
    <div className="tld-home">
      <Header />

      <section className="tld-locked">
        <div className="tld-locked__card">
          <div className="tld-locked__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
          </div>

          <span className="tld-pill-tag tld-pill-tag--outline">{course.tag}</span>
          <h1>{course.title}</h1>
          <p>
            ما عندك اشتراك فعّال في هذا البرنامج. فعّل اشتراكك عشان توصل للدروس والمكتبة والجلسات.
          </p>

          <div className="tld-locked__actions">
            <Link to="/home" className="tld-button tld-button--secondary tld-button--md">
              رجوع للبرامج
            </Link>
            <Link to="/#contact" className="tld-button tld-button--primary tld-button--md">
              تواصل معنا للاشتراك
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default CourseLocked
