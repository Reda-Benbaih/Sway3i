import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'
import Avatar from '../ui/Avatar'
import { PageLoader } from '../ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { fullName, ROLE_LABELS } from '../../utils/format'

const NAVIGATION = {
  STUDENT: [
    { to: '/student', label: 'Dashboard', icon: 'grid', end: true },
    { to: '/student/find', label: 'Find teachers', icon: 'search' },
    { to: '/student/lessons', label: 'My lessons', icon: 'calendar' },
    { to: '/student/profile', label: 'Profile & settings', icon: 'user' },
  ],
  TUTOR: [
    { to: '/teacher', label: 'Dashboard', icon: 'grid', end: true },
    { to: '/teacher/bookings', label: 'Booking requests', icon: 'inbox' },
    { to: '/teacher/courses', label: 'My courses', icon: 'bookOpen' },
    { to: '/teacher/schedule', label: 'Schedule', icon: 'calendar' },
    { to: '/teacher/reviews', label: 'Reviews', icon: 'star' },
    { to: '/teacher/profile', label: 'Profile & settings', icon: 'user' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Overview', icon: 'grid', end: true },
    { to: '/admin/teachers', label: 'Teachers', icon: 'shield' },
    { to: '/admin/students', label: 'Students', icon: 'users' },
    { to: '/admin/bookings', label: 'Bookings', icon: 'clipboard' },
    { to: '/admin/reviews', label: 'Reviews', icon: 'message' },
    { to: '/admin/subjects', label: 'Subjects', icon: 'layers' },
  ],
}

const PROFILE_PATH = { STUDENT: '/student/profile', TUTOR: '/teacher/profile' }

function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const name = fullName(user) || user.email

  useEffect(() => {
    if (!open) return
    const onClick = (event) => !ref.current?.contains(event.target) && setOpen(false)
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className="user-button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={name} size="sm" />
        <span className="user-name">{user.firstName || name}</span>
        <Icon name="chevronDown" size={16} />
      </button>
      {open && (
        <div className="dropdown-menu" role="menu">
          <div className="dropdown-header">
            <strong>{name}</strong>
            <span>{user.email}</span>
          </div>
          {PROFILE_PATH[user.role] && (
            <Link to={PROFILE_PATH[user.role]} className="dropdown-item" role="menuitem" onClick={() => setOpen(false)}>
              <Icon name="settings" size={18} /> Profile & settings
            </Link>
          )}
          <Link to="/" className="dropdown-item" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="home" size={18} /> Public website
          </Link>
          <button type="button" className="dropdown-item danger" role="menuitem" onClick={() => logout('/')}>
            <Icon name="logout" size={18} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const items = NAVIGATION[user.role] || []
  const current = [...items].reverse().find((item) => location.pathname.startsWith(item.to))

  return (
    <div className="app-shell">
      <a href="#app-main" className="visually-hidden skip-link">
        Skip to content
      </a>
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Dashboard navigation">
        <div className="sidebar-logo">
          <Logo light to="/" />
        </div>
        <p className="sidebar-role">{ROLE_LABELS[user.role]} space</p>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar-link" onClick={() => setSidebarOpen(false)}>
              <Icon name={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="sidebar-link" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => logout('/')}>
            <Icon name="logout" size={20} /> Log out
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="btn btn-ghost btn-icon menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Icon name="menu" size={22} />
          </button>
          <span className="topbar-title">{current?.label}</span>
          <div className="topbar-actions">
            <UserMenu />
          </div>
        </header>
        <main id="app-main" className="app-content">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
