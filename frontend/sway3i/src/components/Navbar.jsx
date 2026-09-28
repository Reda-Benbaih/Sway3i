import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Sway3i</Link>
      <div className="nav-links">
        <Link to="/discover">Discover</Link>
        {user.role === 'TUTOR' && <Link to="/my-listings">My Listings</Link>}
        <Link to="/dashboard">Dashboard</Link>
        <span>{user.email}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}
