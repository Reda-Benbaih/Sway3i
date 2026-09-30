import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Icon from '../../components/ui/Icon'
import BookingDialog from '../../components/teachers/BookingDialog'
import { Rating, Stars } from '../../components/ui/Stars'
import { VerifiedBadge } from '../../components/ui/StatusBadge'
import { Alert, EmptyState, ErrorState } from '../../components/ui/Feedback'
import { PageLoader } from '../../components/ui/Spinner'
import { listingsApi, reviewsApi, tutorsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { COURSE_FORMATS, COURSE_TYPES, LEVELS, formatDate, formatPrice, fullName, slotLabel, sortSlots } from '../../utils/format'

function CourseItem({ listing, canBook, onBook }) {
  const slots = sortSlots(listing.weeklySlots)
  const online = listing.courseFormat === 'ONLINE'
  return (
    <article className="course-item">
      <div className="course-item-main">
        <div className="row" style={{ gap: 8 }}>
          <span className="badge badge-brand">{listing.subjectName}</span>
          <span className="badge">{listing.level ? LEVELS[listing.level] : 'All levels'}</span>
        </div>
        <h3>{listing.title}</h3>
        {listing.description && <p className="text-muted text-sm">{listing.description}</p>}
        <div className="meta-list">
          <span>
            <Icon name={online ? 'video' : 'mapPin'} size={16} />
            {online ? COURSE_FORMATS.ONLINE : listing.locationOrLink || COURSE_FORMATS.IN_PERSON}
          </span>
          <span>
            <Icon name="users" size={16} /> {COURSE_TYPES[listing.courseType]}
            {listing.maxCapacity ? ` · ${listing.maxCapacity} seats` : ''}
          </span>
        </div>
        {slots.length > 0 && (
          <div className="chip-list">
            {slots.map((slot) => (
              <span key={slot.id} className="chip">
                <Icon name="clock" size={14} /> {slotLabel(slot)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="course-item-side">
        <span className="listing-price">
          <strong>{formatPrice(listing.monthlyPrice)}</strong>
          <span>/ month</span>
        </span>
        {canBook && (
          <button type="button" className="btn btn-primary" onClick={() => onBook(listing)}>
            Request a lesson
          </button>
        )}
      </div>
    </article>
  )
}

export default function TeacherProfile({ backTo = '/teachers' }) {
  const { id } = useParams()
  const tutor = useAsync(() => tutorsApi.get(id), [id])
  const listings = useAsync(() => listingsApi.byTutor(id), [id])
  const reviews = useAsync(() => reviewsApi.byTutor(id), [id])
  const [booking, setBooking] = useState(null)
  const name = fullName(tutor.data)
  useDocumentTitle(name || 'Teacher')

  if (tutor.loading) return <PageLoader />
  if (tutor.error) {
    return (
      <div className="container section-pad">
        <div className="card">
          {tutor.error.response?.status === 404 ? (
            <EmptyState icon="user" title="Teacher not found" action="Back to search" actionTo={backTo}>
              This profile does not exist or has been removed.
            </EmptyState>
          ) : (
            <ErrorState error={tutor.error} onRetry={tutor.reload} />
          )}
        </div>
      </div>
    )
  }

  const t = tutor.data
  const activeListings = (listings.data || []).filter((listing) => listing.isActive)
  const reviewList = [...(reviews.data || [])].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  const inApp = backTo.startsWith('/student')

  return (
    <div className={inApp ? '' : 'container section-pad'} style={inApp ? undefined : { paddingTop: 28 }}>
      <Link to={backTo} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        <Icon name="arrowLeft" size={16} /> Back to search
      </Link>

      <div className="profile-layout">
        <div className="stack" style={{ gap: 20 }}>
          <section className="card profile-hero">
            <Avatar name={name} size="xl" />
            <div className="profile-hero-info">
              <div className="row" style={{ gap: 10 }}>
                <h1>{name}</h1>
                <VerifiedBadge verified={t.isVerified} />
              </div>
              {t.degree && (
                <p className="profile-degree">
                  <Icon name="award" size={18} /> {t.degree}
                </p>
              )}
              <div className="meta-list">
                <Rating value={t.averageRating} count={t.reviewCount} />
                {t.city && (
                  <span>
                    <Icon name="mapPin" size={16} /> {t.city}
                  </span>
                )}
                {t.teachingZones && (
                  <span>
                    <Icon name="layers" size={16} /> Teaches in {t.teachingZones}
                  </span>
                )}
              </div>
            </div>
          </section>

          {!t.isVerified && (
            <Alert type="warning">This teacher’s profile is being validated by our team. Bookings will open once it is approved.</Alert>
          )}

          <section className="card">
            <div className="card-body stack">
              <h2 className="card-title">About</h2>
              <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                {t.biography || 'This teacher has not written a biography yet.'}
              </p>
              {t.subjects?.length > 0 && (
                <>
                  <h3 className="subheading">Subjects</h3>
                  <div className="chip-list">
                    {t.subjects.map((subject) => (
                      <span key={subject.id} className="chip">
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Courses &amp; availability</h2>
              <span className="text-soft text-sm">{activeListings.length} open</span>
            </div>
            {listings.loading ? (
              <div className="card-body">
                <div className="skeleton" style={{ height: 120 }} />
              </div>
            ) : activeListings.length === 0 ? (
              <EmptyState icon="bookOpen" title="No course open right now">
                This teacher has not published a course yet.
              </EmptyState>
            ) : (
              <div className="course-list">
                {activeListings.map((listing) => (
                  <CourseItem key={listing.id} listing={listing} canBook={t.isVerified} onBook={setBooking} />
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Reviews</h2>
              {t.averageRating && <Rating value={t.averageRating} count={reviewList.length} />}
            </div>
            {reviewList.length === 0 ? (
              <EmptyState icon="star" title="No reviews yet">
                Reviews are written by students after a completed course.
              </EmptyState>
            ) : (
              <ul className="review-list">
                {reviewList.map((review) => (
                  <li key={review.id} className="review-item">
                    <Avatar name={review.studentName || 'Student'} size="sm" />
                    <div>
                      <div className="row-between">
                        <strong>{review.studentName || 'Student'}</strong>
                        <span className="text-soft text-sm">{formatDate(review.publishedAt)}</span>
                      </div>
                      <Stars value={review.rating} size={14} />
                      {review.comment && <p className="review-comment">{review.comment}</p>}
                      {review.courseTitle && <span className="text-soft text-sm">{review.courseTitle}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="profile-aside">
          <div className="card">
            <div className="card-body stack">
              {t.hourlyRate !== null && t.hourlyRate !== undefined && (
                <div>
                  <span className="text-soft text-sm">Hourly rate</span>
                  <div className="big-price">
                    {formatPrice(t.hourlyRate)} <span>/ hour</span>
                  </div>
                </div>
              )}
              <ul className="fact-list">
                <li>
                  <Icon name="bookOpen" size={18} /> {activeListings.length} course{activeListings.length === 1 ? '' : 's'} open
                </li>
                <li>
                  <Icon name="star" size={18} /> {t.reviewCount || 0} review{t.reviewCount === 1 ? '' : 's'}
                </li>
                <li>
                  <Icon name="calendar" size={18} /> Member since {formatDate(t.createdAt, { month: 'long', year: 'numeric' })}
                </li>
              </ul>
              {t.isVerified && activeListings.length > 0 && (
                <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => setBooking(activeListings[0])}>
                  Request a lesson
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      <BookingDialog listing={booking} onClose={() => setBooking(null)} onBooked={listings.reload} />
    </div>
  )
}
