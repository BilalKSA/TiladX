// Where each half of the product is served from.
//
// The same bundle is deployed to both origins; these decide which links have
// to cross. Unset (local dev, previews) they collapse to the current origin,
// so everything stays same-origin and client-side routing is unaffected.

const current = () => window.location.origin

/** Marketing site — the landing page. Production: https://tilad.org */
export const SITE_ORIGIN: string = import.meta.env.VITE_SITE_ORIGIN || current()

/** Signed-in app. Production: https://app.tilad.org */
export const APP_ORIGIN: string = import.meta.env.VITE_APP_ORIGIN || current()

export const appUrl = (path: string) => `${APP_ORIGIN}${path}`
export const siteUrl = (path: string) => `${SITE_ORIGIN}${path}`

/** True when that origin is the one we're currently served from. */
export const isCurrentOrigin = (origin: string) => origin === current()
