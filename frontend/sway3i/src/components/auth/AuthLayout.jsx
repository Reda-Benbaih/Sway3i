import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'

const points = [
  'Teachers validated by our team before they appear in search',
  'Filter by subject, school level, price and location',
  'Book on the teacher’s weekly time slots',
  'Rate your teacher once the course is completed',
]

export default function AuthLayout({ children, wide, asideTitle = 'The right teacher makes all the difference.' }) {
  return (
    <div className="auth-shell">
      <div className="auth-main">
        <div className="auth-top">
          <Logo />
          <Link to="/" className="btn btn-ghost btn-sm">
            <Icon name="arrowLeft" size={16} /> Back to site
          </Link>
        </div>
        <div className={`auth-card fade-up${wide ? ' wide' : ''}`}>{children}</div>
      </div>
      <aside className="auth-aside" aria-hidden="true">
        <Logo light />
        <div>
          <h2>{asideTitle}</h2>
          <ul>
            {points.map((point) => (
              <li key={point}>
                <Icon name="checkCircle" size={20} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Private lessons from primary school to higher education.
        </p>
      </aside>
    </div>
  )
}

export function RoleCards({ value, onChange }) {
  const roles = [
    { value: 'STUDENT', icon: 'graduation', title: 'Student or parent', text: 'Find a teacher and book lessons.' },
    { value: 'TUTOR', icon: 'briefcase', title: 'Teacher', text: 'Publish your courses and manage bookings.' },
  ]
  return (
    <div className="role-cards" role="radiogroup" aria-label="Account type">
      {roles.map((role) => (
        <button
          key={role.value}
          type="button"
          role="radio"
          aria-checked={value === role.value}
          className="role-card"
          onClick={() => onChange(role.value)}
        >
          <span className="check">
            <Icon name="check" size={14} strokeWidth={3} />
          </span>
          <span className="icon-bubble">
            <Icon name={role.icon} size={22} />
          </span>
          <strong>{role.title}</strong>
          <span>{role.text}</span>
        </button>
      ))}
    </div>
  )
}

