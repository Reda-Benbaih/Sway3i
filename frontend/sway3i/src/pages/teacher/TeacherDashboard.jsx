import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import LessonItem from '../../components/teachers/LessonItem'
import TeacherBookingActions from '../../components/teachers/TeacherBookingActions'
import { Alert, EmptyState, ErrorState, StatCard } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { enrollmentsApi, listingsApi, tutorsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { UPCOMING, loadEnrollmentsWithCourses, loadUpcomingSessions, slotOf } from '../../hooks/lessons'
import { formatDateLong, formatTime } from '../../utils/format'

export default function TeacherDashboard() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()

  const data = useAsync(async () => {
    const [profile, lessons, listings] = await Promise.all([
      tutorsApi.get(user.userId),
      loadEnrollmentsWithCourses(() => enrollmentsApi.byTutor(user.userId)),
      listingsApi.byTutor(user.userId),
    ])
    const courses = Object.fromEntries(listings.map((listing) => [listing.id, listing]))
    const sessions = await loadUpcomingSessions(listings.map((listing) => listing.id), courses)
    return { profile, ...lessons, listings, sessions }
  }, [user.userId])

  if (data.loading) return <PageLoader />
  if (data.error) return <ErrorState error={data.error} onRetry={data.reload} />

  const { profile, enrollments, courses, listings, sessions } = data.data
  const pending = enrollments.filter((e) => e.status === 'PENDING')
  const active = enrollments.filter((e) => UPCOMING.includes(e.status))
  const completed = enrollments.filter((e) => e.status === 'COMPLETED')
  const slotCount = listings.reduce((total, listing) => total + (listing.weeklySlots?.length || 0), 0)

  const checklist = [
    { done: Boolean(profile.biography), label: 'Write a short biography', to: '/teacher/profile' },
    { done: profile.subjects?.length > 0, label: 'Choose the subjects you teach', to: '/teacher/profile' },
    { done: profile.hourlyRate !== null && profile.hourlyRate !== undefined, label: 'Set your hourly rate', to: '/teacher/profile' },
    { done: Boolean(profile.city || profile.teachingZones), label: 'Add your city or teaching areas', to: '/teacher/profile' },
    { done: listings.length > 0, label: 'Publish your first course', to: '/teacher/courses' },
    { done: slotCount > 0, label: 'Add weekly time slots', to: '/teacher/courses' },
  ]
  const todo = checklist.filter((item) => !item.done)

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{user.firstName ? `Hello, ${user.firstName}` : 'Welcome back'}</h1>
          <p>Your teaching activity at a glance.</p>
        </div>
        <Link to="/teacher/courses" className="btn btn-primary">
          <Icon name="plus" size={18} /> New course
        </Link>
      </div>

      {!profile.isVerified && (
        <Alert type="warning" className="mb-24">
          <strong>Your profile is awaiting validation.</strong> Our team checks every teacher before their courses appear
          in the search. Complete your profile in the meantime so it can be approved quickly.
        </Alert>
      )}

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon="inbox" tone="warning" value={pending.length} label="Requests to answer" />
        <StatCard icon="users" value={active.length} label="Active students" />
        <StatCard icon="checkCircle" tone="success" value={completed.length} label="Completed courses" />
        <StatCard
          icon="star"
          tone="accent"
          value={profile.averageRating ? Number(profile.averageRating).toFixed(1) : '—'}
          label={`Average rating · ${profile.reviewCount || 0} review${profile.reviewCount === 1 ? '' : 's'}`}
        />
      </div>

      <div className="grid-2">
        <div className="stack" style={{ gap: 20 }}>
          <section className="card">
            <div className="card-header">
              <h2>Booking requests</h2>
              <Link to="/teacher/bookings" className="btn btn-ghost btn-sm">
                Manage all <Icon name="chevronRight" size={16} />
              </Link>
            </div>
            {pending.length === 0 ? (
              <EmptyState icon="inbox" title="You’re all caught up">
                New booking requests from students will appear here.
              </EmptyState>
            ) : (
              <div className="lesson-list">
                {pending.slice(0, 4).map((enrollment) => (
                  <LessonItem
                    key={enrollment.id}
                    enrollment={enrollment}
                    perspective="teacher"
                    slot={slotOf(enrollment, courses)}
                    actions={<TeacherBookingActions enrollment={enrollment} onChanged={data.reload} />}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Upcoming sessions</h2>
              <Link to="/teacher/schedule" className="btn btn-ghost btn-sm">
                Schedule <Icon name="chevronRight" size={16} />
              </Link>
            </div>
            {sessions.length === 0 ? (
              <EmptyState icon="calendar" title="No session planned" action="Plan a session" actionTo="/teacher/schedule">
                Plan dated sessions for your courses from the schedule page.
              </EmptyState>
            ) : (
              <ul className="session-list">
                {sessions.slice(0, 5).map((session) => (
                  <li key={session.id} className="session-row">
                    <div className="date-chip">
                      <strong>{new Date(`${session.date}T00:00:00`).getDate()}</strong>
                      <span>{new Date(`${session.date}T00:00:00`).toLocaleDateString('en-GB', { month: 'short' })}</span>
                    </div>
                    <div>
                      <strong>{session.course?.title || 'Session'}</strong>
                      <span className="text-soft text-sm">
                        {formatDateLong(session.date)} · {formatTime(session.startTime)}–{formatTime(session.endTime)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <section className="card">
            <div className="card-header">
              <h2>Your profile</h2>
              <span className="text-soft text-sm">
                {checklist.length - todo.length}/{checklist.length} done
              </span>
            </div>
            <div className="card-body stack">
              <div className="progress" aria-hidden="true">
                <span style={{ width: `${((checklist.length - todo.length) / checklist.length) * 100}%` }} />
              </div>
              <ul className="checklist">
                {checklist.map((item) => (
                  <li key={item.label} className={item.done ? 'done' : ''}>
                    <Icon name={item.done ? 'checkCircle' : 'alert'} size={18} />
                    {item.done ? <span>{item.label}</span> : <Link to={item.to}>{item.label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Your courses</h2>
              <Link to="/teacher/courses" className="btn btn-ghost btn-sm">
                Manage <Icon name="chevronRight" size={16} />
              </Link>
            </div>
            {listings.length === 0 ? (
              <EmptyState icon="bookOpen" title="No course yet" action="Create a course" actionTo="/teacher/courses">
                Publish a course so students can book you.
              </EmptyState>
            ) : (
              <ul className="mini-list">
                {listings.slice(0, 5).map((listing) => (
                  <li key={listing.id}>
                    <div>
                      <strong>{listing.title}</strong>
                      <span className="text-soft text-sm">
                        {listing.subjectName} · {listing.weeklySlots?.length || 0} slot{listing.weeklySlots?.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <span className={`badge ${listing.isActive ? 'badge-success' : ''}`}>{listing.isActive ? 'Open' : 'Hidden'}</span>
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
