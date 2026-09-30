import Spinner from './Spinner'

export default function Button({ variant = 'default', size, block, loading, children, className = '', type = 'button', disabled, ...rest }) {
  const classes = [
    'btn',
    variant !== 'default' && `btn-${variant}`,
    size && `btn-${size}`,
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner />}
      {children}
    </button>
  )
}
