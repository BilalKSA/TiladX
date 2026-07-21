import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Button from '../components/Button'
import { courses } from '../data/courses'
import './Home.css'

const libraryItems = [
  {
    icon: '📚',
    title: 'الكتب والملفات',
    description: 'ملفات ومراجع الدورات، جاهزة للتحميل والمراجعة في أي وقت.',
  },
  {
    icon: '🎓',
    title: 'الدروس والشروحات',
    description: 'شروحات مكتوبة تغطي أهم المفاهيم خطوة بخطوة.',
  },
  {
    icon: '🧑‍🏫',
    title: 'عرض المرشدين',
    description: 'تعرّف على المرشدين المسؤولين عن دعمك ومتابعتك.',
  },
]

const videoItems = [
  {
    badge: 'قريباً',
    title: 'بث مباشر أسبوعي',
    description: 'جلسات مباشرة مع المدربين للنقاش والإجابة على الأسئلة.',
  },
  {
    badge: 'متاح',
    title: 'مكتبة الفيديوهات',
    description: 'دروس مسجلة يمكنك مشاهدتها في أي وقت وبالسرعة التي تناسبك.',
  },
]

function Home() {
  return (
    <div className="tld-home">
      <Header />

      <section className="tld-hero halftone">
        <h1>أهلًا `$name`</h1>
        <p>أختر البرنامج الي ودّك تشوفها </p>
      </section>

      <section id="courses" className="tld-section">
        <div className="tld-section__heading">
          <span className="tld-badge">01</span>
          <h2>البرامج</h2>
        </div>
        <div className="tld-grid tld-grid--3">
          {courses.map((course) => (
            <div className={`tld-card${course.disabled ? ' tld-card--disabled' : ''}`} key={course.id}>
              <span className="tld-pill-tag tld-pill-tag--outline">{course.tag}</span>
              {course.disabled && <span className="tld-pill-tag tld-course-soon">غير متاح</span>}
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

      <section id="library" className="tld-section">
        <div className="tld-section__heading">
          <span className="tld-badge">02</span>
          <h2>مكتبة تلاد</h2>
        </div>
        <div className="tld-grid tld-grid--3">
          {libraryItems.map((item) => (
            <div className="tld-card" key={item.title}>
              <div className="tld-card__icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Button variant="ghost" size="sm">
                عرض المحتوى
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section id="videos" className="tld-section">
        <div className="tld-section__heading">
          <span className="tld-badge">03</span>
          <h2>الفيديوهات والجلسات المباشرة</h2>
        </div>
        <div className="tld-grid tld-grid--2">
          {videoItems.map((item) => (
            <div className="tld-card" key={item.title}>
              <span className="tld-pill-tag">{item.badge}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
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

export default Home
