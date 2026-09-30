import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Tabs from '../../components/ui/Tabs'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { paginate } from '../../utils/paginate'
import { IconInput } from '../../components/ui/Field'
import { VerifiedBadge } from '../../components/ui/StatusBadge'
import { Rating } from '../../components/ui/Stars'
import { EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { useToast } from '../../hooks/useToast'
import { fromPage, tutorsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDate, formatPrice, fullName } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

const PAGE_SIZE = 10

function TeacherDetails({ tutor, onClose, onVerify }) {
  return (
    <Modal
      open
      size="lg"
      title={fullName(tutor)}
      description="Check the information before validating the profile."
      onClose={onClose}
      footer={
        <>
          <Link to={`/teachers/${tutor.id}`} className="btn" target="_blank" rel="noreferrer">
            <Icon name="eye" size={16} /> Public profile
          </Link>
          <Button variant={tutor.isVerified ? 'danger-soft' : 'primary'} onClick={() => onVerify(tutor)}>
            {tutor.isVerified ? 'Revoke validation' : 'Approve teacher'}
          </Button>
        </>
      }
    >
      <ul className="detail-list">
        <li><span>Status</span><VerifiedBadge verified={tutor.isVerified} /></li>
        <li><span>Email</span><strong>{tutor.email}</strong></li>
        <li><span>Phone</span><strong>{tutor.phone || '—'}</strong></li>
        <li><span>National ID</span><strong>{tutor.nationalId || '—'}</strong></li>
        <li><span>Diplomas</span><strong>{tutor.degree || '—'}</strong></li>
        <li><span>City · areas</span><strong>{[tutor.city, tutor.teachingZones].filter(Boolean).join(' · ') || '—'}</strong></li>
        <li><span>Hourly rate</span><strong>{formatPrice(tutor.hourlyRate)}</strong></li>
        <li><span>Subjects</span><strong>{tutor.subjects?.map((subject) => subject.name).join(', ') || '—'}</strong></li>
        <li><span>Biography</span><strong>{tutor.biography || '—'}</strong></li>
        <li><span>Joined</span><strong>{formatDate(tutor.createdAt)}</strong></li>
      </ul>
    </Modal>
  )
}

export default function AdminTeachers() {
  useDocumentTitle('Teachers')
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const filter = params.get('filter') === 'pending' ? 'pending' : params.get('filter') === 'verified' ? 'verified' : 'all'
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [details, setDetails] = useState(null)
  const [verifying, setVerifying] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const data = useAsync(() => tutorsApi.list({ size: 500, sort: 'createdAt,desc' }).then(fromPage), [])
  const all = data.data?.items || []
  const counts = {
    all: all.length,
    pending: all.filter((tutor) => !tutor.isVerified).length,
    verified: all.filter((tutor) => tutor.isVerified).length,
  }
  const query = search.trim().toLowerCase()
  const filtered = all
    .filter((tutor) => (filter === 'pending' ? !tutor.isVerified : filter === 'verified' ? tutor.isVerified : true))
    .filter((tutor) => !query || `${fullName(tutor)} ${tutor.email} ${tutor.city || ''}`.toLowerCase().includes(query))
  const { pageItems, totalPages, page: currentPage } = paginate(filtered, page, PAGE_SIZE)

  const verify = async () => {
    const next = !verifying.isVerified
    try {
      await tutorsApi.verify(verifying.id, next)
      toast.success(next ? `${fullName(verifying)} is now validated.` : `Validation revoked for ${fullName(verifying)}.`)
      setDetails(null)
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The teacher could not be updated.'))
    }
  }

  const remove = async () => {
    try {
      await tutorsApi.remove(deleting.id)
      toast.success('The teacher account has been deleted.')
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The teacher could not be deleted.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Teachers</h1>
          <p>Validate new teacher profiles and manage existing accounts.</p>
        </div>
      </div>

      <section className="card">
        <div className="table-toolbar">
          <Tabs
            label="Filter teachers"
            value={filter}
            onChange={(value) => {
              setParams(value === 'all' ? {} : { filter: value }, { replace: true })
              setPage(0)
            }}
            tabs={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'pending', label: 'To validate', count: counts.pending },
              { value: 'verified', label: 'Validated', count: counts.verified },
            ]}
          />
          <IconInput icon="search" placeholder="Search by name, email or city" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} aria-label="Search teachers" />
        </div>

        {data.loading ? (
          <div className="card-body stack"><SkeletonCards count={4} height={48} /></div>
        ) : data.error ? (
          <ErrorState error={data.error} onRetry={data.reload} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="users" title="No teacher found">
            {query ? 'Try another search.' : 'Teacher accounts will appear here.'}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Teacher</th>
                    <th scope="col">City</th>
                    <th scope="col">Rating</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((tutor) => (
                    <tr key={tutor.id}>
                      <td>
                        <div className="cell-user">
                          <Avatar name={fullName(tutor)} size="sm" />
                          <div>
                            <strong>{fullName(tutor)}</strong>
                            <span>{tutor.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{tutor.city || '—'}</td>
                      <td><Rating value={tutor.averageRating} count={tutor.reviewCount} /></td>
                      <td>{formatDate(tutor.createdAt)}</td>
                      <td><VerifiedBadge verified={tutor.isVerified} /></td>
                      <td>
                        <div className="cell-actions">
                          <Button size="sm" onClick={() => setDetails(tutor)}>Review</Button>
                          {!tutor.isVerified && (
                            <Button size="sm" variant="primary" onClick={() => setVerifying(tutor)}>Approve</Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setDeleting(tutor)} aria-label={`Delete ${fullName(tutor)}`}>
                            <Icon name="trash" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} onChange={setPage} itemLabel="teachers" />
          </>
        )}
      </section>

      {details && <TeacherDetails tutor={details} onClose={() => setDetails(null)} onVerify={setVerifying} />}

      <ConfirmDialog
        open={Boolean(verifying)}
        title={verifying?.isVerified ? 'Revoke this validation?' : 'Approve this teacher?'}
        message={
          verifying?.isVerified
            ? `${fullName(verifying)}’s courses will disappear from the search until the profile is validated again.`
            : `${fullName(verifying)}’s courses will appear in the search and students will be able to book them.`
        }
        confirmLabel={verifying?.isVerified ? 'Revoke' : 'Approve'}
        danger={verifying?.isVerified}
        onConfirm={verify}
        onClose={() => setVerifying(null)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this teacher account?"
        message={`${fullName(deleting)}’s account, courses, bookings and reviews will be permanently deleted.`}
        confirmLabel="Delete account"
        danger
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
