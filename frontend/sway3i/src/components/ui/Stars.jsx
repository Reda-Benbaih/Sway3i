import Icon from './Icon'

export function Stars({ value = 0, size = 16 }) {
  const rounded = Math.round(value)
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon key={star} name="star" size={size} filled className={star <= rounded ? '' : 'empty'} strokeWidth={1.2} />
      ))}
    </span>
  )
}

export function Rating({ value, count }) {
  if (!value) {
    return <span className="badge badge-accent">New on Sway3i</span>
  }
  return (
    <span className="rating">
      <Icon name="star" size={16} filled strokeWidth={1.2} style={{ color: 'var(--star)' }} />
      {Number(value).toFixed(1)}
      {count !== undefined && count !== null && (
        <span className="count">
          ({count} review{count === 1 ? '' : 's'})
        </span>
      )}
    </span>
  )
}

export function StarInput({ value, onChange }) {
  const labels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
  return (
    <div className="star-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''} – ${labels[star - 1]}`}
          className={star <= value ? 'on' : ''}
          onClick={() => onChange(star)}
        >
          <Icon name="star" size={28} filled strokeWidth={1.2} />
        </button>
      ))}
    </div>
  )
}
