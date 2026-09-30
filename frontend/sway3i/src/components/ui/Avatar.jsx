const palette = [
  ['#4338ca', '#5b50e6'],
  ['#0d9488', '#14b8a6'],
  ['#7c3aed', '#a78bfa'],
  ['#0369a1', '#38bdf8'],
  ['#b45309', '#f59e0b'],
  ['#be185d', '#f472b6'],
]

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  const [from, to] = palette[hash % palette.length]

  return (
    <span
      className={`avatar${size !== 'md' ? ` avatar-${size}` : ''} ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
