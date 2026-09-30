import { useState } from 'react'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import Icon from '../../components/ui/Icon'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import { Alert, EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'
import { fromPage, listingsApi, slotsApi, subjectsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { COURSE_FORMATS, COURSE_TYPES, DAYS, LEVELS, formatPrice, formatTime, sortSlots } from '../../utils/format'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'
import { clean } from '../../utils/validation'

const emptyCourse = {
  title: '',
  description: '',
  subjectId: '',
  level: '',
  courseType: 'INDIVIDUAL',
  courseFormat: 'ONLINE',
  monthlyPrice: '',
  maxCapacity: '',
  locationOrLink: '',
  isActive: true,
}

function CourseForm({ course, subjects, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    course
      ? {
          ...emptyCourse,
          ...Object.fromEntries(Object.keys(emptyCourse).map((key) => [key, course[key] ?? emptyCourse[key]])),
        }
      : emptyCourse,
  )
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field) => (event) =>
    setForm({ ...form, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value })

  const save = async () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Title is required'
    if (!form.subjectId) nextErrors.subjectId = 'Choose a subject'
    if (!(Number(form.monthlyPrice) > 0)) nextErrors.monthlyPrice = 'Price must be positive'
    if (form.maxCapacity && Number(form.maxCapacity) < 1) nextErrors.maxCapacity = 'At least 1 seat'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    setError('')
    const body = clean({
      ...form,
      title: form.title.trim(),
      subjectId: Number(form.subjectId),
      monthlyPrice: Number(form.monthlyPrice),
      maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : '',
    })
    try {
      const saved = course ? await listingsApi.update(course.id, body) : await listingsApi.create(body)
      onSaved(saved, !course)
    } catch (err) {
      setError(getErrorMessage(err, 'The course could not be saved.'))
      setErrors(getFieldErrors(err))
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      size="lg"
      title={course ? 'Edit course' : 'New course'}
      description="Students see this information when they search for a teacher."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={save}>
            {course ? 'Save changes' : 'Publish course'}
          </Button>
        </>
      }
    >
      <div className="stack">
        {error && <Alert type="error">{error}</Alert>}
        <div className="form-grid cols-2">
          <Field label="Title" error={errors.title} className="span-2">
            <input className="input" maxLength={100} placeholder="e.g. Maths for the Baccalaureate" value={form.title} onChange={update('title')} />
          </Field>
          <Field label="Subject" error={errors.subjectId}>
            <select className="select" value={form.subjectId} onChange={update('subjectId')}>
              <option value="">Choose a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="School level">
            <select className="select" value={form.level} onChange={update('level')}>
              <option value="">All levels</option>
              {Object.entries(LEVELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Format">
            <select className="select" value={form.courseFormat} onChange={update('courseFormat')}>
              {Object.entries(COURSE_FORMATS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select className="select" value={form.courseType} onChange={update('courseType')}>
              {Object.entries(COURSE_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price per month (MAD)" error={errors.monthlyPrice}>
            <input className="input" type="number" min="1" inputMode="decimal" value={form.monthlyPrice} onChange={update('monthlyPrice')} />
          </Field>
          <Field label="Seats" optional error={errors.maxCapacity} hint="Leave empty for no limit.">
            <input className="input" type="number" min="1" inputMode="numeric" value={form.maxCapacity} onChange={update('maxCapacity')} />
          </Field>
          <Field
            label={form.courseFormat === 'ONLINE' ? 'Meeting link' : 'Address or area'}
            optional
            className="span-2"
            hint={form.courseFormat === 'ONLINE' ? 'e.g. your Google Meet or Zoom link' : 'Students can search by area.'}
          >
            <input className="input" value={form.locationOrLink} onChange={update('locationOrLink')} />
          </Field>
          <Field label="Description" optional className="span-2" hint={`${form.description.length}/255`}>
            <textarea className="textarea" maxLength={255} value={form.description} onChange={update('description')} />
          </Field>
        </div>
        {course && (
          <label className="switch">
            <input type="checkbox" checked={form.isActive} onChange={update('isActive')} />
            Open for booking
          </label>
        )}
      </div>
    </Modal>
  )
}

function SlotManager({ course, onChanged }) {
  const toast = useToast()
  const [slot, setSlot] = useState({ dayOfWeek: 'MONDAY', startTime: '', endTime: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const slots = sortSlots(course.weeklySlots)

  const add = async (event) => {
    event.preventDefault()
    if (!slot.startTime || !slot.endTime || slot.endTime <= slot.startTime) {
      setError('The end time must be after the start time.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await slotsApi.create({ ...slot, courseListingId: course.id })
      setSlot({ ...slot, startTime: '', endTime: '' })
      toast.success('Time slot added.')
      onChanged()
    } catch (err) {
      setError(getErrorMessage(err, 'The time slot could not be added.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      await slotsApi.remove(id)
      toast.success('Time slot removed.')
      onChanged()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The time slot could not be removed.'))
    }
  }

  return (
    <div className="slot-manager">
      <h4>Weekly time slots</h4>
      {slots.length === 0 ? (
        <p className="text-sm text-muted">No time slot yet. Students can still send a request, but slots make booking easier.</p>
      ) : (
        <div className="chip-list">
          {slots.map((item) => (
            <span key={item.id} className="chip slot-chip">
              <Icon name="clock" size={14} /> {DAYS[item.dayOfWeek]} {formatTime(item.startTime)}–{formatTime(item.endTime)}
              <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${DAYS[item.dayOfWeek]} ${formatTime(item.startTime)}`}>
                <Icon name="x" size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      <form className="slot-form" onSubmit={add}>
        <select className="select" value={slot.dayOfWeek} onChange={(event) => setSlot({ ...slot, dayOfWeek: event.target.value })} aria-label="Day">
          {Object.entries(DAYS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input className="input" type="time" value={slot.startTime} onChange={(event) => setSlot({ ...slot, startTime: event.target.value })} aria-label="Start time" required />
        <input className="input" type="time" value={slot.endTime} onChange={(event) => setSlot({ ...slot, endTime: event.target.value })} aria-label="End time" required />
        <Button type="submit" variant="soft" loading={saving}>
          <Icon name="plus" size={16} /> Add
        </Button>
      </form>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

export default function TeacherCourses() {
  useDocumentTitle('My courses')
  const { user } = useAuth()
  const toast = useToast()
  const courses = useAsync(() => listingsApi.byTutor(user.userId), [user.userId])
  const subjects = useAsync(() => subjectsApi.list().then(fromPage), [])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const subjectList = subjects.data?.items || []

  const remove = async () => {
    try {
      await listingsApi.remove(deleting.id)
      toast.success('The course has been deleted.')
      courses.reload()
    } catch (err) {
      toast.error(getErrorMessage(err, 'The course could not be deleted.'))
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My courses</h1>
          <p>Publish your courses and the weekly time slots students can book.</p>
        </div>
        <Button variant="primary" onClick={() => setEditing('new')} disabled={subjectList.length === 0}>
          <Icon name="plus" size={18} /> New course
        </Button>
      </div>

      {!subjects.loading && subjectList.length === 0 && (
        <Alert type="info" className="mb-24">
          No subject has been created on the platform yet. An administrator needs to add subjects before you can publish a course.
        </Alert>
      )}

      {courses.loading ? (
        <div className="stack">
          <SkeletonCards count={2} height={200} />
        </div>
      ) : courses.error ? (
        <div className="card">
          <ErrorState error={courses.error} onRetry={courses.reload} />
        </div>
      ) : courses.data.length === 0 ? (
        <div className="card">
          <EmptyState icon="bookOpen" title="You have not published a course yet" action={subjectList.length ? 'Create my first course' : undefined} onAction={() => setEditing('new')}>
            A course describes what you teach, at which level, where and for how much.
          </EmptyState>
        </div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {courses.data.map((course) => (
            <article key={course.id} className="card course-admin">
              <div className="card-body stack">
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <div className="stack" style={{ gap: 8 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span className="badge badge-brand">{course.subjectName}</span>
                      <span className="badge">{course.level ? LEVELS[course.level] : 'All levels'}</span>
                      <span className={`badge badge-dot ${course.isActive ? 'badge-success' : ''}`}>{course.isActive ? 'Open for booking' : 'Hidden'}</span>
                    </div>
                    <h3 className="course-admin-title">{course.title}</h3>
                    <div className="meta-list">
                      <span>
                        <Icon name={course.courseFormat === 'ONLINE' ? 'video' : 'mapPin'} size={16} />
                        {course.courseFormat === 'ONLINE' ? 'Online' : course.locationOrLink || 'In person'}
                      </span>
                      <span>
                        <Icon name="users" size={16} /> {COURSE_TYPES[course.courseType]}
                        {course.maxCapacity ? ` · ${course.maxCapacity} seats` : ''}
                      </span>
                      <span>
                        <Icon name="wallet" size={16} /> {formatPrice(course.monthlyPrice)} / month
                      </span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <Button size="sm" onClick={() => setEditing(course)}>
                      <Icon name="edit" size={14} /> Edit
                    </Button>
                    <Button size="sm" variant="danger-soft" onClick={() => setDeleting(course)} aria-label={`Delete ${course.title}`}>
                      <Icon name="trash" size={14} />
                    </Button>
                  </div>
                </div>
                <SlotManager course={course} onChanged={courses.reload} />
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <CourseForm
          course={editing === 'new' ? null : editing}
          subjects={subjectList}
          onClose={() => setEditing(null)}
          onSaved={(saved, created) => {
            toast.success(created ? 'Your course is published.' : 'Course updated.')
            setEditing(null)
            courses.reload()
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this course?"
        message={`“${deleting?.title}” and all its bookings, time slots and sessions will be permanently deleted. To stop new bookings only, edit the course and hide it instead.`}
        confirmLabel="Delete course"
        danger
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
