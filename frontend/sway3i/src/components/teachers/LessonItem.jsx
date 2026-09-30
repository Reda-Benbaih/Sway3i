import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Icon from '../ui/Icon'
import StatusBadge from '../ui/StatusBadge'
import { formatDate, formatPrice, slotLabel } from '../../utils/format'

export default function LessonItem({ enrollment, slot, perspective = 'student', actions, children, teacherLink }) {
  const person = perspective === 'student' ? enrollment.tutorName : enrollment.studentName
  return (
    <article className="lesson-item">
      <Avatar name={person || '?'} />
      <div className="lesson-item-main">
        <div className="row" style={{ gap: 8 }}>
          <h3>{enrollment.courseTitle}</h3>
          <StatusBadge status={enrollment.status} />
        </div>
        <p className="text-sm text-muted">
          {perspective === 'student' ? 'with ' : 'Student: '}
          {teacherLink && perspective === 'student' ? <Link to={teacherLink}>{person}</Link> : <strong>{person}</strong>}
        </p>
        <div className="meta-list">
          <span>
            <Icon name="calendar" size={16} /> {formatDate(enrollment.startDate)} → {formatDate(enrollment.endDate)}
          </span>
          {slot && (
            <span>
              <Icon name="clock" size={16} /> {slotLabel(slot)}
            </span>
          )}
          <span>
            <Icon name="wallet" size={16} /> {formatPrice(enrollment.monthlyPrice)} / month
          </span>
        </div>
        {enrollment.status === 'REJECTED' && enrollment.rejectionReason && (
          <p className="lesson-note">
            <Icon name="message" size={16} /> “{enrollment.rejectionReason}”
          </p>
        )}
        {children}
      </div>
      {actions && <div className="lesson-item-actions">{actions}</div>}
    </article>
  )
}
