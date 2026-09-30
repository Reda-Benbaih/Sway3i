import { Link } from 'react-router-dom'
import Icon from './Icon'

export function Alert({ type = 'info', children, className = '' }) {
  const icon = { error: 'alert', success: 'checkCircle', warning: 'alert', info: 'info' }[type]
  return (
    <div className={`alert alert-${type} ${className}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} size={18} />
      <div>{children}</div>
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, children, action, actionTo, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={26} />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {action}
        </Link>
      )}
      {action && onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}

export function ErrorState({ error, onRetry, message }) {
  const text =
    message ||
    (error?.code === 'ERR_NETWORK'
      ? 'We cannot reach the server right now. Check that the backend is running and try again.'
      : error?.response?.data?.message || 'This content could not be loaded.')
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ background: 'var(--danger-100)', color: 'var(--danger-600)' }}>
        <Icon name="alert" size={26} />
      </div>
      <h3>Something went wrong</h3>
      <p>{text}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          <Icon name="refresh" size={16} /> Try again
        </button>
      )}
    </div>
  )
}

export function SkeletonCards({ count = 3, height = 180 }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton" style={{ height }} aria-hidden="true" />
      ))}
    </>
  )
}

export function StatCard({ icon, tone, value, label }) {
  return (
    <div className="card stat-card">
      <div className={`stat-icon ${tone || ''}`}>
        <Icon name={icon} size={22} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
