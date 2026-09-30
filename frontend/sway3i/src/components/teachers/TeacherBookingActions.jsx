import { useState } from 'react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Icon from '../ui/Icon'
import Modal, { ConfirmDialog } from '../ui/Modal'
import { useToast } from '../../hooks/useToast'
import { enrollmentsApi } from '../../api/services'
import { getErrorMessage } from '../../utils/errors'

export default function TeacherBookingActions({ enrollment, onChanged }) {
  const toast = useToast()
  const [busy, setBusy] = useState(null)
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [confirm, setConfirm] = useState(null)

  const setStatus = async (status, message, rejectionReason) => {
    setBusy(status)
    try {
      await enrollmentsApi.setStatus(enrollment.id, status, rejectionReason)
      toast.success(message)
      onChanged()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The booking could not be updated.'))
    } finally {
      setBusy(null)
    }
  }

  const cancel = async () => {
    try {
      await enrollmentsApi.cancel(enrollment.id)
      toast.success('The course has been cancelled.')
      onChanged()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The course could not be cancelled.'))
    }
  }

  const { status } = enrollment

  return (
    <>
      {status === 'PENDING' && (
        <>
          <Button size="sm" variant="primary" loading={busy === 'CONFIRMED'} onClick={() => setStatus('CONFIRMED', `You accepted ${enrollment.studentName}’s request.`)}>
            <Icon name="check" size={14} /> Accept
          </Button>
          <Button size="sm" variant="danger-soft" onClick={() => setDeclining(true)}>
            Decline
          </Button>
        </>
      )}
      {status === 'CONFIRMED' && (
        <Button size="sm" variant="soft" loading={busy === 'ACTIVE'} onClick={() => setStatus('ACTIVE', 'The course is now in progress.')}>
          <Icon name="play" size={14} /> Start course
        </Button>
      )}
      {(status === 'CONFIRMED' || status === 'ACTIVE') && (
        <>
          <Button size="sm" loading={busy === 'COMPLETED'} onClick={() => setConfirm('complete')}>
            <Icon name="checkCircle" size={14} /> Mark completed
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirm('cancel')}>
            Cancel
          </Button>
        </>
      )}

      <Modal
        open={declining}
        title="Decline this request?"
        description={`${enrollment.studentName} will see your message in their lessons.`}
        onClose={() => setDeclining(false)}
        footer={
          <>
            <Button onClick={() => setDeclining(false)}>Back</Button>
            <Button
              variant="danger"
              loading={busy === 'REJECTED'}
              onClick={async () => {
                await setStatus('REJECTED', 'The request has been declined.', reason.trim())
                setDeclining(false)
                setReason('')
              }}
            >
              Decline request
            </Button>
          </>
        }
      >
        <Field label="Message to the student" optional hint="For example: this time slot is no longer available.">
          <textarea className="textarea" maxLength={255} value={reason} onChange={(event) => setReason(event.target.value)} />
        </Field>
      </Modal>

      <ConfirmDialog
        open={confirm === 'complete'}
        title="Mark this course as completed?"
        message={`${enrollment.studentName} will then be able to rate the course. This cannot be undone.`}
        confirmLabel="Mark completed"
        onConfirm={() => setStatus('COMPLETED', 'Course marked as completed.')}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'cancel'}
        title="Cancel this course?"
        message={`The course with ${enrollment.studentName} will be cancelled for both of you.`}
        confirmLabel="Cancel course"
        danger
        onConfirm={cancel}
        onClose={() => setConfirm(null)}
      />
    </>
  )
}
