import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Icon from '../../components/ui/Icon'
import Tabs from '../../components/ui/Tabs'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { Alert, EmptyState, ErrorState } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'
import { listingsApi, sessionsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { DAYS, DAY_ORDER, formatDateLong, formatTime, todayInput } from '../../utils/format'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'

const COLORS = ['brand', 'accent', 'violet', 'sky', 'amber', 'rose']

function WeekGrid({ courses }) {
  const slots = courses.flatMap((course, index) =>
    (course.weeklySlots || []).map((slot) => ({ ...slot, course, color: COLORS[index % COLORS.length] })),
  )

  if (slots.length === 0) {
    return (
      <EmptyState icon="clock" title="No weekly time slot yet" action="Add time slots" actionTo="/teacher/courses">
        Add time slots to your courses so students can book them.
      </EmptyState>
    )
  }

  return (
    <div className="week-grid">
      {DAY_ORDER.map((day) => {
        const daySlots = slots.filter((slot) => slot.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
        return (
          <div key={day} className="week-day">
            <div className="week-day-name">{DAYS[day]}</div>
            <div className="week-day-slots">
              {daySlots.length === 0 ? (
                <span className="week-empty">Free</span>
              ) : (
                daySlots.map((slot) => (
                  <div key={slot.id} className={`week-slot tone-${slot.color}`}>
                    <strong>
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </strong>
                    <span>{slot.course.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SessionForm({ courses, onClose, onSaved }) {
  const [form, setForm] = useState({ courseListingId: courses[0]?.id || '', date: todayInput(), startTime: '', endTime: '' })
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const save = async () => {
    const nextErrors = {}
    if (!form.startTime) nextErrors.startTime = 'Required'
    if (!form.endTime) nextErrors.endTime = 'Required'
    else if (form.endTime <= form.startTime) nextErrors.endTime = 'Must be after the start time'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true)
    setError('')
    try {
      await sessionsApi.create({ ...form, courseListingId: Number(form.courseListingId) })
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err, 'The session could not be created.'))
      setErrors(getFieldErrors(err))
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title="Plan a session"
      description="A dated lesson for one of your courses."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={save}>
            Plan session
          </Button>
        </>
      }
    >
      <div className="stack">
        {error && <Alert type="error">{error}</Alert>}
        <Field label="Course">
          <select className="select" value={form.courseListingId} onChange={update('courseListingId')}>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date" error={errors.date}>
          <input className="input" type="date" min={todayInput()} value={form.date} onChange={update('date')} />
        </Field>
        <div className="form-grid cols-2">
          <Field label="Start" error={errors.startTime}>
            <input className="input" type="time" value={form.startTime} onChange={update('startTime')} />
          </Field>
          <Field label="End" error={errors.endTime || errors.timeRangeValid}>
            <input className="input" type="time" value={form.endTime} onChange={update('endTime')} />
          </Field>
        </div>
      </div>
    </Modal>
  )
}

export default function TeacherSchedule() {
  useDocumentTitle('Schedule')
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('upcoming')
  const [planning, setPlanning] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const data = useAsync(async () => {
    const courses = await listingsApi.byTutor(user.userId)
    const lists = await Promise.all(courses.map((course) => sessionsApi.byListing(course.id).catch(() => [])))
    const byId = Object.fromEntries(courses.map((course) => [course.id, course]))
    const sessions = lists.flat().map((session) => ({ ...session, course: byId[session.courseListingId] }))
    return { courses, sessions }
  }, [user.userId])

  if (data.loading) return <PageLoader />
  if (data.error) return <ErrorState error={data.error} onRetry={data.reload} />

  const { courses, sessions } = data.data
  const today = todayInput()
  const upcoming = sessions
    .filter((s) => s.status === 'SCHEDULED' && s.date >= today)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
  const past = sessions
    .filter((s) => !(s.status === 'SCHEDULED' && s.date >= today))
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))
  const visible = tab === 'upcoming' ? upcoming : past

  const setStatus = async (session, status) => {
    try {
      await sessionsApi.update(session.id, {
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        courseListingId: session.courseListingId,
        status,
      })
      toast.success(status === 'DONE' ? 'Session marked as done.' : 'Session cancelled.')
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The session could not be updated.'))
    }
  }

  const remove = async () => {
    try {
      await sessionsApi.remove(deleting.id)
      toast.success('Session deleted.')
      data.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The session could not be deleted.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Schedule</h1>
          <p>Your weekly availability and the sessions you have planned.</p>
        </div>
        <Button variant="primary" onClick={() => setPlanning(true)} disabled={courses.length === 0}>
          <Icon name="plus" size={18} /> Plan a session
        </Button>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2>Weekly availability</h2>
          <Link to="/teacher/courses" className="btn btn-ghost btn-sm">
            <Icon name="edit" size={14} /> Edit time slots
          </Link>
        </div>
        <div className="card-body">
          <WeekGrid courses={courses} />
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Sessions</h2>
          <Tabs
            label="Sessions"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'upcoming', label: 'Upcoming', count: upcoming.length },
              { value: 'past', label: 'Past & closed', count: past.length },
            ]}
          />
        </div>
        {visible.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={tab === 'upcoming' ? 'No upcoming session' : 'No past session'}
            action={tab === 'upcoming' && courses.length ? 'Plan a session' : undefined}
            onAction={() => setPlanning(true)}
          >
            {courses.length === 0 ? 'Create a course first to plan sessions.' : 'Planned sessions help you and your students keep track of lessons.'}
          </EmptyState>
        ) : (
          <ul className="session-list">
            {visible.map((session) => (
              <li key={session.id} className="session-row">
                <div className="date-chip">
                  <strong>{new Date(`${session.date}T00:00:00`).getDate()}</strong>
                  <span>{new Date(`${session.date}T00:00:00`).toLocaleDateString('en-GB', { month: 'short' })}</span>
                </div>
                <div className="session-row-main">
                  <strong>{session.course?.title}</strong>
                  <span className="text-soft text-sm">
                    {formatDateLong(session.date)} · {formatTime(session.startTime)}–{formatTime(session.endTime)}
                  </span>
                </div>
                <StatusBadge status={session.status} kind="session" />
                <div className="row" style={{ gap: 6 }}>
                  {session.status === 'SCHEDULED' && (
                    <>
                      <Button size="sm" onClick={() => setStatus(session, 'DONE')}>
                        <Icon name="check" size={14} /> Done
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setStatus(session, 'CANCELLED')}>
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setDeleting(session)} aria-label="Delete session">
                    <Icon name="trash" size={14} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {planning && (
        <SessionForm
          courses={courses}
          onClose={() => setPlanning(false)}
          onSaved={() => {
            toast.success('Session planned.')
            setPlanning(false)
            data.reload()
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this session?"
        message="The session will be removed from your schedule."
        confirmLabel="Delete"
        danger
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
