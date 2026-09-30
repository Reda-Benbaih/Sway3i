import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { DashboardRedirect, GuestRoute, ProtectedRoute } from './routing/guards'
import PublicLayout from './components/layout/PublicLayout'
import AppLayout from './components/layout/AppLayout'
import { PageLoader } from './components/ui/Spinner'

import Landing from './pages/public/Landing'
import FindTeachers from './pages/public/FindTeachers'
import TeacherProfile from './pages/public/TeacherProfile'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import { NotFound, Unauthorized } from './pages/public/StatusPages'

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentLessons = lazy(() => import('./pages/student/StudentLessons'))
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'))

const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'))
const TeacherBookings = lazy(() => import('./pages/teacher/TeacherBookings'))
const TeacherCourses = lazy(() => import('./pages/teacher/TeacherCourses'))
const TeacherSchedule = lazy(() => import('./pages/teacher/TeacherSchedule'))
const TeacherReviews = lazy(() => import('./pages/teacher/TeacherReviews'))
const TeacherProfileSettings = lazy(() => import('./pages/teacher/TeacherProfileSettings'))

const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminTeachers = lazy(() => import('./pages/admin/AdminTeachers'))
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))
const AdminSubjects = lazy(() => import('./pages/admin/AdminSubjects'))

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Landing />} />
              <Route path="teachers" element={<FindTeachers />} />
              <Route path="teachers/:id" element={<TeacherProfile />} />
            </Route>

            <Route element={<GuestRoute />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            <Route path="dashboard" element={<DashboardRedirect />} />

            <Route element={<ProtectedRoute roles={['STUDENT']} />}>
              <Route path="student" element={<AppLayout />}>
                <Route index element={<StudentDashboard />} />
                <Route path="find" element={<FindTeachers basePath="/student/teachers" inApp />} />
                <Route path="teachers/:id" element={<TeacherProfile backTo="/student/find" />} />
                <Route path="lessons" element={<StudentLessons />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute roles={['TUTOR']} />}>
              <Route path="teacher" element={<AppLayout />}>
                <Route index element={<TeacherDashboard />} />
                <Route path="bookings" element={<TeacherBookings />} />
                <Route path="courses" element={<TeacherCourses />} />
                <Route path="schedule" element={<TeacherSchedule />} />
                <Route path="reviews" element={<TeacherReviews />} />
                <Route path="profile" element={<TeacherProfileSettings />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="admin" element={<AppLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="subjects" element={<AdminSubjects />} />
              </Route>
            </Route>

            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
