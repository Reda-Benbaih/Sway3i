export default function Spinner({ label }) {
  return (
    <span className="spinner" role={label ? 'status' : undefined} aria-label={label}>
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  )
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="page-loader">
      <Spinner label={label} />
    </div>
  )
}
