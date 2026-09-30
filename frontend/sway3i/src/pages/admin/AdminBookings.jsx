import { useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { ConfirmDialog } from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { paginate } from '../../utils/paginate'
import StatusBadge from '../../components/ui/StatusBadge'
import { IconInput } from '../../components/ui/Field'
import { EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { useToast } from '../../hooks/useToast'
import { enrollmentsApi, fromPage } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDate, formatPrice } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

const PAGE_SIZE = 12
const STATUSES = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED']

export default function AdminBookings() {
  useDocumentTitle('Bookings')
  const toast = useToast()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [deleting, setDeleting] = useState(null)

  const data = useAsync(() => enrollmentsApi.list({ size: 1000, sort: 'requestedAt,desc' }).then(fromPage), [])
  const query = search.trim().toLowerCase()
  const filtered = (data.data?.items || [])
    .filter((booking) => !status || booking.status === status)
    .filter((booking) => !query || `${booking.courseTitle} ${booking.studentName} ${booking.tutorName}`.toLowerCase().includes(query))
  const { pageItems, totalPages, page: currentPage } = paginate(filtered, page, PAGE_SIZE)

  const remove = async () => {
    try {
      await enrollmentsApi.cancel(deleting.id)
      toast.success('The booking has been deleted.')
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The booking could not be deleted.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p>Every booking request made on the platform.</p>
        </div>
      </div>

      <section className="card">
        <div className="table-toolbar">
          <select className="select" style={{ maxWidth: 220 }} value={status} onChange={(event) => { setStatus(event.target.value); setPage(0) }} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <IconInput icon="search" placeholder="Search by course, student or teacher" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} aria-label="Search bookings" />
        </div>

        {data.loading ? (
          <div className="card-body stack"><SkeletonCards count={4} height={48} /></div>
        ) : data.error ? (
          <ErrorState error={data.error} onRetry={data.reload} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="clipboard" title="No booking found">
            {query || status ? 'Try another search or filter.' : 'Bookings will appear here.'}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Course</th>
                    <th scope="col">Student</th>
                    <th scope="col">Period</th>
                    <th scope="col">Price</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.courseTitle}</strong>
                        <div className="text-soft text-sm">with {booking.tutorName}</div>
                      </td>
                      <td>{booking.studentName}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                      </td>
                      <td>{formatPrice(booking.monthlyPrice)}</td>
                      <td>
                        <StatusBadge status={booking.status} />
                        {booking.rejectionReason && <div className="text-soft text-sm">“{booking.rejectionReason}”</div>}
                      </td>
                      <td>
                        <div className="cell-actions">
                          <Button size="sm" variant="ghost" onClick={() => setDeleting(booking)} aria-label="Delete booking">
                            <Icon name="trash" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} onChange={setPage} itemLabel="bookings" />
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this booking?"
        message="The booking, its payments and its review will be permanently deleted for both the student and the teacher."
        confirmLabel="Delete booking"
        danger
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
