import { createContext, useContext, useEffect, useState } from 'react'
import * as api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const value = {
    user,
    loading,
    login: async (creds) => setUser(await api.signIn(creds)),
    signup: async (details) => setUser(await api.signUp(details)),
    logout: async () => {
      await api.signOut()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
