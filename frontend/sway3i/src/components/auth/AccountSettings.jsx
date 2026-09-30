import { useState } from 'react'
import Button from '../ui/Button'
import Field, { PasswordInput } from '../ui/Field'
import { ConfirmDialog } from '../ui/Modal'
import { Alert } from '../ui/Feedback'
import { PASSWORD_HINT, PASSWORD_PATTERN } from '../../utils/validation'
import { getErrorMessage } from '../../utils/errors'

export default function AccountSettings({ onSavePassword, onDelete }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!PASSWORD_PATTERN.test(password)) nextErrors.password = PASSWORD_HINT
    if (password !== confirm) nextErrors.confirm = 'Passwords do not match'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true)
    setStatus(null)
    try {
      await onSavePassword(password)
      setPassword('')
      setConfirm('')
      setStatus({ type: 'success', text: 'Your password has been updated.' })
    } catch (err) {
      setStatus({ type: 'error', text: getErrorMessage(err, 'Your password could not be updated.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="card">
        <div className="card-header">
          <h2>Password</h2>
        </div>
        <form className="card-body stack" onSubmit={submit} noValidate>
          {status && <Alert type={status.type}>{status.text}</Alert>}
          <div className="form-grid cols-2">
            <Field label="New password" error={errors.password} hint={PASSWORD_HINT}>
              <PasswordInput autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </Field>
            <Field label="Confirm new password" error={errors.confirm}>
              <PasswordInput autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
            </Field>
          </div>
          <div>
            <Button type="submit" loading={saving}>
              Update password
            </Button>
          </div>
        </form>
      </section>

      <section className="card danger-zone">
        <div className="card-body row-between">
          <div>
            <h2 className="card-title">Delete my account</h2>
            <p className="text-muted text-sm">Your profile, bookings and reviews will be permanently removed.</p>
          </div>
          <Button variant="danger-soft" onClick={() => setDeleting(true)}>
            Delete account
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={deleting}
        title="Delete your account?"
        message="This permanently removes your account and all its data. You will be logged out. This cannot be undone."
        confirmLabel="Delete my account"
        danger
        onConfirm={onDelete}
        onClose={() => setDeleting(false)}
      />
    </>
  )
}
