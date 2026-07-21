import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Home.css'

const sections = [
  {
    to: '/home/courses',
    badge: '01',
    icon: '🎯',
    title: 'البرامج',
    description: 'استعرض برامج تلاد التدريبية وتابع اشتراكاتك.',
  },
  {
    to: '/home/library',
    badge: '02',
    icon: '📚',
    title: 'مكتبة تلاد',
    description: 'كتب، شروحات، ومرشدون لدعمك في مسيرتك.',
  },
  {
    to: '/home/videos',
    badge: '03',
    icon: '🎥',
    title: 'الفيديوهات والجلسات المباشرة',
    description: 'جلسات مباشرة وفيديوهات مسجلة في أي وقت.',
  },
]

function Home() {
  return (
    <div className="tld-home">
      <Header />

      <section className="tld-hero halftone">
        <h1>هلا `$name`</h1>
        <p>اختر القسم اللي ودّك تشوفه</p>
      </section>

      <section className="tld-section">
        <div className="tld-grid tld-grid--3">
          {sections.map((section) => (
            <div className="tld-card" key={section.to}>
              <span className="tld-badge">{section.badge}</span>
              <div className="tld-card__icon">{section.icon}</div>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <Link to={section.to} className="tld-button tld-button--primary tld-button--sm">
                عرض القسم
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
