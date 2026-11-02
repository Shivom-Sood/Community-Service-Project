// ─────────────────────────────────────────────────────────────────────────────
// MOCK API LAYER
//
// Every screen in the app talks to the backend ONLY through the functions in
// this file. Right now they are backed by localStorage so the frontend runs on
// its own. BACKEND TEAM: replace the body of each function with the real
// Firebase / AI API calls and keep the same function names, arguments and
// return shapes — no UI code needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import { QUESTIONS, SUBJECTS, TOPICS } from '../data/questions'

const USERS_KEY = 'al_users'
const SESSION_KEY = 'al_session'
const dataKey = (email) => `al_data_${email}`

const WEAK_THRESHOLD = 60 // a topic scoring below this % is "weak"

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const currentEmail = () => read(SESSION_KEY, null)
const loadData = () => read(dataKey(currentEmail()), { pre: null, post: null, attempts: [] })
const saveData = (data) => write(dataKey(currentEmail()), data)

// ── Auth ─────────────────────────────────────────────────────────────────────
// BACKEND TEAM: Firebase Auth → createUserWithEmailAndPassword / signInWithEmailAndPassword / signOut

/** @returns {Promise<{name, email, grade}>} */
export async function signUp({ name, email, password, grade }) {
  await delay()
  const users = read(USERS_KEY, {})
  if (users[email]) throw new Error('An account with this email already exists.')
  users[email] = { name, email, password, grade }
  write(USERS_KEY, users)
  write(SESSION_KEY, email)
  return { name, email, grade }
}

/** @returns {Promise<{name, email, grade}>} */
export async function signIn({ email, password }) {
  await delay()
  const user = read(USERS_KEY, {})[email]
  if (!user || user.password !== password) throw new Error('Incorrect email or password.')
  write(SESSION_KEY, email)
  return { name: user.name, email: user.email, grade: user.grade }
}

export async function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

/** @returns {Promise<{name, email, grade} | null>} */
export async function getCurrentUser() {
  const email = currentEmail()
  const user = email && read(USERS_KEY, {})[email]
  return user ? { name: user.name, email: user.email, grade: user.grade } : null
}

// ── Content ──────────────────────────────────────────────────────────────────
// BACKEND TEAM: Firestore `subjects`, `topics`, `questions` collections

export function getSubjects() {
  return SUBJECTS
}

export function getTopics() {
  return TOPICS
}

/**
 * Questions for the diagnostic (pre) or final (post) test: one per difficulty
 * per topic. Pre and post use different questions so results are comparable.
 * Answers are stripped — grading happens in submitTest.
 */
export async function getTestQuestions(type) {
  await delay()
  const pick = type === 'pre' ? 0 : 2
  return TOPICS.flatMap((t) =>
    [1, 2, 3].map((d) => QUESTIONS.filter((q) => q.topicId === t.id && q.difficulty === d)[pick])
  ).map(({ answer, explanation, ...rest }) => rest)
}

/**
 * Grade a test and store the result.
 * @param {'pre'|'post'} type
 * @param {Record<string, number>} answers  questionId → selected option index
 * @returns {Promise<TestResult>}  { type, date, score, total, percent, byTopic, weakTopics }
 */
export async function submitTest(type, answers) {
  await delay(600)
  const byTopic = {}
  let score = 0
  let total = 0
  for (const [qid, selected] of Object.entries(answers)) {
    const question = QUESTIONS.find((q) => q.id === qid)
    const correct = question.answer === selected
    byTopic[question.topicId] ??= { correct: 0, total: 0 }
    byTopic[question.topicId].total++
    total++
    if (correct) {
      byTopic[question.topicId].correct++
      score++
    }
  }
  for (const t of Object.values(byTopic)) t.percent = Math.round((t.correct / t.total) * 100)
  const weakTopics = Object.entries(byTopic)
    .filter(([, t]) => t.percent < WEAK_THRESHOLD)
    .map(([id]) => id)

  const result = {
    type,
    date: new Date().toISOString(),
    score,
    total,
    percent: Math.round((score / total) * 100),
    byTopic,
    weakTopics,
  }
  const data = loadData()
  const before = computeStats(data)
  data[type] = result
  saveData(data)
  return { ...result, ...rewards(before, computeStats(data)) }
}

/** @returns {Promise<TestResult | null>} */
export async function getTestResult(type) {
  await delay(150)
  return loadData()[type]
}

// ── Adaptive practice ────────────────────────────────────────────────────────
// BACKEND TEAM: question selection could move server-side; attempts → Firestore `attempts`

/** Starting difficulty for a topic, based on the latest test score. */
export async function getStartingDifficulty(topicId) {
  const { pre, post } = loadData()
  const pct = (post ?? pre)?.byTopic?.[topicId]?.percent
  if (pct == null) return 2
  if (pct < 40) return 1
  if (pct < 75) return 2
  return 3
}

/** Next difficulty after an answer: up one when correct, down one when wrong. */
export function nextDifficulty(current, wasCorrect) {
  return Math.min(3, Math.max(1, current + (wasCorrect ? 1 : -1)))
}

/**
 * Pick a practice question for a topic at a given difficulty, avoiding ones
 * already seen this session. Includes answer + explanation for instant feedback.
 */
export async function getPracticeQuestion(topicId, difficulty, seenIds = []) {
  await delay(250)
  const pool = QUESTIONS.filter((q) => q.topicId === topicId)
  const unseen = pool.filter((q) => !seenIds.includes(q.id))
  const candidates = unseen.filter((q) => q.difficulty === difficulty)
  const list = candidates.length ? candidates : unseen.length ? unseen : pool
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * Save one practice answer.
 * @returns {Promise<{ xpGained, newBadges, levelUp }>}  rewards to show the student
 */
export async function recordAttempt({ topicId, questionId, difficulty, correct }) {
  const data = loadData()
  const before = computeStats(data)
  data.attempts.push({ topicId, questionId, difficulty, correct, date: new Date().toISOString() })
  saveData(data)
  return rewards(before, computeStats(data))
}

// ── AI ───────────────────────────────────────────────────────────────────────
// BACKEND TEAM: call the AI API here (send question text + topic, return a hint
// that guides without giving the answer away).

const HINTS = {
  algebra: 'Try isolating the variable — do the same operation on both sides of the equation.',
  geometry: 'Sketch the shape and write down the formula that links the values you are given.',
  fractions: 'Convert everything to a common denominator, or turn the percentage into a decimal first.',
  physics: 'List what you know (u, v, a, t, m) and pick the equation that uses exactly those.',
  chemistry: 'Think about what each particle or symbol represents, and count atoms on both sides.',
  biology: 'Recall which part of the cell performs this job — match the function to the structure.',
}

export async function getAIHint(question) {
  await delay(900)
  return HINTS[question.topicId] ?? 'Break the problem into smaller steps and eliminate options that are clearly wrong.'
}

// ── Gamification ─────────────────────────────────────────────────────────────
// BACKEND TEAM: these can stay computed on the client from the stored tests and
// attempts, or be stored on the user document if you prefer.

export const XP_PER_LEVEL = 100

/** XP for one practice answer: harder correct answers are worth more, wrong answers still earn a little. */
export const attemptXp = (difficulty, correct) => (correct ? difficulty * 10 : 2)
const TEST_XP_PER_CORRECT = 5

export const BADGES = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete the basic test', check: (d) => !!d.pre },
  { id: 'on-fire', name: 'On Fire', description: 'Get 5 answers right in a row', check: (d, s) => s.bestRun >= 5 },
  { id: 'challenger', name: 'Challenger', description: 'Answer 3 hard questions correctly', check: (d) => d.attempts.filter((a) => a.correct && a.difficulty === 3).length >= 3 },
  { id: 'explorer', name: 'Explorer', description: 'Practise all 6 topics', check: (d) => new Set(d.attempts.map((a) => a.topicId)).size >= TOPICS.length },
  { id: 'consistent', name: 'Consistent', description: 'Practise 3 days in a row', check: (d, s) => s.streak >= 3 },
  { id: 'dedicated', name: 'Dedicated', description: 'Answer 30 practice questions', check: (d) => d.attempts.length >= 30 },
  { id: 'master', name: 'Topic Master', description: 'Reach 90% mastery in a topic', check: (d, s) => Object.values(s.mastery).some((m) => m >= 90) },
  { id: 'comeback', name: 'Comeback', description: 'Beat your pre-test score in the post-test', check: (d) => !!d.post && d.post.percent > d.pre.percent },
]

const dayKey = (iso) => new Date(iso).toLocaleDateString('en-CA') // YYYY-MM-DD in local time

function computeMastery({ pre, post, attempts }) {
  const latest = post ?? pre
  const mastery = {}
  for (const t of TOPICS) {
    const testPct = latest?.byTopic?.[t.id]?.percent ?? null
    const recent = attempts.filter((a) => a.topicId === t.id).slice(-10)
    const practicePct = recent.length
      ? Math.round(
          (recent.reduce((s, a) => s + (a.correct ? a.difficulty : 0), 0) /
            recent.reduce((s, a) => s + a.difficulty, 0)) *
            100
        )
      : null
    mastery[t.id] =
      testPct == null && practicePct == null
        ? null
        : testPct == null
          ? practicePct
          : practicePct == null
            ? testPct
            : Math.round(testPct * 0.4 + practicePct * 0.6)
  }
  return mastery
}

function computeStats(data) {
  const { pre, post, attempts } = data
  const xp =
    attempts.reduce((s, a) => s + attemptXp(a.difficulty, a.correct), 0) +
    [pre, post].reduce((s, t) => s + (t ? t.score * TEST_XP_PER_CORRECT : 0), 0)

  // Longest and current run of correct practice answers
  let run = 0
  let bestRun = 0
  for (const a of attempts) {
    run = a.correct ? run + 1 : 0
    bestRun = Math.max(bestRun, run)
  }

  // Consecutive days with any activity, ending today (or yesterday)
  const days = new Set([...attempts.map((a) => a.date), pre?.date, post?.date].filter(Boolean).map(dayKey))
  const cursor = new Date()
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const mastery = computeMastery(data)
  const stats = {
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    levelProgress: xp % XP_PER_LEVEL,
    currentRun: run,
    bestRun,
    streak,
    activeToday: days.has(dayKey(new Date())),
    mastery,
  }
  stats.badges = BADGES.map(({ check, ...b }) => ({ ...b, earned: check(data, stats) }))
  return stats
}

function rewards(before, after) {
  const had = new Set(before.badges.filter((b) => b.earned).map((b) => b.id))
  return {
    xpGained: after.xp - before.xp,
    levelUp: after.level > before.level ? after.level : null,
    newBadges: after.badges.filter((b) => b.earned && !had.has(b.id)),
  }
}

// ── Progress ─────────────────────────────────────────────────────────────────

/**
 * Everything the dashboard and progress pages need.
 * mastery: topicId → 0–100, blending the latest test with recent practice
 * (harder questions answered correctly count for more).
 * Also: xp, level, levelProgress, streak, currentRun, bestRun, badges[].
 */
export async function getProgress() {
  await delay(200)
  const data = loadData()
  const stats = computeStats(data)
  const weakTopics = TOPICS.filter((t) => stats.mastery[t.id] != null && stats.mastery[t.id] < WEAK_THRESHOLD).map((t) => t.id)
  return { ...data, ...stats, weakTopics }
}
