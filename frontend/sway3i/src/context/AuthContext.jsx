import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const storeSession = (data) => {
    const loggedUser = { userId: data.userId, email: data.email, role: data.role }
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('user', JSON.stringify(loggedUser))
    setUser(loggedUser)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    storeSession(data)
  }

  const register = async (role, payload) => {
    const endpoint = role === 'STUDENT' ? '/auth/register/student' : '/auth/register/tutor'
    const { data } = await api.post(endpoint, payload)
    storeSession(data)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
