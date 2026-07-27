import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Footer from '../components/Footer'
import './Home.css'
import './Landing.css'

const mrepFilenames = [
  'EmadPoster',
  'FaresPoster',
  'FatimaPoster',
  'JomanaPoster',
  'JuanPoster',
  'LanaPoster',
  'MohammadPoster',
  'MohammedPoster',
  'Shaden',
]

const posters = [
  {
    icon: '🧪',
    title: 'ملصق ISEF — لمياء النفيعي',
    description: '',
    file: '/assets/lamyaa-alnofie-isef-poster.pdf',
  },
  {
    icon: '🧪',
    title: 'ملصق ISEF — فاطمة العرفج',
    description: '',
    file: '/assets/fatimah-alarfaj-isef-poster.pdf',
  },
  {
    icon: '🧪',
    title: 'ملصق ISEF — مريم',
    description: '',
    file: '/assets/mariam-isef-poster.pdf',
  },
  ...mrepFilenames.map((name) => ({
    icon: '🏆',
    title: `MREP - ${name}`,
    description: '',
    file: `/assets/posters/${name}.pdf`,
  })),
]

function Files() {
  return (
    <div className="tld-landing">
      <header className="tld-landing__header">
        <Link to="/">
          <Logo />
        </Link>
        <div className="tld-landing__header-actions">
          <ThemeToggle />
        </div>
      </header>

      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>ملفاتك</h2>
        </div>
        <div className="tld-grid tld-grid--3">
          {posters.map((poster) => (
            <div className={`tld-card${poster.file ? '' : ' tld-card--disabled'}`} key={poster.title}>
              <div className="tld-card__icon">{poster.icon}</div>
              {!poster.file && <span className="tld-pill-tag tld-course-soon">غير متاح</span>}
              <h3>{poster.title}</h3>
              {poster.description && <p>{poster.description}</p>}
              {poster.file ? (
                <a href={poster.file} target="_blank" rel="noopener noreferrer" className="tld-button tld-button--ghost tld-button--sm">
                  عرض الملف
                </a>
              ) : (
                <button type="button" className="tld-button tld-button--ghost tld-button--sm" disabled>
                  عرض الملف
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Files
