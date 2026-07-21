import Header from '../components/Header'
import BackLink from '../components/BackLink'
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

      <footer className="tld-footer">
        <p>&copy; {new Date().getFullYear()} تلاد. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}

export default Library
