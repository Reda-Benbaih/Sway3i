import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Icon from '../ui/Icon'
import { Rating } from '../ui/Stars'
import { COURSE_FORMATS, COURSE_TYPES, LEVELS, formatPrice, slotLabel, sortSlots } from '../../utils/format'

export default function ListingCard({ listing, basePath = '/teachers', onBook }) {
  const slots = sortSlots(listing.weeklySlots)
  const online = listing.courseFormat === 'ONLINE'
  return (
    <article className="card card-hover listing-card">
      <div className="listing-card-head">
        <span className="badge badge-brand">{listing.subjectName}</span>
        <span className="listing-price">
          <strong>{formatPrice(listing.monthlyPrice)}</strong>
          <span>/ month</span>
        </span>
      </div>

      <h3 className="listing-title">{listing.title}</h3>
      {listing.description && <p className="listing-desc">{listing.description}</p>}

      <div className="meta-list">
        <span>
          <Icon name={online ? 'video' : 'mapPin'} size={16} />
          {online ? 'Online' : listing.locationOrLink || COURSE_FORMATS.IN_PERSON}
        </span>
        <span>
          <Icon name="users" size={16} />
          {COURSE_TYPES[listing.courseType]}
          {listing.maxCapacity ? ` · ${listing.maxCapacity} seats` : ''}
        </span>
        <span>
          <Icon name="graduation" size={16} />
          {listing.level ? LEVELS[listing.level] : 'All levels'}
        </span>
      </div>

      {slots.length > 0 && (
        <div className="slot-preview">
          <Icon name="clock" size={16} />
          <span>
            {slotLabel(slots[0])}
            {slots.length > 1 && ` + ${slots.length - 1} more`}
          </span>
        </div>
      )}

      <div className="listing-card-footer">
        <Link to={`${basePath}/${listing.tutorId}`} className="listing-tutor">
          <Avatar name={listing.tutorName} size="sm" />
          <span>
            <strong>{listing.tutorName}</strong>
            <Rating value={listing.tutorAverageRating} />
          </span>
        </Link>
        {onBook && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onBook(listing)}>
            Book
          </button>
        )}
      </div>
    </article>
  )
}
