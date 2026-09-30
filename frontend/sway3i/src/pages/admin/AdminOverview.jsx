import { Link } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import StatusBadge from '../../components/ui/StatusBadge'
import { EmptyState, ErrorState, StatCard } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { enrollmentsApi, fromPage, reviewsApi, studentsApi, subjectsApi, tutorsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDate, fullName } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

export default function AdminOverview() {
  useDocumentTitle('Admin overview')
  const toast = useToast()

  const data = useAsync(async () => {
    const [students, tutors, pending, bookings, reviews, subjects] = await Promise.all([
      studentsApi.list({ size: 1 }).then(fromPage),
      tutorsApi.list({ size: 1 }).then(fromPage),
      tutorsApi.pending({ size: 5, sort: 'createdAt,desc' }).then(fromPage),
      enrollmentsApi.list({ size: 6, sort: 'requestedAt,desc' }).then(fromPage),
      reviewsApi.list({ size: 1 }).then(fromPage),
      subjectsApi.list({ size: 1 }).then(fromPage),
    ])
    return { students, tutors, pending, bookings, reviews, subjects }
  }, [])

  if (data.loading) return <PageLoader />
  if (data.error) return <ErrorState error={data.error} onRetry={data.reload} />

  const { students, tutors, pending, bookings, reviews, subjects } = data.data

  const approve = async (tutor) => {
    try {
      await tutorsApi.verify(tutor.id, true)
      toast.success(`${fullName(tutor)} is now validated.`)
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The teacher could not be validated.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Platform overview</h1>
          <p>Users, bookings and content waiting for your attention.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard icon="users" value={students.total} label="Students" />
        <StatCard icon="graduation" tone="accent" value={tutors.total} label="Teachers" />
        <StatCard icon="shield" tone="warning" value={pending.total} label="Awaiting validation" />
        <StatCard icon="clipboard" value={bookings.total} label="Bookings" />
        <StatCard icon="star" tone="success" value={reviews.total} label="Reviews" />
        <StatCard icon="layers" tone="accent" value={subjects.total} label="Subjects" />
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-header">
            <h2>Recent bookings</h2>
            <Link to="/admin/bookings" className="btn btn-ghost btn-sm">
              All bookings <Icon name="chevronRight" size={16} />
            </Link>
          </div>
          {bookings.items.length === 0 ? (
            <EmptyState icon="clipboard" title="No booking yet" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Course</th>
                    <th scope="col">Student</th>
                    <th scope="col">Requested</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.items.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.courseTitle}</strong>
                        <div className="text-soft text-sm">{booking.tutorName}</div>
                      </td>
                      <td>{booking.studentName}</td>
                      <td>{formatDate(booking.requestedAt)}</td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Teachers to validate</h2>
            <Link to="/admin/teachers?filter=pending" className="btn btn-ghost btn-sm">
              See all <Icon name="chevronRight" size={16} />
            </Link>
          </div>
          {pending.items.length === 0 ? (
            <EmptyState icon="shield" title="Nothing to validate">
              New teacher profiles will appear here.
            </EmptyState>
          ) : (
            <ul className="mini-list">
              {pending.items.map((tutor) => (
                <li key={tutor.id}>
                  <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
                    <Avatar name={fullName(tutor)} size="sm" />
                    <div>
                      <strong>{fullName(tutor)}</strong>
                      <span className="text-soft text-sm">{tutor.degree || tutor.email}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => approve(tutor)}>
                    Approve
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
