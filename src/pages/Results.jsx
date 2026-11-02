import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowRight, BarChart3, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react'
import { getTestResult, getTopics } from '../services/api'
import { CountUp, ProgressBar, Ring, TopicIcon, topicName } from '../components/ui'
import { celebrate } from '../components/celebrate'

export default function Results() {
  const { type } = useParams()
  const [result, setResult] = useState(undefined)
  const [pre, setPre] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getTestResult(type), type === 'post' ? getTestResult('pre') : null]).then(([r, p]) => {
      if (!active) return
      setResult(r)
      setPre(p)
      if (r && (r.percent >= 75 || (p && r.percent > p.percent))) setTimeout(celebrate, 500)
    })
    return () => {
      active = false
    }
  }, [type])

  if (result === undefined) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="skeleton h-96" />
        <div className="skeleton mt-6 h-80" />
      </div>
    )
  }
  if (!result) return <Navigate to="/dashboard" replace />

  const ringColor = result.percent >= 75 ? '#10b981' : result.percent >= 60 ? '#f59e0b' : '#f43f5e'
  const diff = pre ? result.percent - pre.percent : null

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card relative overflow-hidden p-6 text-center sm:p-10">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        <p className="relative text-sm font-semibold text-brand-600">{type === 'pre' ? 'Basic test' : 'Post-test'} results</p>
        <div className="relative mt-6 flex justify-center">
          <Ring value={result.percent} size={160} stroke={12} color={ringColor}>
            <div>
              <p className="text-4xl font-extrabold">
                <CountUp value={result.percent} suffix="%" />
              </p>
              <p className="text-xs text-slate-500">
                {result.score}/{result.total} correct
              </p>
            </div>
          </Ring>
        </div>
        {diff != null && (
          <p
            className={`relative mx-auto mt-4 inline-flex animate-pop items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
              diff >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {diff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {diff >= 0 ? '+' : ''}
            {diff}% vs pre-test
          </p>
        )}
        <h1 className="relative mt-5 text-2xl font-extrabold tracking-tight">
          {result.weakTopics.length === 0
            ? 'Excellent — no weak topics!'
            : `We found ${result.weakTopics.length} topic${result.weakTopics.length > 1 ? 's' : ''} to work on`}
        </h1>
        <p className="relative mt-2 text-slate-500">Practice will start each topic at a difficulty that matches your score.</p>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-bold">Topic breakdown</h2>
        <div className="mt-5 space-y-5">
          {getTopics().map((t, i) => {
            const r = result.byTopic[t.id]
            const weak = result.weakTopics.includes(t.id)
            return (
              <div key={t.id} className="flex animate-fade-in items-center gap-4" style={{ animationDelay: `${i * 70}ms` }}>
                <TopicIcon topicId={t.id} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      {t.name}
                      {weak ? <AlertTriangle size={14} className="text-rose-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                    </span>
                    <span className="text-slate-500">
                      {r.correct}/{r.total} · {r.percent}%
                    </span>
                  </div>
                  <ProgressBar value={r.percent} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {result.weakTopics.length > 0 ? (
          <Link to={`/practice/${result.weakTopics[0]}`} className="btn-primary flex-1 py-3">
            Practise {topicName(result.weakTopics[0])} <ArrowRight size={16} />
          </Link>
        ) : (
          <Link to="/practice" className="btn-primary flex-1 py-3">
            Go to practice <ArrowRight size={16} />
          </Link>
        )}
        <Link to={type === 'post' ? '/progress' : '/dashboard'} className="btn-ghost flex-1 py-3">
          {type === 'post' ? <><BarChart3 size={16} /> Compare with pre-test</> : 'Back to dashboard'}
        </Link>
      </div>
    </div>
  )
}
