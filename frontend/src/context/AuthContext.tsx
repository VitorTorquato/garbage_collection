import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface User {
  id: number
  name: string
  email: string
}

interface AuthContextValue {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'gc_token'
const USER_KEY = 'gc_user'

function decodeTokenSub(token: string): number {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload.sub as number
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  )
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  })

  async function login(newToken: string) {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)

    const userId = decodeTokenSub(newToken)
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/users/${userId}`, {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    if (res.ok) {
      const profile = (await res.json()) as User
      localStorage.setItem(USER_KEY, JSON.stringify(profile))
      setUser(profile)
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
