import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Logo from '../../components/ui/Logo'
import { useAuth } from '../../context/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { dashboardPath } from '../../utils/session'

function StatusPage({ code, title, text, children }) {
  return (
    <div className="status-page">
      <div className="fade-up">
        <div className="row" style={{ justifyContent: 'center', marginBottom: 28 }}>
          <Logo />
        </div>
        <div className="code">{code}</div>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="row">{children}</div>
      </div>
    </div>
  )
}

export function NotFound() {
  useDocumentTitle('Page not found')
  const { user } = useAuth()
  return (
    <StatusPage code="404" title="This page does not exist" text="The link may be broken or the page may have been moved.">
      <Link to="/" className="btn btn-primary">
        <Icon name="home" size={18} /> Back to home
      </Link>
      {user ? (
        <Link to={dashboardPath(user.role)} className="btn">
          My dashboard
        </Link>
      ) : (
        <Link to="/teachers" className="btn">
          Find a teacher
        </Link>
      )}
    </StatusPage>
  )
}

export function Unauthorized() {
  useDocumentTitle('Access denied')
  const { user, logout } = useAuth()
  return (
    <StatusPage
      code="403"
      title="You don’t have access to this page"
      text="This area is reserved to another type of account. You can go back to your own space or log in with a different account."
    >
      {user && (
        <Link to={dashboardPath(user.role)} className="btn btn-primary">
          Go to my dashboard
        </Link>
      )}
      {user ? (
        <button type="button" className="btn" onClick={() => logout('/login')}>
          Switch account
        </button>
      ) : (
        <Link to="/login" className="btn btn-primary">
          Log in
        </Link>
      )}
    </StatusPage>
  )
}
