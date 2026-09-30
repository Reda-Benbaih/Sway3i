import { Link } from 'react-router-dom'

export function LogoMark({ className = 'logo-mark' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#27208f" />
      <path d="M11 14.5c3-1.6 6.1-1.6 9 0v13c-2.9-1.6-6-1.6-9 0z" fill="#fff" opacity=".92" />
      <path d="M29 14.5c-3-1.6-6.1-1.6-9 0v13c2.9-1.6 6-1.6 9 0z" fill="#2dd4bf" />
      <circle cx="29" cy="10.5" r="2.4" fill="#2dd4bf" />
    </svg>
  )
}

export default function Logo({ to = '/', light = false, onClick }) {
  return (
    <Link to={to} className={`logo${light ? ' light' : ''}`} onClick={onClick} aria-label="Sway3i home">
      <LogoMark />
      <span>
        Sway<span className="logo-accent">3i</span>
      </span>
    </Link>
  )
}
