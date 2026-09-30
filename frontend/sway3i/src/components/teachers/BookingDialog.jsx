import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Icon from '../ui/Icon'
import { Alert } from '../ui/Feedback'
import { enrollmentsApi } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { addMonths, formatPrice, formatTime, DAYS, sortSlots, todayInput } from '../../utils/format'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'

function BookingForm({ listing, onClose, onBooked }) {
  const slots = sortSlots(listing.weeklySlots)
  const [slotId, setSlotId] = useState(slots[0]?.id ?? null)
  const [startDate, setStartDate] = useState(todayInput())
  const [endDate, setEndDate] = useState(addMonths(todayInput(), 1))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [done, setDone] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    if (endDate <= startDate) {
      setFieldErrors({ dateRangeValid: 'End date must be after start date' })
      return
    }
    setSubmitting(true)
    try {
      await enrollmentsApi.create({ courseListingId: listing.id, weeklySlotId: slotId, startDate, endDate })
      setDone(true)
      onBooked?.()
    } catch (err) {
      setError(getErrorMessage(err, 'Your request could not be sent.'))
      setFieldErrors(getFieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="booking-success">
        <div className="icon-bubble accent">
          <Icon name="checkCircle" size={26} />
        </div>
        <h3>Request sent to {listing.tutorName}</h3>
        <p className="text-muted">
          You will see the answer in your lessons as soon as the teacher accepts or declines your request.
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Button onClick={onClose}>Close</Button>
          <Link to="/student/lessons" className="btn btn-primary">
            Go to my lessons
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      {error && <Alert type="error">{error}</Alert>}

      <div className="booking-summary">
        <div>
          <strong>{listing.title}</strong>
          <span className="text-soft text-sm">
            {listing.subjectName} · with {listing.tutorName}
          </span>
        </div>
        <span className="listing-price">
          <strong>{formatPrice(listing.monthlyPrice)}</strong>
          <span>/ month</span>
        </span>
      </div>

      <fieldset className="fieldset">
        <legend className="field-label">Choose a weekly time slot</legend>
        {slots.length === 0 ? (
          <p className="text-sm text-muted">
            This teacher has not published fixed time slots for this course yet. Send your request and you will agree on
            the times together.
          </p>
        ) : (
          <div className="slot-options" role="radiogroup">
            {slots.map((slot) => (
              <label key={slot.id} className={`slot-option${slotId === slot.id ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="slot"
                  value={slot.id}
                  checked={slotId === slot.id}
                  onChange={() => setSlotId(slot.id)}
                />
                <strong>{DAYS[slot.dayOfWeek]}</strong>
                <span>
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="form-grid cols-2">
        <Field label="Start date" error={fieldErrors.startDate}>
          <input type="date" className="input" value={startDate} min={todayInput()} onChange={(e) => setStartDate(e.target.value)} required />
        </Field>
        <Field label="End date" error={fieldErrors.endDate || fieldErrors.dateRangeValid}>
          <input type="date" className="input" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} required />
        </Field>
      </div>

      <div className="modal-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Send booking request
        </Button>
      </div>
    </form>
  )
}

export default function BookingDialog({ listing, onClose, onBooked }) {
  const { user } = useAuth()
  const location = useLocation()
  const next = encodeURIComponent(location.pathname)

  return (
    <Modal open={Boolean(listing)} title="Request a lesson" description="The teacher confirms every request." onClose={onClose}>
      {listing &&
        (!user ? (
          <div className="stack">
            <p className="text-muted">Create a free student account or log in to send a booking request.</p>
            <div className="row">
              <Link to={`/login?next=${next}`} className="btn btn-primary">
                Log in
              </Link>
              <Link to={`/register?role=STUDENT`} className="btn">
                Create an account
              </Link>
            </div>
          </div>
        ) : user.role !== 'STUDENT' ? (
          <Alert type="info">Only student accounts can book lessons.</Alert>
        ) : (
          <BookingForm listing={listing} onClose={onClose} onBooked={onBooked} />
        ))}
    </Modal>
  )
}
