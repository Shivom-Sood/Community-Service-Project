import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Flame, LayoutDashboard, LogOut, Menu, Target, X, Zap } from 'lucide-react'
import { useAuth } from '../services/AuthContext'
import { getProgress, XP_PER_LEVEL } from '../services/api'
import { ThemeToggle } from './Theme'
import { Logo } from './ui'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/practice', label: 'Practice', icon: Target },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const { pathname } = useLocation()

  // Pages call this after earning XP so the sidebar stays current
  const refreshStats = useCallback(() => getProgress().then(setStats), [])

  useEffect(() => {
    window.scrollTo(0, 0)
    refreshStats()
  }, [pathname, refreshStats])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <Icon size={18} className="transition group-hover:scale-110" />
          {label}
        </NavLink>
      ))}
    </nav>
  )

  const xpCard = stats && (
    <div className="rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 p-4 text-white shadow-md shadow-brand-600/20">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-bold">
          <Zap size={16} className="fill-amber-300 text-amber-300" /> Level {stats.level}
        </span>
        <span className="flex items-center gap-1 font-semibold" title="Day streak">
          <Flame size={16} className={stats.activeToday ? 'fill-orange-400 text-orange-300' : 'text-white/50'} />
          {stats.streak}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-200 transition-all duration-700"
          style={{ width: `${(stats.levelProgress / XP_PER_LEVEL) * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-white/75">
        {stats.levelProgress}/{XP_PER_LEVEL} XP to level {stats.level + 1}
      </p>
    </div>
  )

  const userCard = (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-100 to-violet-100 text-sm font-bold text-brand-700">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{user.grade}</p>
      </div>
      <button onClick={handleLogout} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Log out">
        <LogOut size={16} />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-surface p-5 transition-colors duration-300 lg:flex">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Logo to="/dashboard" />
            <ThemeToggle />
          </div>
          {nav}
        </div>
        <div className="space-y-3">
          {xpCard}
          {userCard}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo to="/dashboard" />
        <div className="flex items-center gap-1">
          {stats && (
            <span className="mr-1 flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
              <Zap size={13} /> Lv {stats.level}
            </span>
          )}
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[61px] z-10 animate-fade-in space-y-4 border-b border-slate-200 bg-surface p-4 shadow-lg lg:hidden">
          {nav}
          {xpCard}
          {userCard}
        </div>
      )}

      <main key={pathname} className="mx-auto w-full max-w-6xl flex-1 animate-fade-in px-4 py-6 sm:px-8 sm:py-10">
        <Outlet context={{ refreshStats }} />
      </main>
    </div>
  )
}
