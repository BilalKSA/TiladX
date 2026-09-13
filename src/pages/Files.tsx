import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { openFileInNewTab } from '../lib/download'
import './Home.css'
import './Files.css'

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

const isefPosters = [
  {
    icon: '🧪',
    title: 'ملصق ISEF — لمياء النفيعي',
    file: '/assets/lamyaa-alnofie-isef-poster.pdf',
  },
  {
    icon: '🧪',
    title: 'ملصق ISEF — فاطمة العرفج',
    file: '/assets/fatimah-alarfaj-isef-poster.pdf',
  },
  {
    icon: '🧪',
    title: 'ملصق ISEF — مريم',
    file: '/assets/mariam-isef-poster.pdf',
  },
]

const guidelines = {
  icon: '📘',
  title: "Tilad's Guidelines",
  file: '/assets/TiladGuideLines.pdf',
}

const mrepPosters = mrepFilenames.map((name) => ({
  icon: '🏆',
  title: `MREP - ${name}`,
  file: `/assets/posters/${name}.pdf`,
}))

function FileOpenButton({ file }: { file: string }) {
  const [opening, setOpening] = useState(false)

  async function handleOpen() {
    setOpening(true)
    try {
      await openFileInNewTab(file)
    } catch (err) {
      console.warn('[files] file open failed:', err)
    } finally {
      setOpening(false)
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" loading={opening} onClick={handleOpen}>
      عرض الملف
    </Button>
  )
}

function PosterCard({ poster }: { poster: { icon: string; title: string; file: string } }) {
  return (
    <div className="tld-card" key={poster.title}>
      <div className="tld-card__icon">{poster.icon}</div>
      <h3>{poster.title}</h3>
      <FileOpenButton file={poster.file} />
    </div>
  )
}

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
          {isefPosters.map((poster) => (
            <PosterCard poster={poster} key={poster.title} />
          ))}
        </div>

        <div className="tld-wide-card">
          <div className="tld-card__icon">{guidelines.icon}</div>
          <h3 className="tld-wide-card__title">{guidelines.title}</h3>
          <FileOpenButton file={guidelines.file} />
        </div>

        <div className="tld-grid tld-grid--3">
          {mrepPosters.map((poster) => (
            <PosterCard poster={poster} key={poster.title} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Files
