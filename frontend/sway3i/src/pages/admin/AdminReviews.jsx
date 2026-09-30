import { useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { ConfirmDialog } from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { paginate } from '../../utils/paginate'
import { Stars } from '../../components/ui/Stars'
import { IconInput } from '../../components/ui/Field'
import { EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { useToast } from '../../hooks/useToast'
import { fromPage, reviewsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDate } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

const PAGE_SIZE = 12

export default function AdminReviews() {
  useDocumentTitle('Reviews')
  const toast = useToast()
  const [rating, setRating] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [deleting, setDeleting] = useState(null)

  const data = useAsync(() => reviewsApi.list({ size: 1000, sort: 'publishedAt,desc' }).then(fromPage), [])
  const query = search.trim().toLowerCase()
  const filtered = (data.data?.items || [])
    .filter((review) => !rating || review.rating === Number(rating))
    .filter((review) => !query || `${review.comment || ''} ${review.studentName} ${review.courseTitle}`.toLowerCase().includes(query))
  const { pageItems, totalPages, page: currentPage } = paginate(filtered, page, PAGE_SIZE)

  const remove = async () => {
    try {
      await reviewsApi.remove(deleting.id)
      toast.success('The review has been removed.')
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The review could not be removed.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Reviews</h1>
          <p>Moderate the reviews published by students. Removing a review updates the teacher’s rating.</p>
        </div>
      </div>

      <section className="card">
        <div className="table-toolbar">
          <select className="select" style={{ maxWidth: 200 }} value={rating} onChange={(event) => { setRating(event.target.value); setPage(0) }} aria-label="Filter by rating">
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
            ))}
          </select>
          <IconInput icon="search" placeholder="Search in comments, students or courses" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} aria-label="Search reviews" />
        </div>

        {data.loading ? (
          <div className="card-body stack"><SkeletonCards count={4} height={48} /></div>
        ) : data.error ? (
          <ErrorState error={data.error} onRetry={data.reload} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="message" title="No review found">
            {query || rating ? 'Try another search or filter.' : 'Reviews will appear here once students rate their courses.'}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Rating</th>
                    <th scope="col">Comment</th>
                    <th scope="col">Student</th>
                    <th scope="col">Course</th>
                    <th scope="col">Date</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((review) => (
                    <tr key={review.id}>
                      <td><Stars value={review.rating} size={14} /></td>
                      <td style={{ minWidth: 240 }}>{review.comment || <span className="text-soft">No comment</span>}</td>
                      <td>{review.studentName}</td>
                      <td>{review.courseTitle}</td>
                      <td>{formatDate(review.publishedAt)}</td>
                      <td>
                        <div className="cell-actions">
                          <Button size="sm" variant="ghost" onClick={() => setDeleting(review)} aria-label="Remove review">
                            <Icon name="trash" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} onChange={setPage} itemLabel="reviews" />
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove this review?"
        message="The review will be deleted and the teacher’s average rating recalculated."
        confirmLabel="Remove review"
        danger
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
