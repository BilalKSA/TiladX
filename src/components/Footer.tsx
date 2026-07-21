import Logo from './Logo'
import './Footer.css'

const socials = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 3H21l-6.6 7.54L22.2 21h-6.2l-4.86-6.2L5.5 21H3.4l7.06-8.07L2.4 3h6.35l4.4 5.7L18.9 3Zm-1.08 16.2h1.72L7.29 4.7H5.45l12.37 14.5Z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 3c.3 1.9 1.6 3.4 3.5 3.7v2.6c-1.3 0-2.5-.4-3.5-1.1v6.4a5.6 5.6 0 1 1-5.6-5.6c.2 0 .4 0 .6.03v2.7a2.9 2.9 0 1 0 2.1 2.8V3h2.9Z" />
      </svg>
    ),
  },
]

function Footer() {
  return (
    <>
      <section className="tld-support">
        <div className="tld-support__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13a9 9 0 0 1 18 0" />
            <path d="M21 13v4a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3Z" />
            <path d="M3 13v4a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H3Z" />
          </svg>
        </div>
        <h2>محتاج مساعدة؟</h2>
        <p>إذا كنت تحتاج أي مساعدة تواصل مع فريق الدعم الفني</p>
        <div className="tld-support__actions">
          <a href="#" className="tld-button tld-button--secondary tld-button--md">
            تلجرام
          </a>
          <a href="#" className="tld-button tld-button--primary tld-button--md">
            واتساب
          </a>
        </div>
      </section>

      <footer className="tld-footer">
        <div className="tld-footer__brand">
          <Logo variant="white" />
          <p>من الطالب وإلى الطالب</p>
          <div className="tld-footer__socials">
            {socials.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label} className="tld-footer__social">
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="tld-footer__bottom">
          <p>جميع الحقوق محفوظة لمنصة تلاد &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  )
}

export default Footer
