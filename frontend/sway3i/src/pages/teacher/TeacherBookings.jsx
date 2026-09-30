import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Tabs from '../../components/ui/Tabs'
import Icon from '../../components/ui/Icon'
import Modal from '../../components/ui/Modal'
import LessonItem from '../../components/teachers/LessonItem'
import TeacherBookingActions from '../../components/teachers/TeacherBookingActions'
import { EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { enrollmentsApi, studentsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CLOSED, UPCOMING, loadEnrollmentsWithCourses, slotOf } from '../../hooks/lessons'
import { LEVELS, formatDate } from '../../utils/format'

const TABS = {
  pending: { label: 'New requests', statuses: ['PENDING'], empty: 'No request is waiting for your answer.' },
  active: { label: 'Upcoming & in progress', statuses: UPCOMING, empty: 'No confirmed course at the moment.' },
  completed: { label: 'Completed', statuses: ['COMPLETED'], empty: 'Completed courses will appear here.' },
  closed: { label: 'Declined & cancelled', statuses: CLOSED, empty: 'Nothing declined or cancelled.' },
}

function StudentDetails({ studentId, requestedAt, onClose }) {
  const student = useAsync(() => studentsApi.get(studentId), [studentId])
  const s = student.data
  return (
    <Modal open title="Student details" onClose={onClose}>
      {student.loading ? (
        <PageLoader />
      ) : student.error ? (
        <ErrorState error={student.error} />
      ) : (
        <ul className="detail-list">
          <li>
            <span>Name</span>
            <strong>
              {s.firstName} {s.lastName}
            </strong>
          </li>
          <li>
            <span>School level</span>
            <strong>{s.level ? LEVELS[s.level] : '—'}</strong>
          </li>
          <li>
            <span>School</span>
            <strong>{s.school || '—'}</strong>
          </li>
          <li>
            <span>City</span>
            <strong>{s.city || '—'}</strong>
          </li>
          <li>
            <span>Email</span>
            <strong>{s.email}</strong>
          </li>
          <li>
            <span>Phone</span>
            <strong>{s.phone || '—'}</strong>
          </li>
          <li>
            <span>Preferences</span>
            <strong>{s.preferences || '—'}</strong>
          </li>
          <li>
            <span>Requested on</span>
            <strong>{formatDate(requestedAt)}</strong>
          </li>
        </ul>
      )}
    </Modal>
  )
}

export default function TeacherBookings() {
  useDocumentTitle('Booking requests')
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'pending'
  const [details, setDetails] = useState(null)

  const data = useAsync(() => loadEnrollmentsWithCourses(() => enrollmentsApi.byTutor(user.userId)), [user.userId])
  const enrollments = data.data?.enrollments || []
  const visible = enrollments.filter((e) => TABS[tab].statuses.includes(e.status))

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Booking requests</h1>
          <p>Accept new students, follow your courses and mark them as completed.</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs
          label="Booking status"
          value={tab}
          onChange={(value) => setParams({ tab: value }, { replace: true })}
          tabs={Object.entries(TABS).map(([value, config]) => ({
            value,
            label: config.label,
            count: enrollments.filter((e) => config.statuses.includes(e.status)).length,
          }))}
        />
      </div>

      {data.loading ? (
        <div className="stack">
          <SkeletonCards count={3} height={120} />
        </div>
      ) : data.error ? (
        <div className="card">
          <ErrorState error={data.error} onRetry={data.reload} />
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState icon="inbox" title="Nothing here">
            {TABS[tab].empty}
          </EmptyState>
        </div>
      ) : (
        <div className="card lesson-list">
          {visible.map((enrollment) => (
            <LessonItem
              key={enrollment.id}
              enrollment={enrollment}
              perspective="teacher"
              slot={slotOf(enrollment, data.data.courses)}
              actions={
                <>
                  <TeacherBookingActions enrollment={enrollment} onChanged={data.reload} />
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDetails(enrollment)}>
                    <Icon name="user" size={14} /> Student
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {details && <StudentDetails studentId={details.studentId} requestedAt={details.requestedAt} onClose={() => setDetails(null)} />}
    </>
  )
}
