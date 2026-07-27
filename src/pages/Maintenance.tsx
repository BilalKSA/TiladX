import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import './Maintenance.css'

function Maintenance() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="tld-maintenance">
      <div className="tld-maintenance__card">
        <div className="tld-maintenance__panel">
          <div className="tld-maintenance__logo">
            <Logo />
          </div>

          <div className="tld-maintenance__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 1 21h22L12 3Z" />
              <path d="M12 9.5v5" />
              <path d="M12 17.5h.01" />
            </svg>
          </div>

          <h1>النظام تحت الصيانة</h1>

          <div className="tld-maintenance__notice">النظام في حالة الصيانة. يرجى المحاولة مرة أخرى لاحقًا.</div>

          <p className="tld-maintenance__body">
            نعمل جاهدين لإعادة الخدمة في أقرب وقت ممكن. نعتذر عن أي إزعاج قد سببناه لك.
          </p>

          <div className="tld-maintenance__actions">
            <button type="button" className="tld-button tld-button--secondary tld-button--md" onClick={() => window.location.reload()}>
              تحديث الصفحة
            </button>
            <Link to="/files" className="tld-button tld-button--primary tld-button--md">
              اتطلع على ملفاتك
            </Link>
          </div>

          <div className="tld-maintenance__status">
            <span className="tld-maintenance__status-dot" />
            <span>سنعود قريبًا</span>
            <span className="tld-maintenance__time">{now.toLocaleTimeString('ar-SA', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Maintenance
