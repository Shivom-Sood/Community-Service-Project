import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, ClipboardCheck, Flame, Lock, Target, TrendingUp, Trophy, Zap } from 'lucide-react'
import { useAuth } from '../services/AuthContext'
import { getProgress, getSubjects, getTopics, XP_PER_LEVEL } from '../services/api'
import { BADGE_ICONS, CountUp, PageHeader, PageSkeleton, ProgressBar, Ring, TopicIcon, topicName } from '../components/ui'

const POST_TEST_UNLOCK = 10 // practice questions recommended before the post-test

export default function Dashboard() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    getProgress().then(setProgress)
  }, [])

  if (!progress) return <PageSkeleton />

  const { pre, post, attempts, mastery, weakTopics, level, levelProgress, xp, streak, activeToday, badges } = progress
  const firstName = user.name.split(' ')[0]

  if (!pre) {
    return (
      <>
        <PageHeader title={`Hi ${firstName} 👋`} subtitle="Let's find out where you stand." />
        <div className="card relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-brand-500/20 to-violet-500/20 blur-3xl" />
          <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="grid h-12 w-12 animate-float place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-lg shadow-brand-600/30">
                <ClipboardCheck size={24} />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold tracking-tight">Take your basic test</h2>
              <p className="mt-2 max-w-xl text-slate-600">
                18 questions across 6 topics in Mathematics and Science. There's no time limit — we use your answers to
                find your weak topics and set the right starting difficulty for practice.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {getTopics().map((t, i) => (
                  <li key={t.id} className="flex animate-fade-in items-center gap-3 text-sm font-medium" style={{ animationDelay: `${i * 60}ms` }}>
                    <TopicIcon topicId={t.id} size="sm" /> {t.name}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/test/pre" className="btn-primary px-6 py-3 text-base">
              Start test <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </>
    )
  }

  const correct = attempts.filter((a) => a.correct).length
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0
  const suggested = weakTopics[0] ?? getTopics().reduce((lo, t) => (mastery[t.id] < mastery[lo.id] ? t : lo)).id
  const earned = badges.filter((b) => b.earned).length

  const stats = [
    { label: 'Pre-test score', value: pre.percent, suffix: '%', icon: ClipboardCheck, tint: 'bg-brand-50 text-brand-600' },
    { label: 'Questions practised', value: attempts.length, icon: Target, tint: 'bg-violet-50 text-violet-600' },
    { label: 'Practice accuracy', value: accuracy, suffix: '%', icon: TrendingUp, tint: 'bg-emerald-50 text-emerald-600', empty: !attempts.length },
    { label: 'Weak topics', value: weakTopics.length, icon: AlertTriangle, tint: 'bg-rose-50 text-rose-600' },
  ]

  return (
    <>
      <PageHeader title={`Hi ${firstName} 👋`} subtitle="Here's how you're doing across your topics." />

      {/* Level + next step */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600 p-6 text-white shadow-lg shadow-brand-600/20 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -bottom-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute top-6 right-1/3 h-24 w-24 rounded-full bg-violet-400/30 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <Ring value={(levelProgress / XP_PER_LEVEL) * 100} size={110} stroke={9} color="#fcd34d">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-white/70 uppercase">Level</p>
              <p className="text-3xl leading-none font-extrabold">{level}</p>
            </div>
          </Ring>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                <Zap size={15} className="fill-amber-300 text-amber-300" /> <CountUp value={xp} /> XP
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                <Flame size={15} className={activeToday ? 'fill-orange-400 text-orange-300' : 'text-white/60'} /> {streak}-day streak
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                <Trophy size={15} /> {earned}/{badges.length} badges
              </span>
            </div>
            <p className="mt-4 text-lg font-bold">
              {activeToday ? 'Nice — you have practised today.' : streak ? 'Practise today to keep your streak going!' : 'Start a streak by practising today.'}
            </p>
            <p className="text-white/75">
              {XP_PER_LEVEL - levelProgress} XP to level {level + 1}. Suggested next: <strong className="text-white">{topicName(suggested)}</strong>
            </p>
          </div>
          <Link
            to={`/practice/${suggested}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] dark:text-[#1d4ed8]"
          >
            Continue practice <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, suffix, icon: Icon, tint, empty }, i) => (
          <div key={label} className="card animate-fade-in p-5 transition hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${i * 70}ms` }}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}>
              <Icon size={18} />
            </span>
            <p className="mt-4 text-2xl font-extrabold">{empty ? '—' : <CountUp value={value} suffix={suffix} />}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold">Topic mastery</h2>
          <div className="mt-5 space-y-6">
            {getSubjects().map((s) => (
              <div key={s.id}>
                <p className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">{s.name}</p>
                <div className="space-y-2">
                  {getTopics()
                    .filter((t) => t.subjectId === s.id)
                    .map((t) => (
                      <Link
                        key={t.id}
                        to={`/practice/${t.id}`}
                        className="group -mx-2 flex items-center gap-4 rounded-xl px-2 py-2 transition hover:bg-slate-50"
                      >
                        <TopicIcon topicId={t.id} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex justify-between text-sm">
                            <span className="truncate font-medium">{t.name}</span>
                            <span className="text-slate-500">{mastery[t.id]}%</span>
                          </div>
                          <ProgressBar value={mastery[t.id]} />
                        </div>
                        <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <AlertTriangle size={18} className="text-rose-500" /> Focus areas
            </h2>
            {weakTopics.length ? (
              <ul className="mt-4 space-y-2">
                {weakTopics.map((id) => (
                  <li key={id}>
                    <Link
                      to={`/practice/${id}`}
                      className="group flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
                    >
                      {topicName(id)} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No weak topics right now — great work! Keep practising to stay sharp.</p>
            )}
          </div>

          <div className="card p-6">
            {post ? (
              <>
                <h2 className="flex items-center gap-2 font-bold">
                  <Trophy size={18} className="text-amber-500" /> Post-test complete
                </h2>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold">{post.percent}%</p>
                  <p className={`mt-1 text-sm font-semibold ${post.percent >= pre.percent ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {post.percent >= pre.percent ? '+' : ''}
                    {post.percent - pre.percent}% vs pre-test
                  </p>
                </div>
                <Link to="/progress" className="btn-ghost mt-5 w-full">
                  <TrendingUp size={16} /> Compare results
                </Link>
              </>
            ) : (
              <>
                <h2 className="flex items-center gap-2 font-bold">
                  <Trophy size={18} className="text-amber-500" /> Post-test
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Measure your improvement once you've practised. We recommend at least {POST_TEST_UNLOCK} questions first.
                </p>
                <ProgressBar value={Math.min(100, (attempts.length / POST_TEST_UNLOCK) * 100)} className="mt-4" />
                <p className="mt-1.5 text-xs text-slate-500">
                  {Math.min(attempts.length, POST_TEST_UNLOCK)}/{POST_TEST_UNLOCK} practice questions
                </p>
                <Link to="/test/post" className={`mt-5 w-full ${attempts.length >= POST_TEST_UNLOCK ? 'btn-primary' : 'btn-ghost'}`}>
                  Take post-test
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <Trophy size={18} className="text-amber-500" /> Badges
          </h2>
          <span className="text-sm text-slate-500">
            {earned} of {badges.length} unlocked
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {badges.map((b, i) => {
            const Icon = BADGE_ICONS[b.id] ?? Trophy
            return (
              <div
                key={b.id}
                title={b.description}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`group animate-fade-in rounded-xl border p-4 text-center transition hover:-translate-y-0.5 ${
                  b.earned ? 'border-amber-200 bg-amber-50' : 'border-dashed border-slate-200'
                }`}
              >
                <span
                  className={`mx-auto grid h-12 w-12 place-items-center rounded-full transition group-hover:scale-110 ${
                    b.earned ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {b.earned ? <Icon size={22} /> : <Lock size={18} />}
                </span>
                <p className={`mt-3 text-sm font-bold ${b.earned ? '' : 'text-slate-500'}`}>{b.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{b.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
