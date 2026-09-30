import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field from '../ui/Field'
import { StarInput } from '../ui/Stars'
import { Alert } from '../ui/Feedback'
import { reviewsApi } from '../../api/services'
import { getErrorMessage } from '../../utils/errors'

export default function ReviewDialog({ enrollment, review, onClose, onSaved }) {
  const [rating, setRating] = useState(review?.rating || 0)
  const [comment, setComment] = useState(review?.comment || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!rating) {
      setError('Choose a rating from 1 to 5 stars.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const body = { rating, comment: comment.trim() || null, enrollmentId: enrollment.id }
      const saved = review ? await reviewsApi.update(review.id, body) : await reviewsApi.create(body)
      onSaved(saved)
    } catch (err) {
      setError(getErrorMessage(err, 'Your review could not be saved.'))
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title={review ? 'Edit your review' : 'Rate your teacher'}
      description={`${enrollment.courseTitle} · with ${enrollment.tutorName}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={save}>
            {review ? 'Save changes' : 'Publish review'}
          </Button>
        </>
      }
    >
      <div className="stack">
        {error && <Alert type="error">{error}</Alert>}
        <div className="field">
          <span className="field-label">Your rating</span>
          <StarInput value={rating} onChange={setRating} />
        </div>
        <Field label="Your comment" optional hint={`${comment.length}/255`}>
          <textarea
            className="textarea"
            maxLength={255}
            placeholder="What did you like? How did the teacher help you?"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}
