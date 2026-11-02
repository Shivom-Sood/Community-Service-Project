import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CheckCircle2, TrendingDown, TrendingUp, XCircle } from 'lucide-react'
import { getProgress, getTopics } from '../services/api'
import { DIFFICULTY } from '../data/questions'
import { CountUp, DifficultyBadge, PageHeader, PageSkeleton, ProgressBar, TopicIcon, topicName } from '../components/ui'
import { useChartColors } from '../components/Theme'

const ROLLING_WINDOW = 6

export default function Progress() {
  const [progress, setProgress] = useState(null)
  const colors = useChartColors()

  useEffect(() => {
    getProgress().then(setProgress)
  }, [])

  if (!progress) return <PageSkeleton />
  const { pre, post, attempts, mastery } = progress

  if (!pre) {
    return (
      <>
        <PageHeader title="Progress" />
        <div className="card p-10 text-center">
          <p className="text-slate-500">Take the basic test to start tracking your progress.</p>
          <Link to="/test/pre" className="btn-primary mt-5">Take basic test</Link>
        </div>
      </>
    )
  }

  // If there is no post-test yet, compare the pre-test with current mastery instead
  const secondLabel = post ? 'Post-test' : 'Current mastery'
  const chartData = getTopics().map((t) => ({
    name: t.name.split(' ')[0],
    'Pre-test': pre.byTopic[t.id].percent,
    [secondLabel]: post ? post.byTopic[t.id].percent : mastery[t.id],
  }))
  const radarData = getTopics().map((t) => ({ topic: t.name.split(' ')[0], Mastery: mastery[t.id] ?? 0, 'Pre-test': pre.byTopic[t.id].percent }))

  // Accuracy over the last few answers, after each attempt
  const trend = attempts.map((_, i) => {
    const window = attempts.slice(Math.max(0, i - ROLLING_WINDOW + 1), i + 1)
    return { n: i + 1, Accuracy: Math.round((window.filter((a) => a.correct).length / window.length) * 100) }
  })

  const diff = post ? post.percent - pre.percent : null
  const byDifficulty = [1, 2, 3].map((d) => {
    const list = attempts.filter((a) => a.difficulty === d)
    return { d, total: list.length, pct: list.length ? Math.round((list.filter((a) => a.correct).length / list.length) * 100) : 0 }
  })

  const axisTick = { fontSize: 12, fill: colors.axis }
  const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: `1px solid ${colors.grid}`, background: colors.surface, color: colors.axis },
    formatter: (v) => `${v}%`,
  }

  return (
    <>
      <PageHeader
        title="Progress"
        subtitle={post ? 'Your pre-test and post-test results compared.' : 'Take the post-test to see your full before-and-after comparison.'}
        action={!post && <Link to="/test/post" className="btn-primary">Take post-test</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card animate-fade-in p-5">
          <p className="text-sm text-slate-500">Pre-test</p>
          <p className="mt-1 text-3xl font-extrabold"><CountUp value={pre.percent} suffix="%" /></p>
          <p className="mt-1 text-xs text-slate-400">{new Date(pre.date).toLocaleDateString()}</p>
        </div>
        <div className="card animate-fade-in p-5" style={{ animationDelay: '70ms' }}>
          <p className="text-sm text-slate-500">Post-test</p>
          <p className="mt-1 text-3xl font-extrabold">{post ? <CountUp value={post.percent} suffix="%" /> : '—'}</p>
          <p className="mt-1 text-xs text-slate-400">{post ? new Date(post.date).toLocaleDateString() : 'Not taken yet'}</p>
        </div>
        <div
          className={`card animate-fade-in p-5 ${diff == null ? '' : diff >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}
          style={{ animationDelay: '140ms' }}
        >
          <p className="text-sm text-slate-500">Improvement</p>
          <p className={`mt-1 flex items-center gap-2 text-3xl font-extrabold ${diff == null ? '' : diff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {diff == null ? '—' : <>{diff >= 0 ? <TrendingUp size={26} /> : <TrendingDown size={26} />}{diff >= 0 ? '+' : ''}{diff}%</>}
          </p>
          <p className="mt-1 text-xs text-slate-400">{attempts.length} practice questions in between</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <h2 className="font-bold">Topic comparison</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid vertical={false} stroke={colors.grid} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={axisTick} unit="%" width={44} />
                <Tooltip cursor={{ fill: colors.cursor }} {...tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="Pre-test" fill={colors.muted} radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={900} />
                <Bar dataKey={secondLabel} fill={colors.primary} radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold">Skill shape</h2>
          <p className="text-sm text-slate-500">Current mastery vs. where you started</p>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke={colors.grid} />
                <PolarAngleAxis dataKey="topic" tick={axisTick} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="Pre-test" stroke={colors.muted} fill={colors.muted} fillOpacity={0.35} />
                <Radar dataKey="Mastery" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} strokeWidth={2} animationDuration={900} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-bold">Practice accuracy trend</h2>
        <p className="text-sm text-slate-500">Rolling accuracy over your last {ROLLING_WINDOW} answers</p>
        {trend.length >= 2 ? (
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={colors.grid} />
                <XAxis dataKey="n" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={axisTick} unit="%" width={44} />
                <Tooltip {...tooltipStyle} labelFormatter={(n) => `Question ${n}`} />
                <Area type="monotone" dataKey="Accuracy" stroke="#10b981" strokeWidth={2.5} fill="url(#trendFill)" animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Answer a few practice questions to see your trend. <Link to="/practice" className="font-semibold text-brand-600">Start practising</Link>
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-bold">Accuracy by difficulty</h2>
          <div className="mt-5 space-y-5">
            {byDifficulty.map(({ d, total, pct }) => (
              <div key={d}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <DifficultyBadge level={d} />
                  <span className="text-slate-500">{total ? `${pct}% · ${total} answered` : 'No attempts yet'}</span>
                </div>
                <ProgressBar value={pct} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold">Recent practice</h2>
          {attempts.length ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {attempts.slice(-8).reverse().map((a, i) => (
                <li key={i} className="flex animate-fade-in items-center gap-3 py-2.5 text-sm" style={{ animationDelay: `${i * 40}ms` }}>
                  <TopicIcon topicId={a.topicId} size="sm" />
                  <span className="flex-1 font-medium">{topicName(a.topicId)}</span>
                  <span className="text-xs text-slate-400">{DIFFICULTY[a.difficulty].label}</span>
                  {a.correct ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-rose-500" />}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No practice yet. <Link to="/practice" className="font-semibold text-brand-600">Start practising</Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
