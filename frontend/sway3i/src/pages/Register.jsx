import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  city: '',
  level: '',
  school: '',
  biography: '',
  degree: '',
  nationalId: '',
}

export default function Register() {
  const [role, setRole] = useState('STUDENT')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const endpoint = role === 'STUDENT' ? '/students' : '/tutors'
    const payload =
      role === 'STUDENT'
        ? {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            city: form.city,
            level: form.level,
            school: form.school,
          }
        : {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            city: form.city,
            biography: form.biography,
            degree: form.degree,
            nationalId: form.nationalId,
          }

    try {
      await api.post(endpoint, payload)
      navigate('/login')
    } catch {
      setError('Registration failed, please check your info')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Register</h1>
        {error && <p className="error">{error}</p>}

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="STUDENT">Student</option>
          <option value="TUTOR">Tutor</option>
        </select>

        <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} />

        {role === 'STUDENT' ? (
          <>
            <select name="level" value={form.level} onChange={handleChange}>
              <option value="">Select level</option>
              <option value="PRIMARY">Primary</option>
              <option value="MIDDLE_SCHOOL">Middle school</option>
              <option value="HIGH_SCHOOL">High school</option>
              <option value="HIGHER_EDUCATION">Higher education</option>
            </select>
            <input name="school" placeholder="School" value={form.school} onChange={handleChange} />
          </>
        ) : (
          <>
            <input name="biography" placeholder="Biography" value={form.biography} onChange={handleChange} />
            <input name="degree" placeholder="Degree" value={form.degree} onChange={handleChange} />
            <input name="nationalId" placeholder="National ID" value={form.nationalId} onChange={handleChange} />
          </>
        )}

        <button type="submit">Register</button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}
