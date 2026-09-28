import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <h1>Welcome {user.email}</h1>
      <p>Role: {user.role}</p>
      <Link to="/discover">Browse tutors</Link>
    </div>
  )
}
