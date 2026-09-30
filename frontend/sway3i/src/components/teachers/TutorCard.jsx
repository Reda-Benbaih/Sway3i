import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Icon from '../ui/Icon'
import { Rating } from '../ui/Stars'
import { formatPrice, fullName } from '../../utils/format'

export default function TutorCard({ tutor, basePath = '/teachers' }) {
  const name = fullName(tutor)
  const subjects = tutor.subjects || []
  return (
    <article className="card card-hover tutor-card">
      <div className="tutor-card-top">
        <Avatar name={name} size="lg" />
        <div className="tutor-card-id">
          <h3>
            <Link to={`${basePath}/${tutor.id}`} className="stretched-link">
              {name}
            </Link>
          </h3>
          {tutor.degree && <p className="tutor-degree">{tutor.degree}</p>}
          <Rating value={tutor.averageRating} count={tutor.reviewCount} />
        </div>
        {tutor.isVerified && (
          <span className="verified-dot" title="Profile validated by Sway3i">
            <Icon name="shield" size={18} />
          </span>
        )}
      </div>

      {subjects.length > 0 && (
        <div className="chip-list">
          {subjects.slice(0, 3).map((subject) => (
            <span key={subject.id} className="chip">
              {subject.name}
            </span>
          ))}
          {subjects.length > 3 && <span className="chip">+{subjects.length - 3}</span>}
        </div>
      )}

      {tutor.biography && <p className="tutor-bio">{tutor.biography}</p>}

      <div className="tutor-card-footer">
        <span className="meta-list">
          {tutor.city && (
            <span>
              <Icon name="mapPin" size={16} /> {tutor.city}
            </span>
          )}
        </span>
        {tutor.hourlyRate !== null && tutor.hourlyRate !== undefined && (
          <span className="price-tag">
            <strong>{formatPrice(tutor.hourlyRate)}</strong> / hour
          </span>
        )}
      </div>
    </article>
  )
}
