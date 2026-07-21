import Header from '../components/Header'
import BackLink from '../components/BackLink'
import './Home.css'

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

function Videos() {
  return (
    <div className="tld-home">
      <Header />
      <BackLink to="/home" label="العودة إلى الرئيسية" />

      <section className="tld-section">
        <div className="tld-section__heading">
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

export default Videos
