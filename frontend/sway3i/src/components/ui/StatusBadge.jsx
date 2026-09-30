const ENROLLMENT = {
  PENDING: ['Pending', 'warning'],
  CONFIRMED: ['Confirmed', 'info'],
  ACTIVE: ['In progress', 'brand'],
  COMPLETED: ['Completed', 'success'],
  REJECTED: ['Declined', 'danger'],
  CANCELLED: ['Cancelled', 'danger'],
}

const SESSION = {
  SCHEDULED: ['Scheduled', 'info'],
  DONE: ['Done', 'success'],
  CANCELLED: ['Cancelled', 'danger'],
}

export default function StatusBadge({ status, kind = 'enrollment' }) {
  const map = kind === 'session' ? SESSION : ENROLLMENT
  const [label, tone] = map[status] || [status, 'default']
  return <span className={`badge badge-dot badge-${tone}`}>{label}</span>
}

export function VerifiedBadge({ verified }) {
  return verified ? (
    <span className="badge badge-success badge-dot">Verified</span>
  ) : (
    <span className="badge badge-warning badge-dot">Awaiting validation</span>
  )
}
