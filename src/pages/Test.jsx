import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Send, Trophy, Zap } from 'lucide-react'
import { getTestQuestions, getTestResult, submitTest } from '../services/api'
import { BADGE_ICONS, DifficultyBadge, OptionButton, TopicIcon, topicName, useAnswerKeys } from '../components/ui'
import { useToast } from '../components/Toast'

export default function Test() {
  const { type } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [questions, setQuestions] = useState(null)
  const [needsPre, setNeedsPre] = useState(false)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forwards, -1 = backwards (for the slide animation)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setQuestions(null)
    setIndex(0)
    setAnswers({})
    if (type === 'post') {
      getTestResult('pre').then((pre) => (pre ? getTestQuestions('post').then(setQuestions) : setNeedsPre(true)))
    } else {
      getTestQuestions('pre').then(setQuestions)
    }
  }, [type])

  const q = questions?.[index]
  const isLast = questions && index === questions.length - 1

  const goTo = (i) => {
    if (!questions || i < 0 || i >= questions.length) return
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }

  const pick = (i) => {
    setAnswers((a) => ({ ...a, [q.id]: i }))
  }

  const submit = async () => {
    const missing = questions.length - Object.keys(answers).length
    if (missing && !confirm(`You have ${missing} unanswered question${missing > 1 ? 's' : ''}. Submit anyway?`)) return
    setSubmitting(true)
    // Unanswered questions are submitted as -1 (counted wrong)
    const full = Object.fromEntries(questions.map((x) => [x.id, answers[x.id] ?? -1]))
    const result = await submitTest(type, full)
    if (result.xpGained) toast({ title: `+${result.xpGained} XP`, text: 'Earned for completing the test.', icon: Zap, tone: 'amber' })
    for (const b of result.newBadges) {
      toast({ title: `Badge unlocked: ${b.name}`, text: b.description, icon: BADGE_ICONS[b.id] ?? Trophy, tone: 'emerald' })
    }
    navigate(`/results/${type}`)
  }

  useAnswerKeys({
    count: q?.options.length ?? 0,
    enabled: !!q && !submitting,
    onPick: pick,
    onKey: (e) => {
      if (e.key === 'ArrowRight') goTo(index + 1)
      else if (e.key === 'ArrowLeft') goTo(index - 1)
      else if (e.key === 'Enter' && answers[q.id] != null) {
        e.preventDefault()
        isLast ? submit() : goTo(index + 1)
      }
    },
  })

  if (type !== 'pre' && type !== 'post') return <Navigate to="/dashboard" replace />
  if (needsPre) return <Navigate to="/test/pre" replace />
  if (!questions) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="skeleton h-12 w-64" />
        <div className="skeleton mt-6 h-2" />
        <div className="skeleton mt-6 h-96" />
      </div>
    )
  }

  const answered = Object.keys(answers).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">{type === 'pre' ? 'Basic test' : 'Post-test'}</p>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Question {index + 1} <span className="text-slate-400">of {questions.length}</span>
          </h1>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
          {answered}/{questions.length} answered
        </p>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
          style={{ width: `${(answered / questions.length) * 100}%` }}
        />
      </div>

      <div key={q.id} className={`card p-6 sm:p-8 ${direction > 0 ? 'animate-slide-in' : 'animate-slide-in-left'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <TopicIcon topicId={q.topicId} size="sm" />
          <span className="text-sm font-semibold text-slate-600">{topicName(q.topicId)}</span>
          <DifficultyBadge level={q.difficulty} />
        </div>
        <h2 className="mt-4 text-lg font-bold sm:text-xl">{q.text}</h2>

        <div className="mt-6 grid gap-3">
          {q.options.map((opt, i) => (
            <OptionButton key={i} index={i} text={opt} state={answers[q.id] === i ? 'selected' : 'idle'} onClick={() => pick(i)} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button className="btn-ghost" disabled={index === 0} onClick={() => goTo(index - 1)}>
          <ArrowLeft size={16} /> Previous
        </button>
        <p className="hidden text-xs text-slate-400 sm:block">
          <kbd>A</kbd>–<kbd>D</kbd> to answer · <kbd>←</kbd> <kbd>→</kbd> to move · <kbd>Enter</kbd> next
        </p>
        {isLast ? (
          <button className="btn-primary" disabled={submitting} onClick={submit}>
            {submitting ? 'Submitting…' : <>Submit test <Send size={16} /></>}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => goTo(index + 1)}>
            Next <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Question navigator */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {questions.map((x, i) => (
          <button
            key={x.id}
            onClick={() => goTo(i)}
            className={`h-9 w-9 rounded-lg text-sm font-semibold transition hover:-translate-y-0.5 ${
              i === index
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : answers[x.id] != null
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-surface text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
            aria-label={`Go to question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
