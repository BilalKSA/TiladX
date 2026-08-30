import { useEffect } from 'react'
import CrossLink from '../components/CrossLink'
import { SITE_ORIGIN, APP_ORIGIN } from '../lib/origins'
import Logo from '../components/Logo'
import BackgroundNoise from '../components/ui/background-snippets-noise-effect11'
import './NotFound.css'

// Catch-all for unmatched routes. Firebase rewrites every path to index.html,
// so an unknown URL arrives here with a 200 rather than a server 404 — without
// this route React Router matches nothing and renders a blank page.
//
// Shared by both bundles (SiteRoot + AppRoot), so it imports no app page and
// crosses origins with CrossLink: "home" is the marketing site, "sign in" is
// the app. It sits on a near-black maroon hero — the landing's grain surface —
// which is fixed across themes, so this screen needs no dark-mode CSS and looks
// identical wherever it lands.
function NotFound() {
  useEffect(() => {
    const previous = document.title
    document.title = 'الصفحة غير موجودة — تلاد'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className="tld-notfound tld-band tld-band--hero">
      <BackgroundNoise patternAlpha={18} animated={false} />

      <CrossLink origin={SITE_ORIGIN} to="/" className="tld-notfound__brand" aria-label="تلاد">
        <Logo variant="white" />
      </CrossLink>

      <div className="tld-notfound__inner">
        <div className="tld-notfound__copy">
          <p className="tld-notfound__code" aria-hidden="true">
            404
          </p>

          <h1>ضعنا في الطريق</h1>
          <p className="tld-notfound__body">
            الصفحة اللي تدوّر عليها مو موجودة — يمكن الرابط تغيّر أو فيه غلط بسيط في العنوان. رجّعناك للبداية
            وكمّل من هناك.
          </p>

          <div className="tld-notfound__actions">
            <CrossLink
              origin={SITE_ORIGIN}
              to="/"
              className="tld-button tld-button--on-primary tld-button--lg"
            >
              العودة للرئيسية
            </CrossLink>
            <CrossLink
              origin={APP_ORIGIN}
              to="/login"
              className="tld-button tld-button--lg tld-notfound__ghost"
            >
              تسجيل الدخول
            </CrossLink>
          </div>
        </div>

        <figure className="tld-notfound__art">
          <img src="/assets/mascot.png" alt="" aria-hidden="true" loading="lazy" />
        </figure>
      </div>
    </div>
  )
}

export default NotFound
