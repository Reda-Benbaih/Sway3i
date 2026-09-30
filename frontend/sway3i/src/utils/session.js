const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

function safe(action) {
  try {
    return action()
  } catch {
    return null
  }
}

function storages() {
  return [safe(() => window.localStorage), safe(() => window.sessionStorage)].filter(Boolean)
}

export function saveSession(token, user, remember) {
  clearSession()
  safe(() => {
    const storage = remember ? window.localStorage : window.sessionStorage
    storage.setItem(TOKEN_KEY, token)
    storage.setItem(USER_KEY, JSON.stringify(user))
  })
}

export function updateStoredUser(user) {
  for (const storage of storages()) {
    if (safe(() => storage.getItem(TOKEN_KEY))) safe(() => storage.setItem(USER_KEY, JSON.stringify(user)))
  }
}

export function getToken() {
  for (const storage of storages()) {
    const token = safe(() => storage.getItem(TOKEN_KEY))
    if (token) return token
  }
  return null
}

export function getStoredUser() {
  for (const storage of storages()) {
    const raw = safe(() => storage.getItem(USER_KEY))
    if (raw) return safe(() => JSON.parse(raw))
  }
  return null
}

export function clearSession() {
  for (const storage of storages()) {
    safe(() => storage.removeItem(TOKEN_KEY))
    safe(() => storage.removeItem(USER_KEY))
  }
}

export function isTokenExpired(token) {
  const payload = safe(() => JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))))
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now()
}

export function dashboardPath(role) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'TUTOR') return '/teacher'
  return '/student'
}

export function safeNext(next, role) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null
  const area = next.split('/')[1]
  const allowed = { student: 'STUDENT', teacher: 'TUTOR', admin: 'ADMIN' }[area]
  if (allowed && allowed !== role) return null
  return next
}
