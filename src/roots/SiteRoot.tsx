import { Routes, Route } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleProvider'
import SiteRoutes, { EnSiteRoutes } from './SiteRoutes'

/** Root for the marketing site (tilad.org).
 *
 *  Bilingual: English is served under "/en", Arabic (the default) at the bare
 *  paths, both rendering the same SiteRoutes table wrapped in the matching
 *  LocaleProvider. React Router ranks "/en/*" above "/*", so the prefix wins.
 *
 *  Deliberately does NOT import a single app page. This is what keeps the app
 *  — sign-in, the course pages, the admin panel — out of the bundle a landing
 *  visitor downloads. Adding an app import here silently undoes the split, so
 *  route people across with CrossLink instead. */
function SiteRoot() {
  return (
    <Routes>
      <Route
        path="/en/*"
        element={
          <LocaleProvider locale="en">
            <EnSiteRoutes />
          </LocaleProvider>
        }
      />
      <Route
        path="/*"
        element={
          <LocaleProvider locale="ar">
            <SiteRoutes />
          </LocaleProvider>
        }
      />
    </Routes>
  )
}

export default SiteRoot
