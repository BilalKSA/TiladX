import { createContext, useContext } from 'react'
import { messages, type Messages } from './messages'

// Locale support for the marketing site. Arabic is the default and lives at the
// bare paths ("/", "/about", …); English is served under a "/en" prefix. Only
// the site is bilingual — the signed-in app stays Arabic-only, so nothing here
// reaches into AppRoot.
//
// The <LocaleProvider> component lives in its own file (LocaleProvider.tsx) so
// this module exports only hooks/helpers — keeps React Fast Refresh happy.

export type Locale = 'ar' | 'en'

export const LocaleContext = createContext<Locale>('ar')

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

/** Prefixes a site-internal path with the locale segment. Arabic (default)
 *  stays unprefixed so existing URLs never change; English gets "/en". Pass
 *  only same-site paths — app-origin links (login, register, …) are Arabic-only
 *  and must not be prefixed. */
export function localePath(locale: Locale, path: string): string {
  if (locale === 'ar') return path
  if (path === '/') return '/en'
  return `/en${path}`
}

export function useLocalePath(): (path: string) => string {
  const locale = useLocale()
  return (path: string) => localePath(locale, path)
}

/** The given path with any locale prefix removed — i.e. its Arabic URL. */
export function stripLocale(pathname: string): string {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3)
  return pathname
}

/** The messages object for the active locale. */
export function useT(): Messages {
  return messages[useLocale()]
}
