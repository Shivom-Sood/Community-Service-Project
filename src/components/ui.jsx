import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Atom,
  Award,
  Calendar,
  Compass,
  Crown,
  Flame,
  Loader2,
  Microscope,
  Percent,
  Rocket,
  Shapes,
  Sigma,
  Sparkles,
  Swords,
  TrendingUp,
} from 'lucide-react'
import { DIFFICULTY, TOPICS } from '../data/questions'

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-md shadow-brand-600/30 transition group-hover:rotate-6">
        <Sparkles size={18} />
      </span>
      <span className="text-lg font-extrabold tracking-tight">LearnPath</span>
    </Link>
  )
}

export function Spinner({ full }) {
  const icon = <Loader2 className="animate-spin text-brand-600" size={28} />
  return full ? <div className="grid min-h-[60vh] place-items-center">{icon}</div> : icon
}

/** Placeholder shown while a page loads its data. */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-56" />
      <div className="skeleton mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="skeleton h-80 lg:col-span-2" />
        <div className="skeleton h-80" />
      </div>
    </div>
  )
}

export function DifficultyBadge({ level }) {
  const d = DIFFICULTY[level]
  return (
    <span key={level} className={`inline-flex animate-pop items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${d.className}`}>
      {d.label}
    </span>
  )
}

/** Bar that fills in from zero when it first appears. */
export function ProgressBar({ value, className = '' }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(value ?? 0))
    return () => cancelAnimationFrame(id)
  }, [value])
  const color = value >= 75 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div className={`h-full rounded-full transition-all duration-700 ease-out ${color}`} style={{ width: `${width}%` }} />
    </div>
  )
}

/** Circular progress ring with content in the middle. */
export function Ring({ value, size = 120, stroke = 10, color = '#2563eb', children }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value))
    return () => cancelAnimationFrame(id)
  }, [value])
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (shown / 100) * c}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

/** Number that counts up to its value. */
export function CountUp({ value, duration = 900, suffix = '' }) {
  const [n, setN] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const begin = from.current
    let id
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(begin + (value - begin) * eased))
      if (t < 1) id = requestAnimationFrame(tick)
      else from.current = value
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [value, duration])
  return (
    <>
      {n}
      {suffix}
    </>
  )
}

export const topicName = (id) => TOPICS.find((t) => t.id === id)?.name ?? id

const TOPIC_ICONS = {
  algebra: Sigma,
  geometry: Shapes,
  fractions: Percent,
  physics: Rocket,
  chemistry: Atom,
  biology: Microscope,
}

const SUBJECT_TINTS = {
  math: 'bg-brand-50 text-brand-600',
  science: 'bg-emerald-50 text-emerald-600',
}

export function TopicIcon({ topicId, size = 'md' }) {
  const topic = TOPICS.find((t) => t.id === topicId)
  const Icon = TOPIC_ICONS[topicId] ?? Sparkles
  const box = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-11 w-11 rounded-xl'
  return (
    <span className={`grid shrink-0 place-items-center ${box} ${SUBJECT_TINTS[topic?.subjectId] ?? SUBJECT_TINTS.math}`}>
      <Icon size={size === 'sm' ? 16 : 20} />
    </span>
  )
}

export const BADGE_ICONS = {
  'first-steps': Rocket,
  'on-fire': Flame,
  challenger: Swords,
  explorer: Compass,
  dedicated: Award,
  comeback: TrendingUp,
  master: Crown,
  consistent: Calendar,
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

const LETTERS = ['A', 'B', 'C', 'D']

/** Answer option button shared by tests and practice. */
export function OptionButton({ index, text, state = 'idle', disabled, onClick, trailing }) {
  const styles = {
    idle: 'border-slate-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-slate-50',
    selected: 'border-brand-500 bg-brand-50 shadow-sm shadow-brand-600/10',
    correct: 'border-emerald-500 bg-emerald-50 animate-pop',
    wrong: 'border-rose-500 bg-rose-50',
    dimmed: 'border-slate-200 opacity-60',
  }
  const letter = {
    idle: 'bg-slate-100 text-slate-500',
    selected: 'bg-brand-600 text-white',
    correct: 'bg-emerald-500 text-white',
    wrong: 'bg-rose-500 text-white',
    dimmed: 'bg-slate-100 text-slate-500',
  }
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition duration-200 ${styles[state]}`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition ${letter[state]}`}>
        {LETTERS[index]}
      </span>
      <span className="flex-1 font-medium">{text}</span>
      {trailing}
    </button>
  )
}

/** Listen for A–D / 1–4 to pick an option, plus any extra keys. */
export function useAnswerKeys({ count, onPick, onKey, enabled = true }) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select')) return
      const k = e.key.toLowerCase()
      const idx = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k)
      if (idx >= 0 && idx < count && k.length === 1) {
        e.preventDefault()
        onPick?.(idx)
      } else {
        onKey?.(e)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
}
