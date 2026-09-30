import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'
import { useAuth } from '../../context/AuthContext'
import { dashboardPath } from '../../utils/session'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/teachers', label: 'Find teachers' },
  { to: '/#how-it-works', label: 'How it works', hash: true },
  { to: '/#for-teachers', label: 'For teachers', hash: true },
  { to: '/#about', label: 'About us', hash: true },
]

function NavItem({ link, onClick }) {
  if (link.hash) {
    return (
      <Link to={link.to} onClick={onClick}>
        {link.label}
      </Link>
    )
  }
  return (
    <NavLink to={link.to} end={link.end} onClick={onClick}>
      {link.label}
    </NavLink>
  )
}

export function PublicNavbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`site-header${scrolled || open ? ' scrolled' : ''}`}>
      <div className="container">
        <Logo onClick={close} />

        <nav className="site-nav" aria-label="Main">
          {links.map((link) => (
            <NavItem key={link.label} link={link} />
          ))}
        </nav>

        <div className="site-actions">
          {user ? (
            <Link to={dashboardPath(user.role)} className="btn btn-primary">
              <Icon name="grid" size={18} /> My dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-icon menu-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <Icon name={open ? 'x' : 'menu'} size={22} />
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
          {links.map((link) => (
            <NavItem key={link.label} link={link} onClick={close} />
          ))}
          <div className="mobile-actions">
            {user ? (
              <Link to={dashboardPath(user.role)} className="btn btn-primary btn-lg" onClick={close}>
                My dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" onClick={close}>
                  Get started
                </Link>
                <Link to="/login" className="btn btn-lg" onClick={close}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo light />
            <p>
              Sway3i connects students and parents with qualified private teachers, from primary school to higher
              education.
            </p>
          </div>
          <div className="footer-col">
            <h4>Students</h4>
            <ul>
              <li><Link to="/teachers">Find a teacher</Link></li>
              <li><Link to="/#how-it-works">How it works</Link></li>
              <li><Link to="/register?role=STUDENT">Create an account</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Teachers</h4>
            <ul>
              <li><Link to="/register?role=TUTOR">Become a teacher</Link></li>
              <li><Link to="/#for-teachers">How teaching works</Link></li>
              <li><Link to="/login">Teacher login</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Sway3i</h4>
            <ul>
              <li><Link to="/#about">About us</Link></li>
              <li><Link to="/#features">Features</Link></li>
              <li><Link to="/login">Log in</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Sway3i. All rights reserved.</span>
          <span>Made for learners in Morocco.</span>
        </div>
      </div>
    </footer>
  )
}

function useHashScroll() {
  const location = useLocation()
  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1))
      if (target) {
        requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth' }))
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [location.pathname, location.hash])
}

export default function PublicLayout() {
  useHashScroll()
  return (
    <>
      <a href="#main" className="visually-hidden">
        Skip to content
      </a>
      <PublicNavbar />
      <main id="main" className="public-main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
