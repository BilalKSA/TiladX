import { Link, useLocation } from 'react-router-dom'
import { Languages } from 'lucide-react'
import CrossLink from './CrossLink'
import { APP_ORIGIN } from '../lib/origins'
import { useLocale, useLocalePath, useT, localePath, stripLocale } from '../i18n'
import Logo from './Logo'

/** The floating bar every marketing-site page carries.
 *
 *  Lifted out of Landing when the site grew past one page, so the header is
 *  defined once. Fixed-position, so pages other than the landing need top
 *  padding to clear it — SiteLayout supplies that. */
function SiteHeader() {
  const t = useT()
  const locale = useLocale()
  const withLocale = useLocalePath()
  const location = useLocation()

  // The switch points at the same page in the other language. stripLocale gives
  // the bare (Arabic) path; from there we add or drop the "/en" prefix.
  const barePath = stripLocale(location.pathname)
  const otherHref = locale === 'ar' ? localePath('en', barePath) : barePath

  return (
    <header className="tld-marketing__header">
      <div className="tld-marketing__header-inner">
        <Link to={withLocale('/')} className="tld-marketing__brand" aria-label={t.header.brandAria}>
          <Logo />
        </Link>

        {/* Wordmark, the two auth actions, and the language switch. Order
            matters: under dir="rtl" the last flex child sits furthest left. */}
        <div className="tld-marketing__header-actions">
          {/* Hidden on phones — see marketing.css. The hero's own CTA and the
              footer both still reach sign-in there. The app is Arabic-only, so
              these keep their bare (unprefixed) paths. */}
          <CrossLink
            origin={APP_ORIGIN}
            to="/login"
            className="tld-button tld-button--secondary tld-button--sm tld-marketing__signin"
          >
            {t.header.signIn}
          </CrossLink>

          <CrossLink origin={APP_ORIGIN} to="/register" className="tld-button tld-button--primary tld-button--sm">
            {t.header.register}
          </CrossLink>

          {/* Same-origin language toggle. Renders the target language's short
              label so it reads as "go to English / go to Arabic". */}
          <Link to={otherHref} className="tld-marketing__lang" aria-label={t.header.langAria} title={t.header.langAria}>
            <Languages size={17} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
