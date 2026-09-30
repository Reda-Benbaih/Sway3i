import Avatar from '../../components/ui/Avatar'
import { Stars } from '../../components/ui/Stars'
import { EmptyState, ErrorState } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { reviewsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDate } from '../../utils/format'

export default function TeacherReviews() {
  useDocumentTitle('Reviews')
  const { user } = useAuth()
  const reviews = useAsync(() => reviewsApi.byTutor(user.userId), [user.userId])

  if (reviews.loading) return <PageLoader />
  if (reviews.error) return <ErrorState error={reviews.error} onRetry={reviews.reload} />

  const list = [...reviews.data].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  const average = list.length ? list.reduce((total, review) => total + review.rating, 0) / list.length : 0
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: list.filter((review) => review.rating === star).length }))

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Reviews</h1>
          <p>What your students say after completing a course with you.</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState icon="star" title="No review yet">
            Students can rate a course once you mark it as completed in your booking requests.
          </EmptyState>
        </div>
      ) : (
        <div className="reviews-layout">
          <section className="card">
            <div className="card-body rating-summary">
              <div className="rating-big">{average.toFixed(1)}</div>
              <Stars value={average} size={20} />
              <p className="text-muted text-sm">
                Based on {list.length} review{list.length === 1 ? '' : 's'}
              </p>
              <ul className="rating-bars">
                {distribution.map((row) => (
                  <li key={row.star}>
                    <span>{row.star}★</span>
                    <div className="bar">
                      <span style={{ width: `${(row.count / list.length) * 100}%` }} />
                    </div>
                    <span className="text-soft">{row.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card">
            <ul className="review-list">
              {list.map((review) => (
                <li key={review.id} className="review-item">
                  <Avatar name={review.studentName || 'Student'} size="sm" />
                  <div>
                    <div className="row-between">
                      <strong>{review.studentName}</strong>
                      <span className="text-soft text-sm">{formatDate(review.publishedAt)}</span>
                    </div>
                    <Stars value={review.rating} size={14} />
                    {review.comment && <p className="review-comment">{review.comment}</p>}
                    <span className="text-soft text-sm">{review.courseTitle}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  )
}
