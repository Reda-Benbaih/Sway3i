import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function TutorDashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get(`/enrollments/by-tutor/${user.userId}`)
      setEnrollments(data)
    } catch {
      setError('Could not load your enrollments')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const respond = async (id, status) => {
    await api.put(`/enrollments/${id}/status`, { status })
    load()
  }

  const pending = enrollments.filter((e) => e.status === 'PENDING')
  const others = enrollments.filter((e) => e.status !== 'PENDING')

  return (
    <div className="dashboard-page">
      <h1>Booking requests</h1>
      {error && <p className="error">{error}</p>}

      <div className="dashboard-section">
        <h2>Pending requests</h2>
        {pending.length === 0 && <p>No pending requests</p>}
        {pending.map((e) => (
          <div key={e.id} className="enrollment-card">
            <p>{e.studentName} - {e.courseTitle}</p>
            <p>{e.startDate} to {e.endDate}</p>
            <button onClick={() => respond(e.id, 'CONFIRMED')}>Accept</button>
            <button onClick={() => respond(e.id, 'REJECTED')}>Reject</button>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <h2>Other enrollments</h2>
        {others.length === 0 && <p>Nothing here</p>}
        {others.map((e) => (
          <div key={e.id} className="enrollment-card">
            <p>{e.studentName} - {e.courseTitle}</p>
            <p>Status: {e.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
