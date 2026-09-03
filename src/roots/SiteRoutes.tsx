import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { stripLocale } from '../i18n'
import Landing from '../pages/Landing'
import About from '../pages/About'
import WhyTilad from '../pages/WhyTilad'
import Mentors from '../pages/Mentors'
import Terms from '../pages/Terms'
import Privacy from '../pages/Privacy'
import Maintenance from '../pages/Maintenance'
import NotFound from '../pages/NotFound'

/** The marketing site's Arabic route table, defined with **relative** paths so
 *  it can be mounted at "/*" under a LocaleProvider. Keep this the single source
 *  of truth for site routes — SiteRoot and the combined App both use it.
 *
 *  Site-side only: it must never import an app page (see SiteRoot's note). */
export function SiteRoutes() {
  return (
    <Routes>
      <Route index element={<Landing />} />
      <Route path="landing" element={<Landing />} />
      <Route path="about" element={<About />} />
      <Route path="why" element={<WhyTilad />} />
      <Route path="mentors" element={<Mentors />} />
      <Route path="terms" element={<Terms />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="maintenance" element={<Maintenance />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

/** Redirects the current "/en/…" path to its Arabic (unprefixed) URL. */
function ToArabic() {
  const { pathname } = useLocation()
  return <Navigate to={stripLocale(pathname)} replace />
}

/** The English route table, mounted at "/en/*". A path is listed here only once
 *  its page is translated; everything else bounces to its Arabic URL rather
 *  than render Arabic content inside an LTR frame. Add routes here as pages get
 *  translated — the legal pages are next.
 *
 *  Note on /en/mentors: the page chrome is translated, but mentor names, titles
 *  and bios come from the `mentors` table, which holds one language only. Those
 *  fields will read Arabic under /en until the table grows a second set. */
export function EnSiteRoutes() {
  return (
    <Routes>
      <Route index element={<Landing />} />
      <Route path="landing" element={<Landing />} />
      <Route path="about" element={<About />} />
      <Route path="why" element={<WhyTilad />} />
      <Route path="mentors" element={<Mentors />} />
      <Route path="*" element={<ToArabic />} />
    </Routes>
  )
}

export default SiteRoutes
