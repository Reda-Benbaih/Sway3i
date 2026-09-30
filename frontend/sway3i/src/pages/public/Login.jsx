import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout, { RoleCards } from '../../components/auth/AuthLayout'
import GoogleSignIn from '../../components/auth/GoogleSignIn'
import Field, { IconInput, PasswordInput } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Alert } from '../../components/ui/Feedback'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { dashboardPath, safeNext } from '../../utils/session'
import { getErrorMessage, getStatus } from '../../utils/errors'
import { EMAIL_PATTERN } from '../../utils/validation'

export default function Login() {
  useDocumentTitle('Log in')
  const { login, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleCredential, setGoogleCredential] = useState(null)
  const [googleRole, setGoogleRole] = useState('STUDENT')

  const goToApp = (user) => {
    toast.success(`Welcome back${user.firstName ? `, ${user.firstName}` : ''}!`)
    navigate(safeNext(params.get('next'), user.role) || dashboardPath(user.role), { replace: true })
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!EMAIL_PATTERN.test(form.email)) nextErrors.email = 'Enter a valid email address'
    if (!form.password) nextErrors.password = 'Enter your password'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setError('')
    setLoading(true)
    try {
      goToApp(await login(form.email.trim(), form.password, form.remember))
    } catch (err) {
      setError(getStatus(err) === 401 ? 'Incorrect email or password.' : getErrorMessage(err))
      setLoading(false)
    }
  }

  const google = async (credential, role) => {
    setError('')
    setLoading(true)
    try {
      goToApp(await loginWithGoogle(credential, role))
    } catch (err) {
      setLoading(false)
      if (getStatus(err) === 404 && !role) {
        setGoogleCredential(credential)
        return
      }
      setGoogleCredential(null)
      setError(getErrorMessage(err, 'Google sign-in failed.'))
    }
  }

  const update = (field) => (event) =>
    setForm({ ...form, [field]: field === 'remember' ? event.target.checked : event.target.value })

  return (
    <AuthLayout>
      <h1>Welcome back</h1>
      <p className="lead">Log in to manage your lessons.</p>

      <form className="auth-form" onSubmit={submit} noValidate>
        {params.get('expired') && !error && <Alert type="info">Your session has expired. Please log in again.</Alert>}
        {params.get('emailChanged') && !error && <Alert type="success">Your email has been updated. Log in with your new address.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Field label="Email" error={errors.email}>
          <IconInput icon="mail" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput autoComplete="current-password" placeholder="Your password" value={form.password} onChange={update('password')} />
        </Field>

        <label className="checkbox">
          <input type="checkbox" checked={form.remember} onChange={update('remember')} />
          Keep me logged in on this device
        </label>

        <Button type="submit" variant="primary" size="lg" block loading={loading}>
          Log in
        </Button>

        <GoogleSignIn onCredential={(credential) => google(credential)} text="signin_with" disabled={loading} />
      </form>

      <p className="auth-switch">
        New to Sway3i? <Link to="/register">Create an account</Link>
      </p>

      <Modal
        open={Boolean(googleCredential)}
        title="One last step"
        description="No Sway3i account uses this Google email yet. Which account do you want to create?"
        onClose={() => setGoogleCredential(null)}
        footer={
          <>
            <Button onClick={() => setGoogleCredential(null)}>Cancel</Button>
            <Button variant="primary" loading={loading} onClick={() => google(googleCredential, googleRole)}>
              Create my account
            </Button>
          </>
        }
      >
        <RoleCards value={googleRole} onChange={setGoogleRole} />
      </Modal>
    </AuthLayout>
  )
}
