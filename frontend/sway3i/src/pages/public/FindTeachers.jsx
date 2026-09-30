import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ListingCard from '../../components/teachers/ListingCard'
import BookingDialog from '../../components/teachers/BookingDialog'
import Field from '../../components/ui/Field'
import Icon from '../../components/ui/Icon'
import Pagination from '../../components/ui/Pagination'
import { paginate } from '../../utils/paginate'
import { EmptyState, ErrorState, SkeletonCards } from '../../components/ui/Feedback'
import { fromPage, listingsApi, subjectsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { COURSE_FORMATS, LEVELS } from '../../utils/format'

const FILTER_KEYS = ['subjectId', 'level', 'courseFormat', 'minPrice', 'maxPrice', 'maxHourlyRate', 'location']
const PAGE_SIZE = 9

const SORTS = {
  relevance: { label: 'Best rated', compare: (a, b) => (b.tutorAverageRating || 0) - (a.tutorAverageRating || 0) },
  priceAsc: { label: 'Price: low to high', compare: (a, b) => a.monthlyPrice - b.monthlyPrice },
  priceDesc: { label: 'Price: high to low', compare: (a, b) => b.monthlyPrice - a.monthlyPrice },
}

function readFilters(params) {
  return Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) || '']))
}

export default function FindTeachers({ basePath = '/teachers', inApp = false }) {
  useDocumentTitle('Find a teacher')
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState(() => readFilters(params))
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)
  const [booking, setBooking] = useState(null)
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'relevance'

  const subjects = useAsync(() => subjectsApi.list().then(fromPage), [])
  const query = FILTER_KEYS.map((key) => params.get(key) || '').join('|')
  const results = useAsync(() => {
    const search = Object.fromEntries(FILTER_KEYS.filter((key) => params.get(key)).map((key) => [key, params.get(key)]))
    return listingsApi.search(search)
  }, [query])

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams()
      FILTER_KEYS.forEach((key) => filters[key] && next.set(key, filters[key]))
      if (sort !== 'relevance') next.set('sort', sort)
      if (next.toString() !== params.toString()) {
        setParams(next, { replace: true })
        setPage(0)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [filters, params, setParams, sort])

  const setFilter = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }))
  const activeCount = FILTER_KEYS.filter((key) => filters[key]).length

  const setSort = (value) => {
    const next = new URLSearchParams(params)
    if (value === 'relevance') next.delete('sort')
    else next.set('sort', value)
    setParams(next, { replace: true })
  }

  const sorted = useMemo(() => [...(results.data || [])].sort(SORTS[sort].compare), [results.data, sort])
  const { pageItems, totalPages, page: currentPage } = paginate(sorted, page, PAGE_SIZE)

  const filterPanel = (
    <div className="filters-panel card">
      <div className="card-body stack">
        <div className="row-between">
          <h2 className="filters-title">
            <Icon name="filter" size={18} /> Filters
          </h2>
          {activeCount > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilters(readFilters(new URLSearchParams()))}>
              Reset
            </button>
          )}
        </div>
        <Field label="Subject">
          <select className="select" value={filters.subjectId} onChange={setFilter('subjectId')}>
            <option value="">All subjects</option>
            {(subjects.data?.items || []).map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="School level">
          <select className="select" value={filters.level} onChange={setFilter('level')}>
            <option value="">All levels</option>
            {Object.entries(LEVELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Lesson format">
          <select className="select" value={filters.courseFormat} onChange={setFilter('courseFormat')}>
            <option value="">Online or in person</option>
            {Object.entries(COURSE_FORMATS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City or area">
          <input className="input" placeholder="e.g. Casablanca" value={filters.location} onChange={setFilter('location')} />
        </Field>
        <div className="form-grid cols-2">
          <Field label="Min / month">
            <input className="input" type="number" min="0" inputMode="numeric" placeholder="MAD" value={filters.minPrice} onChange={setFilter('minPrice')} />
          </Field>
          <Field label="Max / month">
            <input className="input" type="number" min="0" inputMode="numeric" placeholder="MAD" value={filters.maxPrice} onChange={setFilter('maxPrice')} />
          </Field>
        </div>
        <Field label="Max hourly rate" hint="Based on the teacher’s hourly rate.">
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="MAD / hour" value={filters.maxHourlyRate} onChange={setFilter('maxHourlyRate')} />
        </Field>
      </div>
    </div>
  )

  const header = (
    <>
      <h1>Find a teacher</h1>
      <p>Browse the courses offered by our validated teachers and send a booking request in a few clicks.</p>
    </>
  )

  return (
    <>
      {inApp ? (
        <div className="page-header">
          <div>{header}</div>
        </div>
      ) : (
        <section className="page-hero">
          <div className="container">{header}</div>
        </section>
      )}

      <div className={inApp ? '' : 'container section-pad'}>
        <div className="discover-layout">
          <aside className={`discover-filters${showFilters ? ' open' : ''}`}>{filterPanel}</aside>

          <div className="discover-results">
            <div className="results-bar">
              <button type="button" className="btn filters-toggle" onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters}>
                <Icon name="filter" size={18} /> Filters{activeCount > 0 && <span className="badge badge-brand">{activeCount}</span>}
              </button>
              <p className="text-muted text-sm" aria-live="polite">
                {results.loading ? 'Searching…' : `${sorted.length} course${sorted.length === 1 ? '' : 's'} found`}
              </p>
              <label className="sort-select">
                <span className="visually-hidden">Sort by</span>
                <select className="select" value={sort} onChange={(event) => setSort(event.target.value)}>
                  {Object.entries(SORTS).map(([value, option]) => (
                    <option key={value} value={value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {results.loading ? (
              <div className="card-grid">
                <SkeletonCards count={6} height={260} />
              </div>
            ) : results.error ? (
              <div className="card">
                <ErrorState error={results.error} onRetry={results.reload} />
              </div>
            ) : sorted.length === 0 ? (
              <div className="card">
                <EmptyState icon="search" title="No course matches your search">
                  {activeCount > 0
                    ? 'Try removing a filter or searching in a nearby area.'
                    : 'No course is open for booking yet. Come back soon!'}
                </EmptyState>
              </div>
            ) : (
              <>
                <div className="card-grid">
                  {pageItems.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} basePath={basePath} onBook={setBooking} />
                  ))}
                </div>
                <Pagination page={currentPage} totalPages={totalPages} total={sorted.length} onChange={setPage} itemLabel="courses" />
              </>
            )}
          </div>
        </div>
      </div>

      <BookingDialog listing={booking} onClose={() => setBooking(null)} />
    </>
  )
}
