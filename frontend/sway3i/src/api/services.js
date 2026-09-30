import api from './axios'

const data = (request) => request.then((response) => response.data)

export const authApi = {
  login: (body) => data(api.post('/auth/login', body)),
  registerStudent: (body) => data(api.post('/auth/register/student', body)),
  registerTutor: (body) => data(api.post('/auth/register/tutor', body)),
  google: (body) => data(api.post('/auth/google', body)),
  me: () => data(api.get('/users/me')),
}

export const subjectsApi = {
  list: (params = { size: 200, sort: 'name' }) => data(api.get('/subjects', { params })),
  create: (body) => data(api.post('/subjects', body)),
  update: (id, body) => data(api.put(`/subjects/${id}`, body)),
  remove: (id) => data(api.delete(`/subjects/${id}`)),
}

export const tutorsApi = {
  list: (params) => data(api.get('/tutors', { params })),
  pending: (params) => data(api.get('/tutors/pending-verification', { params })),
  get: (id) => data(api.get(`/tutors/${id}`)),
  update: (id, body) => data(api.put(`/tutors/${id}`, body)),
  verify: (id, verified) => data(api.put(`/tutors/${id}/verify`, null, { params: { verified } })),
  remove: (id) => data(api.delete(`/tutors/${id}`)),
}

export const studentsApi = {
  list: (params) => data(api.get('/students', { params })),
  get: (id) => data(api.get(`/students/${id}`)),
  update: (id, body) => data(api.put(`/students/${id}`, body)),
  remove: (id) => data(api.delete(`/students/${id}`)),
}

export const listingsApi = {
  search: (params) => data(api.get('/course-listings/search', { params })),
  byTutor: (tutorId) => data(api.get(`/course-listings/by-tutor/${tutorId}`)),
  get: (id) => data(api.get(`/course-listings/${id}`)),
  create: (body) => data(api.post('/course-listings', body)),
  update: (id, body) => data(api.put(`/course-listings/${id}`, body)),
  remove: (id) => data(api.delete(`/course-listings/${id}`)),
}

export const slotsApi = {
  byListing: (listingId) => data(api.get(`/weekly-slots/by-course-listing/${listingId}`)),
  create: (body) => data(api.post('/weekly-slots', body)),
  remove: (id) => data(api.delete(`/weekly-slots/${id}`)),
}

export const sessionsApi = {
  byListing: (listingId) => data(api.get(`/sessions/by-course-listing/${listingId}`)),
  create: (body) => data(api.post('/sessions', body)),
  update: (id, body) => data(api.put(`/sessions/${id}`, body)),
  remove: (id) => data(api.delete(`/sessions/${id}`)),
}

export const enrollmentsApi = {
  list: (params) => data(api.get('/enrollments', { params })),
  byStudent: (studentId) => data(api.get(`/enrollments/by-student/${studentId}`)),
  byTutor: (tutorId) => data(api.get(`/enrollments/by-tutor/${tutorId}`)),
  create: (body) => data(api.post('/enrollments', body)),
  setStatus: (id, status, rejectionReason) =>
    data(api.put(`/enrollments/${id}/status`, { status, rejectionReason: rejectionReason || null })),
  cancel: (id) => data(api.delete(`/enrollments/${id}`)),
}

export const reviewsApi = {
  list: (params) => data(api.get('/reviews', { params })),
  byTutor: (tutorId) => data(api.get(`/reviews/by-tutor/${tutorId}`)),
  byEnrollment: (enrollmentId) =>
    api
      .get(`/reviews/by-enrollment/${enrollmentId}`)
      .then((response) => response.data)
      .catch((error) => {
        if (error.response?.status === 404) return null
        throw error
      }),
  create: (body) => data(api.post('/reviews', body)),
  update: (id, body) => data(api.put(`/reviews/${id}`, body)),
  remove: (id) => data(api.delete(`/reviews/${id}`)),
}

export function fromPage(page) {
  return {
    items: page?.content ?? [],
    total: page?.totalElements ?? page?.page?.totalElements ?? 0,
    totalPages: page?.totalPages ?? page?.page?.totalPages ?? 0,
    page: page?.number ?? page?.page?.number ?? 0,
  }
}
