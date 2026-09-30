export const LEVELS = {
  PRIMARY: 'Primary school',
  MIDDLE_SCHOOL: 'Middle school',
  HIGH_SCHOOL: 'High school',
  HIGHER_EDUCATION: 'Higher education',
}

export const COURSE_FORMATS = {
  ONLINE: 'Online',
  IN_PERSON: 'In person',
}

export const COURSE_TYPES = {
  INDIVIDUAL: 'Individual',
  GROUP: 'Small group',
}

export const DAYS = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

export const DAY_ORDER = Object.keys(DAYS)

export const ROLE_LABELS = {
  STUDENT: 'Student',
  TUTOR: 'Teacher',
  ADMIN: 'Administrator',
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  const number = Number(value)
  return `${Number.isInteger(number) ? number : number.toFixed(2)} MAD`
}

export function formatTime(value) {
  return value ? value.slice(0, 5) : ''
}

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return date.toLocaleDateString('en-GB', options)
}

export function formatDateLong(value) {
  return formatDate(value, { weekday: 'long', day: 'numeric', month: 'long' })
}

export function fullName(person) {
  if (!person) return ''
  return [person.firstName, person.lastName].filter(Boolean).join(' ')
}

export function toDateInput(date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function todayInput() {
  return toDateInput(new Date())
}

export function addMonths(dateString, months) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setMonth(date.getMonth() + months)
  return toDateInput(date)
}

export function sortSlots(slots = []) {
  return [...slots].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime),
  )
}

export function slotLabel(slot) {
  return `${DAYS[slot.dayOfWeek]} · ${formatTime(slot.startTime)}–${formatTime(slot.endTime)}`
}
