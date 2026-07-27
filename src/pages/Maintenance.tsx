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

      <a href="#" className="tld-maintenance__whatsapp" aria-label="تواصل عبر واتساب" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 14.3c-.3-.15-1.7-.85-2-.95-.27-.1-.46-.15-.66.15-.2.3-.75.95-.92 1.14-.17.2-.34.22-.63.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.1 4.5.71.3 1.27.48 1.7.62.71.22 1.36.19 1.87.11.57-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.13-.27-.2-.56-.35Z" />
          <path d="M12 2C6.48 2 2 6.36 2 11.75c0 1.94.58 3.75 1.58 5.28L2 22l5.16-1.5A10.1 10.1 0 0 0 12 21.5c5.52 0 10-4.36 10-9.75S17.52 2 12 2Zm0 17.7c-1.6 0-3.1-.44-4.38-1.2l-.31-.18-3.06.89.9-2.94-.2-.31A7.86 7.86 0 0 1 3.9 11.75C3.9 7.38 7.53 3.9 12 3.9s8.1 3.48 8.1 7.85-3.63 7.95-8.1 7.95Z" />
        </svg>
      </a>
    </div>
  )
}

export default Maintenance
