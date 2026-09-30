import { listingsApi, sessionsApi } from '../api/services'
import { todayInput } from '../utils/format'

export const UPCOMING = ['CONFIRMED', 'ACTIVE']
export const CLOSED = ['REJECTED', 'CANCELLED']

export async function loadEnrollmentsWithCourses(fetchEnrollments) {
  const enrollments = await fetchEnrollments()
  const ids = [...new Set(enrollments.map((enrollment) => enrollment.courseListingId))]
  const courses = await Promise.all(ids.map((id) => listingsApi.get(id).catch(() => null)))
  const courseMap = Object.fromEntries(courses.filter(Boolean).map((course) => [course.id, course]))
  const sorted = [...enrollments].sort((a, b) => (b.requestedAt || '').localeCompare(a.requestedAt || ''))
  return { enrollments: sorted, courses: courseMap }
}

export function slotOf(enrollment, courses) {
  return courses[enrollment.courseListingId]?.weeklySlots?.find((slot) => slot.id === enrollment.weeklySlotId)
}

export async function loadUpcomingSessions(courseIds, courses = {}) {
  const lists = await Promise.all([...new Set(courseIds)].map((id) => sessionsApi.byListing(id).catch(() => [])))
  const today = todayInput()
  return lists
    .flat()
    .filter((session) => session.status === 'SCHEDULED' && session.date >= today)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
    .map((session) => ({ ...session, course: courses[session.courseListingId] }))
}
