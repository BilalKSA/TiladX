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
    file: '/assets/lamyaa-alnofie-isef-poster.pdf',
  },
  {
    icon: '🧪',
    title: 'ملصق ISEF — فاطمة العرفج',
    description: 'ملصق بحثي مقدم في معرض إنتل الدولي للعلوم والهندسة (ISEF).',
    file: '/assets/fatimah-alarfaj-isef-poster.pdf',
  },
  {
    icon: '🧪',
    title: 'ملصق ISEF — مريم',
    description: 'ملصق بحثي مقدم في معرض إنتل الدولي للعلوم والهندسة (ISEF).',
    file: '/assets/mariam-isef-poster.pdf',
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
          <span className="tld-pill-tag tld-pill-tag--outline">لمنظمتك: ثلاث ملصقات</span>
        </div>
        <div className="tld-grid tld-grid--3">
          {posters.map((poster) => (
            <div className="tld-card" key={poster.title}>
              <div className="tld-card__icon">{poster.icon}</div>
              <h3>{poster.title}</h3>
              <p>{poster.description}</p>
              <a
                href={poster.file}
                target="_blank"
                rel="noopener noreferrer"
                className="tld-button tld-button--ghost tld-button--sm"
              >
                عرض الملصق
              </a>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Library
