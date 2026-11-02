import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import { getProgress, getSubjects, getTopics } from '../services/api'
import { PageHeader, PageSkeleton, ProgressBar, TopicIcon } from '../components/ui'

export default function Practice() {
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    getProgress().then(setProgress)
  }, [])

  if (!progress) return <PageSkeleton />
  const { pre, mastery, weakTopics, attempts } = progress

  return (
    <>
      <PageHeader title="Practice" subtitle="Pick a topic. Questions adapt to your answers as you go." />

      {!pre && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-200 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <Info size={18} /> Take the basic test first so we can recommend topics and starting difficulty.
          </span>
          <Link to="/test/pre" className="btn-primary">Take test</Link>
        </div>
      )}

      {getSubjects().map((s) => (
        <section key={s.id} className="mb-8">
          <h2 className="mb-4 text-xs font-bold tracking-wider text-slate-400 uppercase">{s.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getTopics()
              .filter((t) => t.subjectId === s.id)
              .map((t, i) => {
                const weak = weakTopics.includes(t.id)
                const count = attempts.filter((a) => a.topicId === t.id).length
                return (
                  <Link
                    key={t.id}
                    to={`/practice/${t.id}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className={`card group flex animate-fade-in flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-600/5 ${
                      weak ? 'ring-2 ring-rose-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="transition duration-300 group-hover:scale-110 group-hover:-rotate-6">
                        <TopicIcon topicId={t.id} />
                      </span>
                      {weak && (
                        <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                          Needs work
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 font-bold">{t.name}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{count} question{count === 1 ? '' : 's'} practised</p>
                    <div className="mt-auto pt-5">
                      {mastery[t.id] != null ? (
                        <>
                          <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                            <span>Mastery</span>
                            <span>{mastery[t.id]}%</span>
                          </div>
                          <ProgressBar value={mastery[t.id]} />
                        </>
                      ) : (
                        <p className="text-xs text-slate-400">Not assessed yet</p>
                      )}
                      <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-600 transition-all group-hover:gap-2">
                        Start practice <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                )
              })}
          </div>
        </section>
      ))}
    </>
  )
}
