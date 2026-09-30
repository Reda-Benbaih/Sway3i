import Icon from './Icon'

export default function Pagination({ page, totalPages, total, onChange, itemLabel = 'results' }) {
  if (totalPages <= 1) {
    return total ? <div className="pagination">{total} {itemLabel}</div> : null
  }
  return (
    <nav className="pagination" aria-label="Pagination">
      <span>
        Page {page + 1} of {totalPages} · {total} {itemLabel}
      </span>
      <div className="pagination-buttons">
        <button type="button" className="btn btn-sm" onClick={() => onChange(page - 1)} disabled={page === 0}>
          <Icon name="chevronLeft" size={16} /> Previous
        </button>
        <button type="button" className="btn btn-sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}>
          Next <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </nav>
  )
}
