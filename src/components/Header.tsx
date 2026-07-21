import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Button from './Button'
import { signOut } from '../lib/auth'
import './Header.css'

const links = [
  { to: '/home/courses', label: 'البرامج' },
  { to: '/home/library', label: 'المكتبة' },
  { to: '/home/videos', label: 'الفيديوهات والجلسات' },
]

function Header() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="tld-header">
      <Link to="/home" aria-label="الصفحة الرئيسية">
        <Logo />
      </Link>
      <nav className="tld-header__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `tld-header__link${isActive ? ' tld-header__link--active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="tld-header__actions">
        <ThemeToggle />
        <Button variant="secondary" size="sm" onClick={handleSignOut}>
          تسجيل الخروج
        </Button>
      </div>
    </header>
  )
}

export default Header
