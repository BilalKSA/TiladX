import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import './NotFound.css'

// Catch-all for unmatched routes. Firebase rewrites every path to index.html,
// so an unknown URL arrives here with a 200 rather than a server 404 — without
// this route React Router matches nothing and renders a blank page.
function NotFound() {
  const { pathname } = useLocation()

  useEffect(() => {
    const previous = document.title
    document.title = 'الصفحة غير موجودة — تلاد'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className="tld-notfound">
      <div className="tld-notfound__card">
        <div className="tld-notfound__top">
          <ThemeToggle />
        </div>

        <div className="tld-notfound__logo">
          <Logo />
        </div>

        <div className="tld-notfound__code">
          <span aria-hidden="true">404</span>
        </div>

        <h1>الصفحة مو موجودة</h1>
        <p className="tld-notfound__body">
          يمكن الرابط تغيّر، أو فيه غلط بسيط في العنوان. جرّب ترجع للرئيسية وتبدأ من هناك.
        </p>

        <code className="tld-notfound__path" dir="ltr">
          {pathname}
        </code>

        <div className="tld-notfound__actions">
          <Link to="/" className="tld-button tld-button--primary tld-button--md">
            العودة للرئيسية
          </Link>
          <Link to="/login" className="tld-button tld-button--secondary tld-button--md">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
