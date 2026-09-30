import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Icon from '../../components/ui/Icon'
import AccountSettings from '../../components/auth/AccountSettings'
import { VerifiedBadge } from '../../components/ui/StatusBadge'
import { Rating } from '../../components/ui/Stars'
import { Alert, ErrorState } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'
import { fromPage, subjectsApi, tutorsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { fullName } from '../../utils/format'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'
import { clean, validateAccount } from '../../utils/validation'

const FIELDS = ['firstName', 'lastName', 'email', 'phone', 'city', 'biography', 'degree', 'nationalId', 'hourlyRate', 'teachingZones']

function toForm(profile) {
  return {
    ...Object.fromEntries(FIELDS.map((key) => [key, profile?.[key] ?? ''])),
    subjectIds: profile?.subjectIds ?? (profile?.subjects || []).map((subject) => subject.id),
  }
}

function toBody(form, extra = {}) {
  return clean({
    ...form,
    email: form.email.trim(),
    hourlyRate: form.hourlyRate === '' ? '' : Number(form.hourlyRate),
    ...extra,
  })
}

export default function TeacherProfileSettings() {
  useDocumentTitle('My profile')
  const { user } = useAuth()
  const profile = useAsync(() => tutorsApi.get(user.userId), [user.userId])

  if (profile.loading) return <PageLoader />
  if (profile.error) return <ErrorState error={profile.error} onRetry={profile.reload} />
  return <TeacherProfileForm initial={profile.data} />
}

function TeacherProfileForm({ initial }) {
  const { user, refreshUser, logout } = useAuth()
  const toast = useToast()
  const subjects = useAsync(() => subjectsApi.list().then(fromPage), [])
  const [p, setSaved] = useState(initial)
  const [form, setForm] = useState(() => toForm(initial))
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  const toggleSubject = (id) =>
    setForm({
      ...form,
      subjectIds: form.subjectIds.includes(id) ? form.subjectIds.filter((value) => value !== id) : [...form.subjectIds, id],
    })

  const save = async (event) => {
    event.preventDefault()
    const nextErrors = validateAccount(form, { requirePassword: false })
    if (form.hourlyRate !== '' && Number(form.hourlyRate) < 0) nextErrors.hourlyRate = 'Hourly rate must be positive'
    if (form.biography.length > 255) nextErrors.biography = 'Biography must not exceed 255 characters'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    setError('')
    const emailChanged = form.email.trim() !== p.email
    try {
      await tutorsApi.update(user.userId, toBody(form))
      if (emailChanged) {
        logout('/login?emailChanged=1')
        return
      }
      await refreshUser()
      toast.success('Your profile has been saved.')
      setSaved({ ...p, ...form, hourlyRate: form.hourlyRate === '' ? null : Number(form.hourlyRate) })
    } catch (err) {
      setError(getErrorMessage(err, 'Your profile could not be saved.'))
      setErrors(getFieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  const savePassword = (password) => tutorsApi.update(user.userId, toBody(toForm(p), { password }))

  const deleteAccount = async () => {
    await tutorsApi.remove(user.userId)
    logout('/')
    toast.success('Your account has been deleted.')
  }

  const name = fullName(p)

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Profile &amp; settings</h1>
          <p>This is what students see on your public profile.</p>
        </div>
        <Link to={`/teachers/${user.userId}`} className="btn" target="_blank" rel="noreferrer">
          <Icon name="eye" size={18} /> View public profile
        </Link>
      </div>

      <div className="settings-layout">
        <aside className="card settings-card">
          <div className="card-body profile-summary">
            <Avatar name={name} size="xl" />
            <div>
              <strong>{name}</strong>
              <span className="text-soft text-sm">{p.degree || 'Teacher'}</span>
            </div>
            <VerifiedBadge verified={p.isVerified} />
            <Rating value={p.averageRating} count={p.reviewCount} />
          </div>
        </aside>

        <div className="stack" style={{ gap: 20 }}>
          <form className="stack" style={{ gap: 20 }} onSubmit={save} noValidate>
            {error && <Alert type="error">{error}</Alert>}

            <section className="card">
              <div className="card-header">
                <h2>Teaching profile</h2>
              </div>
              <div className="card-body form-grid cols-2">
                <Field label="Biography" optional error={errors.biography} hint={`${form.biography.length}/255 · Your experience and how you teach.`} className="span-2">
                  <textarea className="textarea" maxLength={255} value={form.biography} onChange={update('biography')} />
                </Field>
                <Field label="Diplomas & qualifications" optional error={errors.degree} className="span-2">
                  <input className="input" maxLength={255} placeholder="e.g. Master’s in Physics, 5 years of teaching" value={form.degree} onChange={update('degree')} />
                </Field>
                <Field label="Hourly rate (MAD)" optional error={errors.hourlyRate}>
                  <input className="input" type="number" min="0" inputMode="decimal" value={form.hourlyRate} onChange={update('hourlyRate')} />
                </Field>
                <Field label="City" optional error={errors.city}>
                  <input className="input" value={form.city} onChange={update('city')} />
                </Field>
                <Field label="Teaching areas" optional error={errors.teachingZones} hint="Neighbourhoods or cities where you teach in person." className="span-2">
                  <input className="input" maxLength={255} placeholder="e.g. Agdal, Hay Riad, Souissi" value={form.teachingZones} onChange={update('teachingZones')} />
                </Field>
                <div className="field span-2">
                  <span className="field-label">Subjects taught</span>
                  {subjects.data?.items.length ? (
                    <div className="chip-list">
                      {subjects.data.items.map((subject) => (
                        <button
                          key={subject.id}
                          type="button"
                          className="chip"
                          aria-pressed={form.subjectIds.includes(subject.id)}
                          onClick={() => toggleSubject(subject.id)}
                        >
                          {form.subjectIds.includes(subject.id) && <Icon name="check" size={14} />}
                          {subject.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="field-hint">No subject is available yet.</span>
                  )}
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-header">
                <h2>Personal information</h2>
              </div>
              <div className="card-body form-grid cols-2">
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
                <Field label="National ID" optional hint="Only visible to you and the Sway3i team, used to validate your profile." className="span-2">
                  <input className="input" value={form.nationalId} onChange={update('nationalId')} />
                </Field>
              </div>
            </section>

            <div>
              <Button type="submit" variant="primary" size="lg" loading={saving}>
                Save my profile
              </Button>
            </div>
          </form>

          <AccountSettings onSavePassword={savePassword} onDelete={deleteAccount} />
        </div>
      </div>
    </>
  )
}
