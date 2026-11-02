import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import AuthShell, { Field } from '../components/AuthShell'

const GRADES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']

export default function Signup() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', grade: 'Class 8' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setError('')
    setBusy(true)
    try {
      await signup(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start with a short test to find your weak topics."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-600">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" required value={form.name} onChange={set('name')} />
        <Field label="Email" type="email" required value={form.email} onChange={set('email')} />
        <Field label="Password" type="password" required value={form.password} onChange={set('password')} />
        <Field label="Class">
          <select className="input" value={form.grade} onChange={set('grade')}>
            {GRADES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthShell>
  )
}
