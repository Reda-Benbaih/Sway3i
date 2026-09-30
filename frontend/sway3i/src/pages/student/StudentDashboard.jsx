import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Avatar from '../../components/ui/Avatar'
import LessonItem from '../../components/teachers/LessonItem'
import { EmptyState, ErrorState, StatCard } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { enrollmentsApi, studentsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CLOSED, UPCOMING, loadEnrollmentsWithCourses, loadUpcomingSessions, slotOf } from '../../hooks/lessons'
import { LEVELS, formatDateLong, formatTime, fullName } from '../../utils/format'

export default function StudentDashboard() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()

  const data = useAsync(async () => {
    const [lessons, profile] = await Promise.all([
      loadEnrollmentsWithCourses(() => enrollmentsApi.byStudent(user.userId)),
      studentsApi.get(user.userId).catch(() => null),
    ])
    const activeCourseIds = lessons.enrollments.filter((e) => UPCOMING.includes(e.status)).map((e) => e.courseListingId)
    const sessions = await loadUpcomingSessions(activeCourseIds, lessons.courses)
    return { ...lessons, profile, sessions }
  }, [user.userId])

  if (data.loading) return <PageLoader />
  if (data.error) return <ErrorState error={data.error} onRetry={data.reload} />

  const { enrollments, courses, profile, sessions } = data.data
  const upcoming = enrollments.filter((e) => UPCOMING.includes(e.status))
  const pending = enrollments.filter((e) => e.status === 'PENDING')
  const completed = enrollments.filter((e) => e.status === 'COMPLETED')
  const closed = enrollments.filter((e) => CLOSED.includes(e.status))
  const name = fullName(user)

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{user.firstName ? `Hello, ${user.firstName}` : 'Welcome back'}</h1>
          <p>Here is what is happening with your lessons.</p>
        </div>
        <Link to="/student/find" className="btn btn-primary">
          <Icon name="search" size={18} /> Find a teacher
        </Link>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon="calendarCheck" value={upcoming.length} label="Active courses" />
        <StatCard icon="clock" tone="warning" value={pending.length} label="Pending requests" />
        <StatCard icon="checkCircle" tone="success" value={completed.length} label="Completed courses" />
        <StatCard icon="xCircle" tone="accent" value={closed.length} label="Cancelled or declined" />
      </div>

      <div className="grid-2">
        <div className="stack" style={{ gap: 20 }}>
          <section className="card">
            <div className="card-header">
              <h2>Upcoming lessons</h2>
              <Link to="/student/lessons" className="btn btn-ghost btn-sm">
                All lessons <Icon name="chevronRight" size={16} />
              </Link>
            </div>
            {sessions.length > 0 ? (
              <ul className="session-list">
                {sessions.slice(0, 5).map((session) => (
                  <li key={session.id} className="session-row">
                    <div className="date-chip">
                      <strong>{new Date(`${session.date}T00:00:00`).getDate()}</strong>
                      <span>{new Date(`${session.date}T00:00:00`).toLocaleDateString('en-GB', { month: 'short' })}</span>
                    </div>
                    <div>
                      <strong>{session.course?.title || 'Lesson'}</strong>
                      <span className="text-soft text-sm">
                        {formatDateLong(session.date)} · {formatTime(session.startTime)}–{formatTime(session.endTime)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : upcoming.length > 0 ? (
              <div className="lesson-list">
                {upcoming.slice(0, 3).map((enrollment) => (
                  <LessonItem
                    key={enrollment.id}
                    enrollment={enrollment}
                    slot={slotOf(enrollment, courses)}
                    teacherLink={`/student/teachers/${enrollment.tutorId}`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon="calendar" title="No upcoming lessons" action="Find a teacher" actionTo="/student/find">
                Once a teacher confirms one of your requests, your lessons will show up here.
              </EmptyState>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Pending requests</h2>
              <span className="badge badge-warning">{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <EmptyState icon="inbox" title="No pending request">
                Requests waiting for a teacher’s answer appear here.
              </EmptyState>
            ) : (
              <div className="lesson-list">
                {pending.slice(0, 3).map((enrollment) => (
                  <LessonItem
                    key={enrollment.id}
                    enrollment={enrollment}
                    slot={slotOf(enrollment, courses)}
                    teacherLink={`/student/teachers/${enrollment.tutorId}`}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <section className="card">
            <div className="card-body profile-summary">
              <Avatar name={name} size="lg" />
              <div>
                <strong>{name}</strong>
                <span className="text-soft text-sm">{user.email}</span>
              </div>
              <ul className="fact-list">
                <li>
                  <Icon name="graduation" size={18} /> {profile?.level ? LEVELS[profile.level] : 'Level not set'}
                </li>
                <li>
                  <Icon name="school" size={18} /> {profile?.school || 'School not set'}
                </li>
                <li>
                  <Icon name="heart" size={18} /> {profile?.preferences || 'No preferences yet'}
                </li>
              </ul>
              <Link to="/student/profile" className="btn btn-soft btn-block">
                {profile?.level ? 'Edit my profile' : 'Complete my profile'}
              </Link>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Recently completed</h2>
            </div>
            {completed.length === 0 ? (
              <EmptyState icon="award" title="Nothing completed yet">
                When a course is completed you can rate your teacher.
              </EmptyState>
            ) : (
              <ul className="mini-list">
                {completed.slice(0, 4).map((enrollment) => (
                  <li key={enrollment.id}>
                    <div>
                      <strong>{enrollment.courseTitle}</strong>
                      <span className="text-soft text-sm">with {enrollment.tutorName}</span>
                    </div>
                    <Link to="/student/lessons?tab=completed" className="btn btn-sm btn-soft">
                      Details
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
