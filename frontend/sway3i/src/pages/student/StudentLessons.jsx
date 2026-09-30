import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Tabs from '../../components/ui/Tabs'
import Icon from '../../components/ui/Icon'
import LessonItem from '../../components/teachers/LessonItem'
import ReviewDialog from '../../components/teachers/ReviewDialog'
import { ConfirmDialog } from '../../components/ui/Modal'
import { Stars } from '../../components/ui/Stars'
import { EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'
import { enrollmentsApi, reviewsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CLOSED, UPCOMING, loadEnrollmentsWithCourses, slotOf } from '../../hooks/lessons'
import { getErrorMessage } from '../../utils/errors'

const TABS = {
  upcoming: { label: 'Upcoming', statuses: UPCOMING, empty: 'No confirmed lesson yet.' },
  pending: { label: 'Pending', statuses: ['PENDING'], empty: 'You have no request waiting for an answer.' },
  completed: { label: 'Completed', statuses: ['COMPLETED'], empty: 'Completed courses will appear here.' },
  cancelled: { label: 'Cancelled', statuses: CLOSED, empty: 'No cancelled or declined request.' },
}

export default function StudentLessons() {
  useDocumentTitle('My lessons')
  const { user } = useAuth()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'upcoming'
  const [cancelling, setCancelling] = useState(null)
  const [reviewing, setReviewing] = useState(null)

  const data = useAsync(async () => {
    const lessons = await loadEnrollmentsWithCourses(() => enrollmentsApi.byStudent(user.userId))
    const completed = lessons.enrollments.filter((e) => e.status === 'COMPLETED')
    const reviews = await Promise.all(completed.map((e) => reviewsApi.byEnrollment(e.id).catch(() => null)))
    return { ...lessons, reviews: Object.fromEntries(completed.map((e, index) => [e.id, reviews[index]])) }
  }, [user.userId])

  const enrollments = data.data?.enrollments || []
  const counts = Object.fromEntries(
    Object.entries(TABS).map(([key, config]) => [key, enrollments.filter((e) => config.statuses.includes(e.status)).length]),
  )
  const visible = enrollments.filter((e) => TABS[tab].statuses.includes(e.status))

  const cancel = async () => {
    try {
      await enrollmentsApi.cancel(cancelling.id)
      toast.success('Your booking has been cancelled.')
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The booking could not be cancelled.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My lessons</h1>
          <p>Follow your booking requests and your courses.</p>
        </div>
        <Link to="/student/find" className="btn btn-primary">
          <Icon name="plus" size={18} /> Book a new course
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs
          label="Lesson status"
          value={tab}
          onChange={(value) => setParams({ tab: value }, { replace: true })}
          tabs={Object.entries(TABS).map(([value, config]) => ({ value, label: config.label, count: counts[value] }))}
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
          <EmptyState icon="calendar" title="Nothing here yet" action={tab === 'upcoming' ? 'Find a teacher' : undefined} actionTo="/student/find">
            {TABS[tab].empty}
          </EmptyState>
        </div>
      ) : (
        <div className="card lesson-list">
          {visible.map((enrollment) => {
            const review = data.data.reviews[enrollment.id]
            const canCancel = ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(enrollment.status)
            return (
              <LessonItem
                key={enrollment.id}
                enrollment={enrollment}
                slot={slotOf(enrollment, data.data.courses)}
                teacherLink={`/student/teachers/${enrollment.tutorId}`}
                actions={
                  <>
                    {enrollment.status === 'COMPLETED' && (
                      <button type="button" className={`btn btn-sm ${review ? '' : 'btn-primary'}`} onClick={() => setReviewing({ enrollment, review })}>
                        <Icon name={review ? 'edit' : 'star'} size={14} /> {review ? 'Edit review' : 'Rate teacher'}
                      </button>
                    )}
                    {canCancel && (
                      <button type="button" className="btn btn-sm btn-danger-soft" onClick={() => setCancelling(enrollment)}>
                        {enrollment.status === 'PENDING' ? 'Withdraw request' : 'Cancel course'}
                      </button>
                    )}
                  </>
                }
              >
                {review && (
                  <div className="lesson-review">
                    <Stars value={review.rating} size={14} />
                    {review.comment && <span>“{review.comment}”</span>}
                  </div>
                )}
              </LessonItem>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelling)}
        title={cancelling?.status === 'PENDING' ? 'Withdraw this request?' : 'Cancel this course?'}
        message={`“${cancelling?.courseTitle}” with ${cancelling?.tutorName} will move to your cancelled lessons. This cannot be undone.`}
        confirmLabel="Yes, cancel"
        danger
        onConfirm={cancel}
        onClose={() => setCancelling(null)}
      />

      {reviewing && (
        <ReviewDialog
          enrollment={reviewing.enrollment}
          review={reviewing.review}
          onClose={() => setReviewing(null)}
          onSaved={() => {
            toast.success('Thank you! Your review has been published.')
            setReviewing(null)
            data.reload()
          }}
        />
      )}
    </>
  )
}
