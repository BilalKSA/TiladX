import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import Switch from './Switch'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('tld-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tld-theme', theme)
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <Switch
      value={isDark}
      onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      iconOn={<Moon size={14} strokeWidth={2} />}
      iconOff={<Sun size={14} strokeWidth={2} />}
      label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
    />
  )
}

export default ThemeToggle
