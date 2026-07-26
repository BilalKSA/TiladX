import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Footer from '../components/Footer'
import { courses } from '../data/courses'
import './Home.css'
import './Landing.css'

const highlights = [
  {
    icon: '🎯',
    title: 'برامج تنافسية معتمدة',
    description: 'مسارات مصممة لتجهيزك للمنافسة والتميز في برامجك.',
  },
  {
    icon: '🧑‍🏫',
    title: 'مرشدون ومتابعة مستمرة',
    description: 'دعم مباشر من مرشدين متخصصين طوال رحلتك.',
  },
  {
    icon: '📚',
    title: 'مكتبة موارد شاملة',
    description: 'دروس، ملفات، واختبارات في مكان واحد يسهل الوصول إليه.',
  },
]

function Landing() {
  return (
    <div className="tld-landing">
      <header className="tld-landing__header">
        <Logo />
        <div className="tld-landing__header-actions">
          <ThemeToggle />
          <Link to="/login" className="tld-button tld-button--primary tld-button--sm">
            تسجيل الدخول
          </Link>
        </div>
      </header>

      <section className="tld-hero halftone tld-landing__hero">
        <h1>من الطالب وإلى الطالب</h1>
        <p>منصة تلاد التعليمية لدعم الطلاب المشاركين في البرامج والمسابقات التنافسية.</p>
        <Link to="/login" className="tld-button tld-button--on-primary tld-button--lg">
          تسجيل الدخول
        </Link>
      </section>

      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>برامجنا</h2>
        </div>
        <div className="tld-grid tld-grid--3">
          {courses.map((course) => (
            <div className={`tld-card${course.disabled ? ' tld-card--disabled' : ''}`} key={course.id}>
              <span className="tld-pill-tag tld-pill-tag--outline">{course.tag}</span>
              {course.disabled && <span className="tld-pill-tag tld-course-soon">قريباً</span>}
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>ليش تلاد؟</h2>
        </div>
        <div className="tld-grid tld-grid--3">
          {highlights.map((item) => (
            <div className="tld-card" key={item.title}>
              <div className="tld-card__icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tld-landing__cta">
        <h2>جاهز تبدأ رحلتك؟</h2>
        <p>سجّل الدخول برقم حسابك وتابع برامجك في تلاد.</p>
        <Link to="/login" className="tld-button tld-button--primary tld-button--lg">
          تسجيل الدخول
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
