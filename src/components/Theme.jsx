import { createContext, useContext, useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const THEME_KEY = 'al_theme'
const ThemeContext = createContext(null)

const initialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) return saved
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {}
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

/** Colours for charts, which take literal values rather than CSS classes. */
export function useChartColors() {
  const dark = useTheme().theme === 'dark'
  return {
    grid: dark ? '#273449' : '#e2e8f0',
    axis: dark ? '#94a3b8' : '#64748b',
    muted: dark ? '#3b4a63' : '#cbd5e1',
    cursor: dark ? '#1e293b' : '#f1f5f9',
    surface: dark ? '#131c2e' : '#ffffff',
    primary: dark ? '#3b82f6' : '#2563eb',
  }
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className={`grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      <span key={theme} className="animate-pop">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  )
}
