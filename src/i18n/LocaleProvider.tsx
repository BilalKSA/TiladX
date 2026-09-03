import { useEffect, type ReactNode } from 'react'
import { LocaleContext, type Locale } from './index'

/** Wraps a subtree in a locale. Also owns `<html lang/dir>`: it sets them on
 *  mount and restores the previous values on unmount, so leaving "/en" (whose
 *  pages have this provider) hands an Arabic page — which has no provider —
 *  back to the RTL defaults shipped in index.html. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement
    const prevLang = root.getAttribute('lang')
    const prevDir = root.getAttribute('dir')

    root.setAttribute('lang', locale)
    root.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')

    return () => {
      if (prevLang === null) root.removeAttribute('lang')
      else root.setAttribute('lang', prevLang)
      if (prevDir === null) root.removeAttribute('dir')
      else root.setAttribute('dir', prevDir)
    }
  }, [locale])

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}
