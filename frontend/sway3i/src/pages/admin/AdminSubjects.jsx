import { useState } from 'react'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Icon from '../../components/ui/Icon'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import { Alert, EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { useToast } from '../../hooks/useToast'
import { fromPage, subjectsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'

function SubjectForm({ subject, onClose, onSaved }) {
  const [form, setForm] = useState({ name: subject?.name || '', description: subject?.description || '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }
    setSaving(true)
    setError('')
    try {
      const body = { name: form.name.trim(), description: form.description.trim() || null }
      if (subject) await subjectsApi.update(subject.id, body)
      else await subjectsApi.create(body)
      onSaved(!subject)
    } catch (err) {
      setError(err.response?.status === 409 ? 'A subject with this name already exists.' : getErrorMessage(err, 'The subject could not be saved.'))
      setErrors(getFieldErrors(err))
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title={subject ? 'Edit subject' : 'New subject'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={save}>
            {subject ? 'Save' : 'Create subject'}
          </Button>
        </>
      }
    >
      <div className="stack">
        {error && <Alert type="error">{error}</Alert>}
        <Field label="Name" error={errors.name}>
          <input className="input" placeholder="e.g. Physics" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </Field>
        <Field label="Description" optional>
          <textarea className="textarea" maxLength={255} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
      </div>
    </Modal>
  )
}

export default function AdminSubjects() {
  useDocumentTitle('Subjects')
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const data = useAsync(() => subjectsApi.list().then(fromPage), [])
  const subjects = data.data?.items || []

  const remove = async () => {
    try {
      await subjectsApi.remove(deleting.id)
      toast.success('The subject has been deleted.')
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The subject could not be deleted.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Subjects</h1>
          <p>The subjects teachers can choose for their profile and their courses.</p>
        </div>
        <Button variant="primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={18} /> New subject
        </Button>
      </div>

      <section className="card">
        {data.loading ? (
          <div className="card-body stack"><SkeletonCards count={3} height={48} /></div>
        ) : data.error ? (
          <ErrorState error={data.error} onRetry={data.reload} />
        ) : subjects.length === 0 ? (
          <EmptyState icon="layers" title="No subject yet" action="Create the first subject" onAction={() => setEditing('new')}>
            Teachers need subjects to publish courses.
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Description</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td><strong>{subject.name}</strong></td>
                    <td className="text-muted">{subject.description || '—'}</td>
                    <td>
                      <div className="cell-actions">
                        <Button size="sm" onClick={() => setEditing(subject)}>
                          <Icon name="edit" size={14} /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleting(subject)} aria-label={`Delete ${subject.name}`}>
                          <Icon name="trash" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <SubjectForm
          subject={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(created) => {
            toast.success(created ? 'Subject created.' : 'Subject updated.')
            setEditing(null)
            data.reload()
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete “${deleting?.name}”?`}
        message="All courses using this subject will be deleted too, with their bookings. This cannot be undone."
        confirmLabel="Delete subject"
        danger
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
