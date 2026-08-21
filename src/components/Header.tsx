import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Button from './Button'
import { signOut } from '../lib/auth'
import './Header.css'

// No global nav by design — the library and video sections are reached from
// inside a program page, not from a bar that follows you everywhere. The logo
// goes back to /home, which is the program picker.
function Header() {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/')
  }

  return (
    <header className="tld-header">
      <Link to="/home" aria-label="الصفحة الرئيسية">
        <Logo />
      </Link>
      <div className="tld-header__actions">
        <ThemeToggle />
        <Button variant="secondary" size="sm" onClick={handleSignOut} loading={signingOut}>
          تسجيل الخروج
        </Button>
      </div>
    </header>
  )
}

export default Header
