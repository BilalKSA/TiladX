import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import BackLink from '../components/BackLink'
import Button from '../components/Button'
import { courses } from '../data/courses'
import './CourseDetail.css'

const contentItems = [
  { icon: '🎓', title: 'الدروس والشروحات', description: 'شروحات مصورة ومكتوبة تغطي محتوى الدورة خطوة بخطوة.' },
  { icon: '📚', title: 'كتب وملفات الدورة', description: 'المراجع والملفات الرسمية للدورة، جاهزة للتحميل.' },
  { icon: '🗂️', title: 'خطط المذاكرة', description: 'خطة أسبوعية منظمة لتغطية محتوى الدورة بثبات.' },

]

const communityLinks = [
  { icon: '👥', title: 'مجموعة الدورة', description: 'نقاش وأسئلة خاصة بمشتركي الدورة.' },
  { icon: '📣', title: 'قناة التحديثات', description: 'إعلانات ومستجدات الدورة أولاً بأول.' },
]

function CourseDetail() {
  const { id } = useParams()
  const course = courses.find((c) => c.id === id)

  if (!course) {
    return (
      <div className="tld-home">
        <Header />
        <section className="tld-section">
          <h2>الدورة غير موجودة</h2>
          <p>لم نتمكن من العثور على هذه الدورة.</p>
        </section>
        <BackLink to="/home/courses" label="العودة إلى البرامج" />
      </div>
    )
  }

  return (
    <div className="tld-home">
      <Header />
      <BackLink to="/home/courses" label="العودة إلى البرامج" />

      <section className="tld-hero halftone">
        <span className="tld-pill-tag tld-course-detail__tag">{course.tag}</span>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </section>

      <section className="tld-section">
        <div className="tld-grid tld-grid--3">
          {contentItems.map((item) => (
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

      <section className="tld-section">
        <div className="tld-grid tld-grid--2">
          {communityLinks.map((link) => (
            <div className="tld-card tld-card--row" key={link.title}>
              <div className="tld-card__icon">{link.icon}</div>
              <div className="tld-card__body">
                <h3>{link.title}</h3>
                <p>{link.description}</p>
              </div>
              <Button variant="secondary" size="sm">
                فتح الرابط ↗
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CourseDetail
