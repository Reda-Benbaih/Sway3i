import { useAuth } from '../context/AuthContext'
import StudentDashboard from './StudentDashboard'
import TutorDashboard from './TutorDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  return user.role === 'TUTOR' ? <TutorDashboard /> : <StudentDashboard />
}
