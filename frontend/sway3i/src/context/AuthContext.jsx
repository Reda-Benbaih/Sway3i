import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/services'
import {
  clearSession,
  getStoredUser,
  getToken,
  isTokenExpired,
  saveSession,
  updateStoredUser,
} from '../utils/session'

const AuthContext = createContext(null)

function readInitialUser() {
  const token = getToken()
  if (!token || isTokenExpired(token)) {
    clearSession()
    return null
  }
  return getStoredUser()
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(readInitialUser)
  const [ready, setReady] = useState(() => !getToken())
  const [exitTo, setExitTo] = useState(null)

  const applyMe = useCallback((me) => {
    const nextUser = {
      userId: me.id,
      email: me.email,
      role: me.role,
      firstName: me.firstName,
      lastName: me.lastName,
    }
    updateStoredUser(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  useEffect(() => {
    if (!getToken()) return
    authApi
      .me()
      .then(applyMe)
      .catch((error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearSession()
          setUser(null)
        }
      })
      .finally(() => setReady(true))
  }, [applyMe])

  useEffect(() => {
    const onExpired = () => {
      if (window.location.pathname === '/login') return
      const next = encodeURIComponent(window.location.pathname + window.location.search)
      const target = `/login?expired=1&next=${next}`
      setExitTo({ from: window.location.pathname, to: target })
      setUser(null)
      navigate(target, { replace: true })
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [navigate])

  const startSession = useCallback(
    async (auth, remember = true) => {
      const baseUser = { userId: auth.userId, email: auth.email, role: auth.role }
      setExitTo(null)
      saveSession(auth.accessToken, baseUser, remember)
      setUser(baseUser)
      try {
        return applyMe(await authApi.me())
      } catch {
        return baseUser
      }
    },
    [applyMe],
  )

  const login = useCallback(
    async (email, password, remember) => startSession(await authApi.login({ email, password }), remember),
    [startSession],
  )

  const register = useCallback(
    async (role, payload) => {
      const auth = role === 'TUTOR' ? await authApi.registerTutor(payload) : await authApi.registerStudent(payload)
      return startSession(auth, true)
    },
    [startSession],
  )

  const loginWithGoogle = useCallback(
    async (credential, role) => startSession(await authApi.google({ token: credential, role: role || null }), true),
    [startSession],
  )

  const refreshUser = useCallback(async () => applyMe(await authApi.me()), [applyMe])

  const logout = useCallback(
    (redirectTo = '/') => {
      clearSession()
      setExitTo({ from: window.location.pathname, to: redirectTo })
      setUser(null)
      navigate(redirectTo, { replace: true })
    },
    [navigate],
  )

  const value = useMemo(
    () => ({ user, ready, exitTo, login, register, loginWithGoogle, refreshUser, logout }),
    [user, ready, exitTo, login, register, loginWithGoogle, refreshUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
