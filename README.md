# LearnPath — Adaptive Learning Web Application (Frontend)

Frontend for the *Adaptive Learning Web Application for Mathematics and Science* project.
Built with **React + Tailwind CSS** (Vite).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Landing page |
| `/signup`, `/login` | Account forms |
| `/dashboard` | Stats, topic mastery, weak topics, post-test card |
| `/test/pre`, `/test/post` | Basic (diagnostic) test and post-test — 18 questions, 6 topics |
| `/results/:type` | Score, per-topic breakdown, weak topics |
| `/practice` | Topic picker (weak topics highlighted) |
| `/practice/:topicId` | Adaptive practice: 6 questions, difficulty goes up when right and down when wrong, AI hint button |
| `/progress` | Pre-test vs post-test comparison chart, skill radar, accuracy trend, accuracy by difficulty, recent practice |

Also: light/dark mode, XP and levels, day streaks, 8 badges with unlock toasts, confetti, keyboard
shortcuts in tests and practice (`A`–`D` to answer, `Enter` to continue, `H` for a hint).

## For the backend team

The UI never touches storage directly. **Everything goes through `src/services/api.js`**, which is
currently a mock backed by `localStorage`. Replace the body of each function with Firebase / AI API
calls and keep the same names, arguments and return shapes:

| Function | Replace with |
| --- | --- |
| `signUp`, `signIn`, `signOut`, `getCurrentUser` | Firebase Auth (+ a `users` doc for name and class) |
| `getTestQuestions`, `getPracticeQuestion` | Firestore `questions` collection |
| `submitTest`, `getTestResult` | Firestore `testResults` (grading can move server-side) |
| `recordAttempt`, `getProgress` | Firestore `attempts` |
| XP, levels, streaks, badges | Computed in `computeStats` from tests + attempts — can stay client-side |
| `getAIHint` | AI API call — return a hint that does not reveal the answer |

`submitTest` and `recordAttempt` also return `{ xpGained, levelUp, newBadges }` so the UI can show
rewards — keep that in the return value if you move them to the server.

The question shape is documented at the top of `src/data/questions.js`. The sample questions there can
be used to seed the database.

`getCurrentUser` is called once on load. With Firebase, switch `AuthContext.jsx` to
`onAuthStateChanged` so the session stays in sync.
