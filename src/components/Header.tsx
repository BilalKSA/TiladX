import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Button from './Button'
import './Header.css'

const links = [
  { href: '#courses', label: 'الدورات' },
  { href: '#library', label: 'المكتبة' },
  { href: '#videos', label: 'الفيديوهات والجلسات' },
]

function Header() {
  const navigate = useNavigate()

  return (
    <header className="tld-header">
      <Logo />
      <nav className="tld-header__nav">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="tld-header__link">
            {link.label}
          </a>
        ))}
      </nav>
      <div className="tld-header__actions">
        <ThemeToggle />
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          تسجيل الخروج
        </Button>
      </div>
    </header>
  )
}

export default Header
