import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const groups = [
  { title: 'Upcoming', statuses: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
  { title: 'Completed', statuses: ['COMPLETED'] },
  { title: 'Cancelled', statuses: ['REJECTED', 'CANCELLED'] },
]

function CompletedEnrollmentCard({ enrollment }) {
  const [review, setReview] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')

  useEffect(() => {
    api.get(`/reviews/by-enrollment/${enrollment.id}`)
      .then((res) => setReview(res.data))
      .catch(() => setReview(null))
      .finally(() => setLoaded(true))
  }, [])

  const submitReview = async (e) => {
    e.preventDefault()
    const { data } = await api.post('/reviews', {
      rating: Number(rating),
      comment,
      enrollmentId: enrollment.id,
    })
    setReview(data)
  }

  return (
    <div className="enrollment-card">
      <p>{enrollment.courseTitle}</p>
      <p>{enrollment.startDate} to {enrollment.endDate}</p>

      {loaded && review && (
        <div className="review-display">
          <p>Your review: {review.rating} / 5</p>
          <p>{review.comment}</p>
        </div>
      )}

      {loaded && !review && (
        <form className="review-form" onSubmit={submitReview}>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
          <textarea
            placeholder="Leave a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit">Submit review</button>
        </form>
      )}
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get(`/enrollments/by-student/${user.userId}`)
      setEnrollments(data)
    } catch {
      setError('Could not load your enrollments')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const cancel = async (id) => {
    await api.delete(`/enrollments/${id}`)
    load()
  }

  return (
    <div className="dashboard-page">
      <h1>My enrollments</h1>
      {error && <p className="error">{error}</p>}

      {groups.map((group) => {
        const items = enrollments.filter((e) => group.statuses.includes(e.status))
        return (
          <div key={group.title} className="dashboard-section">
            <h2>{group.title}</h2>
            {items.length === 0 && <p>Nothing here</p>}
            {items.map((e) =>
              group.title === 'Completed' ? (
                <CompletedEnrollmentCard key={e.id} enrollment={e} />
              ) : (
                <div key={e.id} className="enrollment-card">
                  <p>{e.courseTitle}</p>
                  <p>{e.startDate} to {e.endDate}</p>
                  <p>{e.monthlyPrice} MAD / month</p>
                  <p>Status: {e.status}</p>
                  {e.status === 'PENDING' && (
                    <button onClick={() => cancel(e.id)}>Cancel</button>
                  )}
                </div>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}
