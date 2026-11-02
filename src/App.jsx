import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './services/AuthContext'
import Layout from './components/Layout'
import { Spinner } from './components/ui'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Test from './pages/Test'
import Results from './pages/Results'
import Practice from './pages/Practice'
import PracticeSession from './pages/PracticeSession'
import Progress from './pages/Progress'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner full />
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test/:type" element={<Test />} />
        <Route path="/results/:type" element={<Results />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:topicId" element={<PracticeSession />} />
        <Route path="/progress" element={<Progress />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
