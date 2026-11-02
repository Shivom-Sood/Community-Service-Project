import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, ClipboardCheck, Flame, Search, Sparkles, Target, Trophy, Zap } from 'lucide-react'
import { useAuth } from '../services/AuthContext'
import { getTopics } from '../services/api'
import { Logo, ProgressBar, TopicIcon } from '../components/ui'
import { ThemeToggle } from '../components/Theme'

const STEPS = [
  { icon: ClipboardCheck, title: 'Take a basic test', text: 'A short diagnostic across Mathematics and Science topics.', tint: 'from-brand-500 to-brand-600' },
  { icon: Search, title: 'Find weak topics', text: 'We score every topic and highlight the ones that need work.', tint: 'from-rose-400 to-rose-500' },
  { icon: Target, title: 'Practice adaptively', text: 'Questions get harder when you are right and easier when you struggle.', tint: 'from-amber-400 to-orange-500' },
  { icon: BarChart3, title: 'See your growth', text: 'Compare pre-test and post-test results topic by topic.', tint: 'from-emerald-400 to-emerald-600' },
]

const PREVIEW = [
  ['algebra', 'Algebra', 82],
  ['geometry', 'Geometry', 45],
  ['physics', 'Motion & Force', 67],
  ['biology', 'Cells & Life', 90],
]

export default function Landing() {
  const { user } = useAuth()
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-20 -right-40 h-[32rem] w-[32rem] rounded-full bg-violet-500/15 blur-3xl" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
              <Link to="/signup" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
              <Sparkles size={13} /> Mathematics · Science
            </span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl">
              Practice that adapts to{' '}
              <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">how you learn</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-600">
              Every student learns differently. LearnPath finds your weak topics and gives you personalised practice at
              just the right difficulty — with XP, streaks and badges to keep you going.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? '/dashboard' : '/signup'} className="btn-primary px-6 py-3 text-base">
                Start the basic test <ArrowRight size={18} />
              </Link>
              {!user && <Link to="/login" className="btn-ghost px-6 py-3 text-base">I have an account</Link>}
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {getTopics().map((t) => (
                <span key={t.id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-surface py-1 pr-3 pl-1 text-xs font-semibold text-slate-600">
                  <TopicIcon topicId={t.id} size="sm" /> {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* Illustrative preview */}
          <div className="relative animate-fade-in [animation-delay:150ms]">
            <div className="card relative animate-float p-6 shadow-xl shadow-brand-600/10 sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">Your topic mastery</p>
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                  <Zap size={13} /> Level 4
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {PREVIEW.map(([id, name, v]) => (
                  <div key={id} className="flex items-center gap-3">
                    <TopicIcon topicId={id} size="sm" />
                    <div className="flex-1">
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-medium">{name}</span>
                        <span className="text-slate-500">{v}%</span>
                      </div>
                      <ProgressBar value={v} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
                <span className="font-semibold">Weak topic found:</span> Geometry — 6 practice questions ready.
              </div>
            </div>

            {/* Floating chips */}
            <div className="card absolute -top-5 -left-3 flex animate-float items-center gap-2 px-3 py-2 text-sm font-bold shadow-lg [animation-delay:-2s] sm:-left-8">
              <Flame size={18} className="fill-orange-400 text-orange-500" /> 7-day streak
            </div>
            <div className="card absolute -right-2 -bottom-6 flex animate-float items-center gap-2 px-3 py-2 text-sm font-bold shadow-lg [animation-delay:-4s] sm:-right-6">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Trophy size={14} />
              </span>
              Badge unlocked!
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">How it works</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-slate-500">Four simple steps from "I don't get it" to "I've got this".</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text, tint }, i) => (
              <div key={title} className="card group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition group-hover:scale-110 group-hover:-rotate-6 ${tint}`}>
                    <Icon size={20} />
                  </span>
                  <span className="text-sm font-bold text-slate-300">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative bg-slate-50 py-8 text-center text-sm text-slate-400">LearnPath · Adaptive Learning for Mathematics and Science</footer>
    </div>
  )
}
