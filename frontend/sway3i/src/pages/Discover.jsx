import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const initialFilters = {
  subjectId: '',
  courseFormat: '',
  minPrice: '',
  maxPrice: '',
  location: '',
}

function BookingForm({ listing, studentId }) {
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const book = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/enrollments', {
        startDate,
        endDate,
        courseListingId: listing.id,
        studentId,
      })
      setDone(true)
      setOpen(false)
    } catch {
      setError('Could not send the booking request')
    }
  }

  if (done) {
    return <p>Request sent, check your dashboard</p>
  }

  if (!open) {
    return <button onClick={() => setOpen(true)}>Book</button>
  }

  return (
    <form className="booking-form" onSubmit={book}>
      {error && <p className="error">{error}</p>}
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      <button type="submit">Confirm</button>
    </form>
  )
}

export default function Discover() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [listings, setListings] = useState([])
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const search = async (e) => {
    if (e) e.preventDefault()
    setError('')

    const params = {}
    if (filters.subjectId) params.subjectId = filters.subjectId
    if (filters.courseFormat) params.courseFormat = filters.courseFormat
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.location) params.location = filters.location

    try {
      const { data } = await api.get('/course-listings/search', { params })
      setListings(data)
    } catch {
      setError('Could not load course listings')
    }
  }

  useEffect(() => {
    api.get('/subjects', { params: { size: 100 } })
      .then((res) => setSubjects(res.data.content))
      .catch(() => setSubjects([]))
    search()
  }, [])

  return (
    <div className="discover-page">
      <h1>Discover tutors</h1>

      <form className="filters" onSubmit={search}>
        <select name="subjectId" value={filters.subjectId} onChange={handleChange}>
          <option value="">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>

        <select name="courseFormat" value={filters.courseFormat} onChange={handleChange}>
          <option value="">Any format</option>
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In person</option>
        </select>

        <input
          name="minPrice"
          type="number"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={handleChange}
        />
        <input
          name="maxPrice"
          type="number"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={handleChange}
        />
        <input
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleChange}
        />

        <button type="submit">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="listing-grid">
        {listings.map((listing) => (
          <div key={listing.id} className="listing-card">
            <h2>{listing.title}</h2>
            <p>{listing.subjectName} with {listing.tutorName}</p>
            <p>{listing.description}</p>
            <p>{listing.monthlyPrice} MAD / month</p>
            <p>{listing.courseFormat === 'ONLINE' ? 'Online' : listing.locationOrLink}</p>
            {user.role === 'STUDENT' && (
              <BookingForm listing={listing} studentId={user.userId} />
            )}
          </div>
        ))}
        {listings.length === 0 && <p>No course listings found</p>}
      </div>
    </div>
  )
}
