import Header from '../components/Header'
import BackLink from '../components/BackLink'
import Footer from '../components/Footer'
import Button from '../components/Button'
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

const posters = [
  {
    icon: '🧪',
    title: 'ملصق ISEF — لمياء النفيعي',
    description: 'التقاط وتحويل ثاني أكسيد الكربون كهروكيميائياً باستخدام بوليمرات عضوية مسامية.',
  },
]

function Library() {
  return (
    <div className="tld-home">
      <Header />
      <BackLink to="/home" label="العودة إلى الرئيسية" />

      <section className="tld-section">
        <div className="tld-section__heading">
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

      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>الملصقات</h2>
        </div>
        <div className="tld-grid tld-grid--3">
          {posters.map((poster) => (
            <div className="tld-card tld-card--disabled" key={poster.title}>
              <span className="tld-pill-tag tld-course-soon">غير متاح</span>
              <div className="tld-card__icon">{poster.icon}</div>
              <h3>{poster.title}</h3>
              <p>{poster.description}</p>
              <Button variant="ghost" size="sm" disabled>
                عرض الملصق
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Library
