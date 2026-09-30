import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout, { RoleCards } from '../../components/auth/AuthLayout'
import GoogleSignIn from '../../components/auth/GoogleSignIn'
import Field, { IconInput, PasswordInput } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { Alert } from '../../components/ui/Feedback'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { dashboardPath } from '../../utils/session'
import { LEVELS } from '../../utils/format'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'
import { PASSWORD_HINT, clean, validateAccount } from '../../utils/validation'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  city: '',
  level: '',
  degree: '',
}

export default function Register() {
  useDocumentTitle('Create an account')
  const { register, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState(params.get('role') === 'TUTOR' ? 'TUTOR' : 'STUDENT')
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const finish = (user, isNew = true) => {
    toast.success(isNew ? 'Your account is ready. Welcome to Sway3i!' : 'Welcome back!')
    navigate(dashboardPath(user.role), { replace: true })
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validateAccount(form, { requirePassword: true })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const account = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
      city: form.city.trim(),
    }
    const payload = role === 'TUTOR' ? { ...account, degree: form.degree.trim() } : { ...account, level: form.level }

    setError('')
    setLoading(true)
    try {
      finish(await register(role, clean(payload)))
    } catch (err) {
      setError(getErrorMessage(err, 'Your account could not be created.'))
      setErrors(getFieldErrors(err))
      setLoading(false)
    }
  }

  const google = async (credential) => {
    setError('')
    setLoading(true)
    try {
      finish(await loginWithGoogle(credential, role))
    } catch (err) {
      setError(getErrorMessage(err, 'Google sign-up failed.'))
      setLoading(false)
    }
  }

  return (
    <AuthLayout wide asideTitle="Join a community that takes learning seriously.">
      <h1>Create your account</h1>
      <p className="lead">It is free and takes less than a minute.</p>

      <form className="auth-form" onSubmit={submit} noValidate>
        {error && <Alert type="error">{error}</Alert>}

        <RoleCards value={role} onChange={setRole} />

        <div className="form-grid cols-2">
          <Field label="First name" error={errors.firstName}>
            <input className="input" autoComplete="given-name" value={form.firstName} onChange={update('firstName')} />
          </Field>
          <Field label="Last name" error={errors.lastName}>
            <input className="input" autoComplete="family-name" value={form.lastName} onChange={update('lastName')} />
          </Field>
          <Field label="Email" error={errors.email} className="span-2">
            <IconInput icon="mail" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
          </Field>
          <Field label="Password" error={errors.password} hint={PASSWORD_HINT}>
            <PasswordInput autoComplete="new-password" value={form.password} onChange={update('password')} />
          </Field>
          <Field label="Confirm password" error={errors.confirmPassword}>
            <PasswordInput autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} />
          </Field>
          <Field label="City" optional error={errors.city} hint={role === 'TUTOR' ? 'Students search teachers by location.' : undefined}>
            <IconInput icon="mapPin" autoComplete="address-level2" placeholder="e.g. Rabat" value={form.city} onChange={update('city')} />
          </Field>
          <Field label="Phone" optional error={errors.phone}>
            <input className="input" type="tel" autoComplete="tel" placeholder="+212 6 00 00 00 00" value={form.phone} onChange={update('phone')} />
          </Field>

          {role === 'STUDENT' ? (
            <Field label="School level" optional className="span-2" hint="Helps us show the right courses.">
              <select className="select" value={form.level} onChange={update('level')}>
                <option value="">Choose a level</option>
                {Object.entries(LEVELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Main diploma" optional className="span-2" hint="You can add subjects, rates and a biography later in your profile.">
              <input className="input" placeholder="e.g. Master’s degree in Mathematics" value={form.degree} onChange={update('degree')} />
            </Field>
          )}
        </div>

        {role === 'TUTOR' && (
          <Alert type="info">Teacher profiles are checked by our team before appearing in search results.</Alert>
        )}

        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Create my {role === 'TUTOR' ? 'teacher' : 'student'} account
        </Button>

        <GoogleSignIn onCredential={google} text="signup_with" disabled={loading} />
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}
