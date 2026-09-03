import { useEffect, type ReactNode } from 'react'
import SiteHeader from './SiteHeader'
import Footer from './Footer'
import { useT } from '../i18n'
import '../pages/Home.css'
import '../styles/marketing.css'
import './SiteLayout.css'

interface SiteLayoutProps {
  /** Browser tab title. The brand name is appended in the active language.
   *  Omit on the landing page, which keeps the title set in index.html. */
  title?: string
  /** The landing hero runs full-bleed underneath the fixed header. Every other
   *  page starts with ordinary content and has to clear the bar instead. */
  flush?: boolean
  children: ReactNode
}

/** Chrome shared by every page of the marketing site: the light-only theme
 *  lock, the floating header, and the footer.
 *
 *  Site-side only. It must never import an app page — see the note in
 *  SiteRoot — and reaches the app through CrossLink, as SiteHeader does. */
function SiteLayout({ title, flush = false, children }: SiteLayoutProps) {
  // header.brandAria is the wordmark's accessible name in each language —
  // "تلاد" / "Tilad" — which is exactly the suffix the tab title wants.
  const brand = useT().header.brandAria

  // Light-only pages. They have no theme control of their own since the prefs
  // menu came out, and their surfaces — the grain bands, the maroon frame —
  // are tuned for the light palette. Force light while mounted, then hand the
  // user's own preference back on the way out.
  //
  // localStorage is deliberately untouched: that holds their real choice, so
  // ThemeToggle on every other page still reads it correctly.
  useEffect(() => {
    const root = document.documentElement
    const previous = root.getAttribute('data-theme')
    root.setAttribute('data-theme', 'light')

    return () => {
      if (previous === null) root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', previous)
    }
  }, [])

  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = `${title} — ${brand}`
    return () => {
      document.title = previous
    }
  }, [title, brand])

  return (
    <div className="tld-marketing">
      <SiteHeader />
      <main className={flush ? undefined : 'tld-site-main'}>{children}</main>
      <Footer />
    </div>
  )
}

export default SiteLayout
