import Logo from './Logo'
import { socials } from '../data/social'
import './Footer.css'

function Footer() {
  return (
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
  )
}

export default Footer
