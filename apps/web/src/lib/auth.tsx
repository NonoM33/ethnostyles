import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'manager' | 'viewer'
}

interface Tenant {
  id: string
  name: string
  slug: string
}

interface AuthState {
  user: User | null
  tenant: Tenant | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (companyName: string, email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  refreshTenant: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('session_token')
    if (!token) {
      setState({ user: null, tenant: null, isLoading: false, isAuthenticated: false })
      return
    }

    try {
      const response = await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setState({
          user: data.user,
          tenant: data.tenant,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        localStorage.removeItem('session_token')
        setState({ user: null, tenant: null, isLoading: false, isAuthenticated: false })
      }
    } catch {
      localStorage.removeItem('session_token')
      setState({ user: null, tenant: null, isLoading: false, isAuthenticated: false })
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' }
      }

      localStorage.setItem('session_token', data.session.token)
      setState({
        user: data.user,
        tenant: data.tenant,
        isLoading: false,
        isAuthenticated: true,
      })

      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (companyName: string, email: string, password: string, name?: string) => {
    try {
      const response = await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' }
      }

      localStorage.setItem('session_token', data.session.token)
      setState({
        user: data.user,
        tenant: data.tenant,
        isLoading: false,
        isAuthenticated: true,
      })

      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    const token = localStorage.getItem('session_token')
    if (token) {
      try {
        await fetch(`${import.meta.env['VITE_API_URL'] || 'http://localhost:3000'}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // Ignore errors on logout
      }
    }

    localStorage.removeItem('session_token')
    setState({ user: null, tenant: null, isLoading: false, isAuthenticated: false })
  }

  const refreshTenant = useCallback(async () => {
    await checkSession()
  }, [checkSession])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, checkSession, refreshTenant }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
