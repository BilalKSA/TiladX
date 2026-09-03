import Logo from './Logo'
import CrossLink from './CrossLink'
import { APP_ORIGIN, SITE_ORIGIN } from '../lib/origins'
import { useLocalePath, useT } from '../i18n'
import BackgroundNoise from './ui/background-snippets-noise-effect11'
import { socials } from '../data/social'
import './Footer.css'

type LinkKey =
  | 'programs' | 'files' | 'signIn' | 'register'
  | 'about' | 'why' | 'mentors'
  | 'activate' | 'reset' | 'profile'

interface FooterLink {
  key: LinkKey
  href: string
  /** Which half of the product this lives on. The footer renders on both, so
   *  every row has to know whether it crosses a boundary. Only SITE_ORIGIN
   *  links take a locale prefix — the app is Arabic-only. */
  origin: string
}

type ColKey = 'platform' | 'tilad' | 'account'

const columns: { title: ColKey; links: FooterLink[] }[] = [
  {
    title: 'platform',
    links: [
      { key: 'programs', href: '/#programs', origin: SITE_ORIGIN },
      { key: 'files', href: '/files', origin: APP_ORIGIN },
      { key: 'signIn', href: '/login', origin: APP_ORIGIN },
      { key: 'register', href: '/register', origin: APP_ORIGIN },
    ],
  },
  {
    title: 'tilad',
    links: [
      { key: 'about', href: '/about', origin: SITE_ORIGIN },
      { key: 'why', href: '/why', origin: SITE_ORIGIN },
      { key: 'mentors', href: '/mentors', origin: SITE_ORIGIN },
    ],
  },
  {
    title: 'account',
    links: [
      { key: 'activate', href: '/activate', origin: APP_ORIGIN },
      { key: 'reset', href: '/reset-password', origin: APP_ORIGIN },
      { key: 'profile', href: '/profile', origin: APP_ORIGIN },
    ],
  },
]

function Footer() {
  const t = useT()
  const withLocale = useLocalePath()

  // Prefix same-site links with the active locale; leave app-origin links bare.
  const hrefFor = (link: FooterLink) => (link.origin === SITE_ORIGIN ? withLocale(link.href) : link.href)

  return (
    <footer className="tld-band tld-footer">
      <BackgroundNoise baseColor="transparent" spotlight={false} animated={false} patternAlpha={16} />

      <div className="tld-footer__inner">
        <div className="tld-footer__brand">
          <Logo variant="white" />
          <p>{t.footer.tagline}</p>
          <div className="tld-footer__socials">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="tld-footer__social"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <nav className="tld-footer__nav" aria-label={t.footer.navAria}>
          {columns.map((column) => (
            <div className="tld-footer__col" key={column.title}>
              <h3>{t.footer.cols[column.title]}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.key}>
                    <CrossLink origin={link.origin} to={hrefFor(link)}>
                      {t.footer.links[link.key]}
                    </CrossLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="tld-footer__bottom">
        <p>{t.footer.rights(new Date().getFullYear())}</p>

        {/* Both live on the marketing site, so they cross the boundary from
            inside the app — hence CrossLink rather than a router Link. */}
        <div className="tld-footer__legal">
          <CrossLink origin={SITE_ORIGIN} to={withLocale('/terms')}>
            {t.footer.terms}
          </CrossLink>
          <CrossLink origin={SITE_ORIGIN} to={withLocale('/privacy')}>
            {t.footer.privacy}
          </CrossLink>
        </div>
      </div>
    </footer>
  )
}

export default Footer
