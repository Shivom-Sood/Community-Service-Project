import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, Flame, Lightbulb, Loader2, RotateCcw, Sparkles, Trophy, XCircle, Zap } from 'lucide-react'
import {
  getAIHint,
  getPracticeQuestion,
  getStartingDifficulty,
  getTopics,
  nextDifficulty,
  recordAttempt,
} from '../services/api'
import { DIFFICULTY } from '../data/questions'
import { BADGE_ICONS, DifficultyBadge, OptionButton, Spinner, TopicIcon, topicName, useAnswerKeys } from '../components/ui'
import { useToast } from '../components/Toast'
import { burst, celebrate } from '../components/celebrate'

const SESSION_LENGTH = 6

export default function PracticeSession() {
  const { topicId } = useParams()
  const { refreshStats } = useOutletContext()
  const toast = useToast()
  const [difficulty, setDifficulty] = useState(null)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)
  const [history, setHistory] = useState([]) // [{ id, difficulty, correct }]
  const [hint, setHint] = useState(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [sessionXp, setSessionXp] = useState(0)
  const [floatXp, setFloatXp] = useState(null) // { key, amount } for the "+XP" animation
  const [run, setRun] = useState(0) // bump to restart the session
  const checkButton = useRef(null)

  const validTopic = getTopics().some((t) => t.id === topicId)

  useEffect(() => {
    if (!validTopic) return
    setHistory([])
    setSessionXp(0)
    setQuestion(null)
    getStartingDifficulty(topicId).then((d) => {
      setDifficulty(d)
      loadQuestion(d, [])
    })
  }, [topicId, run])

  const loadQuestion = async (d, seen) => {
    setQuestion(null)
    setSelected(null)
    setChecked(false)
    setHint(null)
    setQuestion(await getPracticeQuestion(topicId, d, seen))
  }

  const done = history.length >= SESSION_LENGTH && !checked
  const correct = checked && selected === question?.answer
  const next = checked ? nextDifficulty(difficulty, correct) : difficulty

  // Trailing run of correct answers in this session
  let sessionRun = 0
  for (let i = history.length - 1; i >= 0 && history[i].correct; i--) sessionRun++

  const check = async () => {
    if (selected == null || checked) return
    setFloatXp(null)
    setChecked(true)
    const isCorrect = selected === question.answer
    setHistory((h) => [...h, { id: question.id, difficulty, correct: isCorrect }])
    if (isCorrect) burst(checkButton.current)

    const reward = await recordAttempt({ topicId, questionId: question.id, difficulty, correct: isCorrect })
    setSessionXp((x) => x + reward.xpGained)
    setFloatXp({ key: Date.now(), amount: reward.xpGained })
    refreshStats()
    if (reward.levelUp) {
      toast({ title: `Level ${reward.levelUp} reached!`, text: 'Keep going — you are levelling up fast.', icon: Zap, tone: 'amber' })
    }
    for (const b of reward.newBadges) {
      toast({ title: `Badge unlocked: ${b.name}`, text: b.description, icon: BADGE_ICONS[b.id] ?? Trophy, tone: 'emerald' })
    }
  }

  const goNext = () => {
    setDifficulty(next)
    if (history.length >= SESSION_LENGTH) {
      setChecked(false)
      if (history.filter((h) => h.correct).length >= SESSION_LENGTH - 2) celebrate()
      return
    }
    loadQuestion(
      next,
      history.map((h) => h.id)
    )
  }

  const askHint = async () => {
    if (hint || hintLoading || checked) return
    setHintLoading(true)
    setHint(await getAIHint(question))
    setHintLoading(false)
  }

  useAnswerKeys({
    count: question?.options.length ?? 0,
    enabled: !!question && !done,
    onPick: (i) => !checked && setSelected(i),
    onKey: (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        checked ? goNext() : check()
      } else if (e.key.toLowerCase() === 'h') {
        askHint()
      }
    },
  })

  if (!validTopic) return <Navigate to="/practice" replace />

  if (done) {
    const score = history.filter((h) => h.correct).length
    const message =
      score === SESSION_LENGTH ? 'Perfect session!' : score >= SESSION_LENGTH - 2 ? 'Great work!' : score >= SESSION_LENGTH / 2 ? 'Nice effort!' : 'Keep practising!'
    return (
      <div className="mx-auto max-w-2xl animate-fade-in">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 to-violet-600 px-6 py-8 text-center text-white sm:py-10">
            <span className="mx-auto grid h-14 w-14 animate-pop place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Trophy size={26} />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{message}</h1>
            <p className="mt-1 text-white/80">{topicName(topicId)}</p>
            <div className="mt-6 flex justify-center gap-8">
              <div>
                <p className="text-4xl font-extrabold">
                  {score}
                  <span className="text-xl text-white/60">/{SESSION_LENGTH}</span>
                </p>
                <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">Correct</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-4xl font-extrabold">
                  <Zap size={26} className="fill-amber-300 text-amber-300" />
                  {sessionXp}
                </p>
                <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">XP earned</p>
              </div>
            </div>
          </div>

          <div className="p-6 text-center sm:p-8">
            <p className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">Your difficulty path</p>
            <div className="flex h-28 items-end justify-center gap-3">
              {history.map((h, i) => (
                <div key={i} className="flex animate-fade-in flex-col items-center gap-1.5" style={{ animationDelay: `${i * 80}ms` }}>
                  {h.correct ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                  <div
                    className={`w-8 rounded-t-lg ${h.difficulty === 3 ? 'bg-rose-400' : h.difficulty === 2 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ height: `${h.difficulty * 24}px` }}
                    title={DIFFICULTY[h.difficulty].label}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500">
              {[1, 2, 3].map((d) => (
                <span key={d} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-sm ${d === 3 ? 'bg-rose-400' : d === 2 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  {DIFFICULTY[d].label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setRun(run + 1)} className="btn-primary flex-1 py-3">
                <RotateCcw size={16} /> Practise again
              </button>
              <Link to="/practice" className="btn-ghost flex-1 py-3">Choose another topic</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TopicIcon topicId={topicId} />
          <div>
            <Link to="/practice" className="text-sm font-semibold text-brand-600 hover:text-brand-700">← All topics</Link>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{topicName(topicId)}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sessionRun >= 2 && (
            <span key={sessionRun} className="flex animate-pop items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
              <Flame size={14} className="fill-orange-400" /> {sessionRun} in a row
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: SESSION_LENGTH }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i < history.length
                    ? history[i].correct
                      ? 'w-6 bg-emerald-500'
                      : 'w-6 bg-rose-500'
                    : i === history.length
                      ? 'w-8 bg-brand-500'
                      : 'w-6 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {!question ? (
        <div className="card p-6 sm:p-8">
          <div className="skeleton h-6 w-20" />
          <div className="skeleton mt-5 h-7 w-3/4" />
          <div className="mt-6 grid gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14" />
            ))}
          </div>
        </div>
      ) : (
        <div
          key={question.id + (checked ? (correct ? '-right' : '-wrong') : '')}
          className={`card relative p-6 sm:p-8 ${checked ? (correct ? '' : 'animate-shake') : 'animate-slide-in'}`}
        >
          <div className="flex items-center justify-between gap-2">
            <DifficultyBadge level={difficulty} />
            {!checked && !hint && (
              <button
                onClick={askHint}
                disabled={hintLoading}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 disabled:opacity-60"
              >
                {hintLoading ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} />}
                {hintLoading ? 'Thinking…' : 'AI hint'}
              </button>
            )}
          </div>
          <h2 className="mt-4 text-lg font-bold sm:text-xl">{question.text}</h2>

          {hint && (
            <div className="mt-4 flex animate-fade-in gap-3 rounded-xl bg-violet-50 p-4 text-sm text-violet-900 ring-1 ring-violet-200">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-violet-500" />
              {hint}
            </div>
          )}

          <div className="mt-6 grid gap-3">
            {question.options.map((opt, i) => {
              const state = !checked
                ? i === selected
                  ? 'selected'
                  : 'idle'
                : i === question.answer
                  ? 'correct'
                  : i === selected
                    ? 'wrong'
                    : 'dimmed'
              return (
                <OptionButton
                  key={i}
                  index={i}
                  text={opt}
                  state={state}
                  disabled={checked}
                  onClick={() => setSelected(i)}
                  trailing={
                    state === 'correct' ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : state === 'wrong' ? (
                      <XCircle size={20} className="text-rose-500" />
                    ) : null
                  }
                />
              )
            })}
          </div>

          {checked && (
            <div className={`mt-6 animate-fade-in rounded-xl p-4 text-sm ${correct ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
              <p className="font-bold">{correct ? 'Correct!' : 'Not quite.'}</p>
              <p className="mt-1">{question.explanation}</p>
              {next !== difficulty && (
                <p className="mt-3 flex items-center gap-1.5 font-semibold">
                  {next > difficulty ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  Next question: {DIFFICULTY[next].label}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="hidden text-xs text-slate-400 sm:block">
              <kbd>A</kbd>–<kbd>D</kbd> to answer · <kbd>Enter</kbd> to {checked ? 'continue' : 'check'} · <kbd>H</kbd> for a hint
            </p>
            <div className="relative ml-auto">
              {floatXp && checked && (
                <span
                  key={floatXp.key}
                  className="pointer-events-none absolute -top-2 right-2 animate-float-up text-sm font-extrabold text-amber-500"
                >
                  +{floatXp.amount} XP
                </span>
              )}
              {checked ? (
                <button className="btn-primary" onClick={goNext}>
                  {history.length >= SESSION_LENGTH ? 'See summary' : 'Next question'} <ArrowRight size={16} />
                </button>
              ) : (
                <button ref={checkButton} className="btn-primary" disabled={selected == null} onClick={check}>
                  Check answer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
