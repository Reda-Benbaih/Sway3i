import { useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import AccountSettings from '../../components/auth/AccountSettings'
import { Alert, ErrorState } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'
import { studentsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { LEVELS, formatDate, fullName } from '../../utils/format'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'
import { clean, validateAccount } from '../../utils/validation'

const FIELDS = ['firstName', 'lastName', 'email', 'phone', 'city', 'level', 'school', 'preferences']

function toForm(profile) {
  return Object.fromEntries(FIELDS.map((key) => [key, profile?.[key] ?? '']))
}

export default function StudentProfile() {
  useDocumentTitle('My profile')
  const { user } = useAuth()
  const profile = useAsync(() => studentsApi.get(user.userId), [user.userId])

  if (profile.loading) return <PageLoader />
  if (profile.error) return <ErrorState error={profile.error} onRetry={profile.reload} />
  return <StudentProfileForm initial={profile.data} />
}

function StudentProfileForm({ initial }) {
  const { user, refreshUser, logout } = useAuth()
  const toast = useToast()
  const [saved, setSaved] = useState(initial)
  const [form, setForm] = useState(() => toForm(initial))
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const save = async (event) => {
    event.preventDefault()
    const nextErrors = validateAccount(form, { requirePassword: false })
    if (form.preferences.length > 500) nextErrors.preferences = 'Preferences must not exceed 500 characters'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    setError('')
    const emailChanged = form.email.trim() !== saved.email
    try {
      await studentsApi.update(user.userId, clean({ ...form, email: form.email.trim() }))
      if (emailChanged) {
        logout('/login?emailChanged=1')
        return
      }
      await refreshUser()
      toast.success('Your profile has been saved.')
      setSaved({ ...saved, ...form })
    } catch (err) {
      setError(getErrorMessage(err, 'Your profile could not be saved.'))
      setErrors(getFieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  const savePassword = (password) => studentsApi.update(user.userId, clean({ ...toForm(saved), password }))

  const deleteAccount = async () => {
    await studentsApi.remove(user.userId)
    logout('/')
    toast.success('Your account has been deleted.')
  }

  const name = fullName(saved)

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Profile &amp; settings</h1>
          <p>Keep your information up to date so teachers can prepare your lessons.</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="card settings-card">
          <div className="card-body profile-summary">
            <Avatar name={name} size="xl" />
            <div>
              <strong>{name}</strong>
              <span className="text-soft text-sm">Student since {formatDate(saved.createdAt, { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </aside>

        <div className="stack" style={{ gap: 20 }}>
          <section className="card">
            <div className="card-header">
              <h2>Personal information</h2>
            </div>
            <form className="card-body stack" onSubmit={save} noValidate>
              {error && <Alert type="error">{error}</Alert>}
              <div className="form-grid cols-2">
                <Field label="First name" error={errors.firstName}>
                  <input className="input" autoComplete="given-name" value={form.firstName} onChange={update('firstName')} />
                </Field>
                <Field label="Last name" error={errors.lastName}>
                  <input className="input" autoComplete="family-name" value={form.lastName} onChange={update('lastName')} />
                </Field>
                <Field label="Email" error={errors.email} hint="Changing it will ask you to log in again.">
                  <input className="input" type="email" autoComplete="email" value={form.email} onChange={update('email')} />
                </Field>
                <Field label="Phone" optional error={errors.phone}>
                  <input className="input" type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')} />
                </Field>
                <Field label="City" optional error={errors.city}>
                  <input className="input" autoComplete="address-level2" value={form.city} onChange={update('city')} />
                </Field>
                <Field label="School level" optional>
                  <select className="select" value={form.level} onChange={update('level')}>
                    <option value="">Not set</option>
                    {Object.entries(LEVELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="School" optional error={errors.school} className="span-2">
                  <input className="input" value={form.school} onChange={update('school')} />
                </Field>
                <Field
                  label="Learning preferences"
                  optional
                  error={errors.preferences}
                  hint="For example: online lessons in the evening, exam preparation, favourite subjects…"
                  className="span-2"
                >
                  <textarea className="textarea" maxLength={500} value={form.preferences} onChange={update('preferences')} />
                </Field>
              </div>
              <div>
                <Button type="submit" variant="primary" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          </section>

          <AccountSettings onSavePassword={savePassword} onDelete={deleteAccount} />
        </div>
      </div>
    </>
  )
}
