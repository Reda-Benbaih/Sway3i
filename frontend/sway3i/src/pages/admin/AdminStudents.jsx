import { useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { ConfirmDialog } from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { paginate } from '../../utils/paginate'
import { IconInput } from '../../components/ui/Field'
import { EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { useToast } from '../../hooks/useToast'
import { fromPage, studentsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { LEVELS, formatDate, fullName } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

const PAGE_SIZE = 10

export default function AdminStudents() {
  useDocumentTitle('Students')
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [page, setPage] = useState(0)
  const [deleting, setDeleting] = useState(null)

  const data = useAsync(() => studentsApi.list({ size: 500, sort: 'createdAt,desc' }).then(fromPage), [])
  const query = search.trim().toLowerCase()
  const filtered = (data.data?.items || [])
    .filter((student) => !level || student.level === level)
    .filter((student) => !query || `${fullName(student)} ${student.email} ${student.school || ''} ${student.city || ''}`.toLowerCase().includes(query))
  const { pageItems, totalPages, page: currentPage } = paginate(filtered, page, PAGE_SIZE)

  const remove = async () => {
    try {
      await studentsApi.remove(deleting.id)
      toast.success('The student account has been deleted.')
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The student could not be deleted.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>All student and parent accounts registered on the platform.</p>
        </div>
      </div>

      <section className="card">
        <div className="table-toolbar">
          <select className="select" style={{ maxWidth: 220 }} value={level} onChange={(event) => { setLevel(event.target.value); setPage(0) }} aria-label="Filter by level">
            <option value="">All levels</option>
            {Object.entries(LEVELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <IconInput icon="search" placeholder="Search by name, email, school or city" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} aria-label="Search students" />
        </div>

        {data.loading ? (
          <div className="card-body stack"><SkeletonCards count={4} height={48} /></div>
        ) : data.error ? (
          <ErrorState error={data.error} onRetry={data.reload} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="users" title="No student found">
            {query || level ? 'Try another search or filter.' : 'Student accounts will appear here.'}
          </EmptyState>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Level</th>
                    <th scope="col">School</th>
                    <th scope="col">City</th>
                    <th scope="col">Joined</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="cell-user">
                          <Avatar name={fullName(student)} size="sm" />
                          <div>
                            <strong>{fullName(student)}</strong>
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{student.level ? LEVELS[student.level] : '—'}</td>
                      <td>{student.school || '—'}</td>
                      <td>{student.city || '—'}</td>
                      <td>{formatDate(student.createdAt)}</td>
                      <td>
                        <div className="cell-actions">
                          <Button size="sm" variant="ghost" onClick={() => setDeleting(student)} aria-label={`Delete ${fullName(student)}`}>
                            <Icon name="trash" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentPage} totalPages={totalPages} total={filtered.length} onChange={setPage} itemLabel="students" />
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this student account?"
        message={`${fullName(deleting)}’s account, bookings and reviews will be permanently deleted.`}
        confirmLabel="Delete account"
        danger
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
