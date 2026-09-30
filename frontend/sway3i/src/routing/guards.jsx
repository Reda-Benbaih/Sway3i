import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import { dashboardPath } from '../utils/session'

export function ProtectedRoute({ roles }) {
  const { user, ready, exitTo } = useAuth()
  const location = useLocation()

  if (!ready) return <PageLoader label="Checking your session" />

  if (!user) {
    if (exitTo?.from === location.pathname) return <Navigate to={exitTo.to} replace />
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { user, ready } = useAuth()
  if (!ready) return <PageLoader />
  if (user) return <Navigate to={dashboardPath(user.role)} replace />
  return <Outlet />
}

export function DashboardRedirect() {
  const { user, ready } = useAuth()
  if (!ready) return <PageLoader />
  return <Navigate to={user ? dashboardPath(user.role) : '/login'} replace />
}
