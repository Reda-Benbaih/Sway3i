import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  title: '',
  description: '',
  subjectId: '',
  courseType: 'INDIVIDUAL',
  courseFormat: 'ONLINE',
  monthlyPrice: '',
  maxCapacity: '',
  locationOrLink: '',
}

const initialSlotForm = {
  dayOfWeek: 'MONDAY',
  startTime: '',
  endTime: '',
}

function ListingSlots({ listing, onSlotAdded }) {
  const [slotForm, setSlotForm] = useState(initialSlotForm)

  const handleChange = (e) => {
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value })
  }

  const addSlot = async (e) => {
    e.preventDefault()
    await api.post('/weekly-slots', { ...slotForm, courseListingId: listing.id })
    setSlotForm(initialSlotForm)
    onSlotAdded()
  }

  return (
    <div className="slots">
      <p>Weekly availability:</p>
      {listing.weeklySlots.length === 0 && <p>No slots yet</p>}
      {listing.weeklySlots.map((slot) => (
        <p key={slot.id}>{slot.dayOfWeek} {slot.startTime} - {slot.endTime}</p>
      ))}

      <form className="slot-form" onSubmit={addSlot}>
        <select name="dayOfWeek" value={slotForm.dayOfWeek} onChange={handleChange}>
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
          <option value="SATURDAY">Saturday</option>
          <option value="SUNDAY">Sunday</option>
        </select>
        <input type="time" name="startTime" value={slotForm.startTime} onChange={handleChange} required />
        <input type="time" name="endTime" value={slotForm.endTime} onChange={handleChange} required />
        <button type="submit">Add slot</button>
      </form>
    </div>
  )
}

export default function ManageListings() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [listings, setListings] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get(`/course-listings/by-tutor/${user.userId}`)
      setListings(data)
    } catch {
      setError('Could not load your listings')
    }
  }

  useEffect(() => {
    api.get('/subjects', { params: { size: 100 } })
      .then((res) => setSubjects(res.data.content))
      .catch(() => setSubjects([]))
    load()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const createListing = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/course-listings', { ...form, tutorId: user.userId })
      setForm(initialForm)
      load()
    } catch {
      setError('Could not create the listing, please check your info')
    }
  }

  const deleteListing = async (id) => {
    await api.delete(`/course-listings/${id}`)
    load()
  }

  return (
    <div className="manage-page">
      <h1>My course listings</h1>
      {error && <p className="error">{error}</p>}

      <form className="listing-form" onSubmit={createListing}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

        <select name="subjectId" value={form.subjectId} onChange={handleChange} required>
          <option value="">Select subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>

        <select name="courseType" value={form.courseType} onChange={handleChange}>
          <option value="INDIVIDUAL">Individual</option>
          <option value="GROUP">Group</option>
        </select>

        <select name="courseFormat" value={form.courseFormat} onChange={handleChange}>
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In person</option>
        </select>

        <input name="monthlyPrice" type="number" placeholder="Monthly price" value={form.monthlyPrice} onChange={handleChange} required />
        <input name="maxCapacity" type="number" placeholder="Max capacity" value={form.maxCapacity} onChange={handleChange} />
        <input name="locationOrLink" placeholder="Location or link" value={form.locationOrLink} onChange={handleChange} />

        <button type="submit">Create listing</button>
      </form>

      <div className="listing-grid">
        {listings.map((listing) => (
          <div key={listing.id} className="listing-card">
            <h2>{listing.title}</h2>
            <p>{listing.subjectName}</p>
            <p>{listing.description}</p>
            <p>{listing.monthlyPrice} MAD / month</p>
            <p>{listing.courseFormat === 'ONLINE' ? 'Online' : listing.locationOrLink}</p>
            <ListingSlots listing={listing} onSlotAdded={load} />
            <button onClick={() => deleteListing(listing.id)}>Delete listing</button>
          </div>
        ))}
        {listings.length === 0 && <p>You have no course listings yet</p>}
      </div>
    </div>
  )
}
