import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import TutorCard from '../../components/teachers/TutorCard'
import { EmptyState, SkeletonCards } from '../../components/ui/Feedback'
import { fromPage, listingsApi, subjectsApi, tutorsApi } from '../../api/services'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { LEVELS } from '../../utils/format'

const features = [
  {
    icon: 'search',
    title: 'Discover the right teacher',
    text: 'Filter by subject, school level, price, city or online lessons and compare teachers side by side.',
  },
  {
    icon: 'calendarCheck',
    title: 'Book on real availability',
    text: 'Teachers publish their weekly time slots. Pick the one that suits you and send a request in a few clicks.',
  },
  {
    icon: 'clipboard',
    title: 'Follow every lesson',
    text: 'Upcoming, completed and cancelled courses are all in one dashboard, for students and teachers alike.',
  },
  {
    icon: 'star',
    title: 'Honest reviews',
    text: 'Only students who completed a course can rate it, so every review comes from a real lesson.',
  },
  {
    icon: 'shield',
    title: 'Validated teachers',
    text: 'Every teacher profile is checked by our team before it appears in the search results.',
  },
  {
    icon: 'user',
    title: 'Profiles that say it all',
    text: 'Diplomas, subjects, hourly rate and teaching areas for teachers; level and preferences for students.',
  },
]

const studentSteps = [
  { title: 'Create your account', text: 'Sign up as a student or parent for free, with email or Google.' },
  { title: 'Find your teacher', text: 'Search by subject, level, budget and location, then compare profiles and reviews.' },
  { title: 'Request a lesson', text: 'Choose one of the teacher’s weekly time slots and send your booking request.' },
  { title: 'Learn and review', text: 'Follow your lessons from your dashboard and rate your teacher once the course is completed.' },
]

const teacherSteps = [
  { icon: 'user', text: 'Create your teacher profile: diplomas, subjects, hourly rate and teaching areas.' },
  { icon: 'shield', text: 'Our team validates your profile so students can trust it.' },
  { icon: 'bookOpen', text: 'Publish your courses and weekly time slots, online or in person.' },
  { icon: 'inbox', text: 'Accept the requests that fit you and follow each student from your dashboard.' },
]

function HeroSearch({ subjects }) {
  const navigate = useNavigate()
  const [subjectId, setSubjectId] = useState('')
  const [level, setLevel] = useState('')
  const [location, setLocation] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (subjectId) params.set('subjectId', subjectId)
    if (level) params.set('level', level)
    if (location.trim()) params.set('location', location.trim())
    navigate(`/teachers${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <form className="hero-search" onSubmit={submit} role="search" aria-label="Find a teacher">
      <label className="hero-search-field">
        <Icon name="bookOpen" size={18} />
        <span className="visually-hidden">Subject</span>
        <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
          <option value="">Any subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>
      <label className="hero-search-field">
        <Icon name="graduation" size={18} />
        <span className="visually-hidden">School level</span>
        <select value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="">Any level</option>
          {Object.entries(LEVELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="hero-search-field">
        <Icon name="mapPin" size={18} />
        <span className="visually-hidden">City or area</span>
        <input placeholder="City or area" value={location} onChange={(event) => setLocation(event.target.value)} />
      </label>
      <button type="submit" className="btn btn-primary btn-lg">
        <Icon name="search" size={18} /> Search
      </button>
    </form>
  )
}

function HeroVisual() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hv-blob" />
      <div className="hv-card hv-calendar">
        <div className="hv-card-title">
          <Icon name="calendar" size={18} /> Weekly availability
        </div>
        <div className="hv-days">
          {days.map((day, index) => (
            <div key={day} className="hv-day">
              <span>{day}</span>
              <i className={index === 1 || index === 3 ? 'on' : ''} />
              <i className={index === 2 ? 'picked' : index === 4 ? 'on' : ''} />
              <i className={index === 0 ? 'on' : ''} />
            </div>
          ))}
        </div>
      </div>
      <div className="hv-card hv-request">
        <span className="icon-bubble accent">
          <Icon name="checkCircle" size={22} />
        </span>
        <div>
          <strong>Booking request sent</strong>
          <span>Wednesday · 18:00 – 19:00</span>
        </div>
      </div>
      <div className="hv-card hv-subjects">
        <span className="chip">Mathematics</span>
        <span className="chip">Physics</span>
        <span className="chip">English</span>
      </div>
      <div className="hv-card hv-rating">
        <span className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon key={star} name="star" size={16} filled strokeWidth={1.2} />
          ))}
        </span>
        <span>Rate after each course</span>
      </div>
      <div className="hv-card hv-teacher">
        <span className="hv-avatar">
          <Icon name="graduation" size={26} />
        </span>
        <div>
          <strong>Validated teacher</strong>
          <span>
            <Icon name="shield" size={14} /> Checked by Sway3i
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  useDocumentTitle()
  const subjects = useAsync(() => subjectsApi.list().then(fromPage), [])
  const tutors = useAsync(() => tutorsApi.list({ size: 6, sort: 'averageRating,desc' }).then(fromPage), [])
  const courses = useAsync(() => listingsApi.search({}), [])

  const subjectItems = subjects.data?.items || []
  const stats = [
    { value: tutors.data?.total, label: ['validated teacher', 'validated teachers'], icon: 'shield' },
    { value: subjects.data?.total, label: ['subject taught', 'subjects taught'], icon: 'layers' },
    { value: courses.data?.length, label: ['course open for booking', 'courses open for booking'], icon: 'bookOpen' },
  ].filter((stat) => stat.value > 0)

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy fade-up">
            <span className="eyebrow">
              <Icon name="sparkles" size={16} /> Private lessons, made simple
            </span>
            <h1>
              Find the right teacher. <span className="hl">Reach your best grades.</span>
            </h1>
            <p className="hero-lead">
              Sway3i connects students and parents with validated private teachers. Compare profiles, check real
              availability and book your lessons, online or near you.
            </p>
            <div className="hero-ctas">
              <Link to="/teachers" className="btn btn-primary btn-lg">
                Find a teacher <Icon name="arrowRight" size={18} />
              </Link>
              <Link to="/register?role=TUTOR" className="btn btn-lg">
                Become a teacher
              </Link>
            </div>
            <HeroSearch subjects={subjectItems} />
          </div>
          <HeroVisual />
        </div>
      </section>

      {stats.length > 0 && (
        <section className="stats-band" aria-label="Sway3i in numbers">
          <div className="container stats-band-grid">
            {stats.map((stat) => (
              <div key={stat.icon} className="stats-band-item">
                <Icon name={stat.icon} size={22} />
                <strong>{stat.value}</strong>
                <span>{stat.label[stat.value === 1 ? 0 : 1]}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="features" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why Sway3i</span>
            <h2>Everything you need for private lessons, in one place</h2>
            <p>From the first search to the last lesson, students, parents and teachers work on the same platform.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span className="icon-bubble">
                  <Icon name={feature.icon} size={22} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section section-tint">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Your first lesson in four steps</h2>
          </div>
          <ol className="steps">
            {studentSteps.map((step, index) => (
              <li key={step.title} className="step">
                <span className="step-number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="for-teachers" className="section">
        <div className="container teacher-band">
          <div>
            <span className="eyebrow">For teachers</span>
            <h2>Teach the students who need you</h2>
            <p className="text-muted">
              Share your expertise, set your own rates and schedule, and let students come to you. Sway3i handles the
              booking requests so you can focus on teaching.
            </p>
            <Link to="/register?role=TUTOR" className="btn btn-accent btn-lg">
              Become a teacher <Icon name="arrowRight" size={18} />
            </Link>
          </div>
          <ul className="teacher-steps">
            {teacherSteps.map((step) => (
              <li key={step.text}>
                <span className="icon-bubble accent">
                  <Icon name={step.icon} size={20} />
                </span>
                <p>{step.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="teachers" className="section section-tint">
        <div className="container">
          <div className="section-head row-between" style={{ textAlign: 'left' }}>
            <div>
              <span className="eyebrow">Our teachers</span>
              <h2>Meet some of our teachers</h2>
            </div>
            {tutors.data?.items.length > 0 && (
              <Link to="/teachers" className="btn">
                View all teachers <Icon name="arrowRight" size={16} />
              </Link>
            )}
          </div>

          {tutors.loading ? (
            <div className="card-grid">
              <SkeletonCards count={3} height={240} />
            </div>
          ) : tutors.data?.items.length ? (
            <div className="card-grid">
              {tutors.data.items.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          ) : (
            <div className="card">
              <EmptyState
                icon="graduation"
                title={tutors.error ? 'Teachers are not available right now' : 'Our first teachers are on their way'}
                action="Become one of our first teachers"
                actionTo="/register?role=TUTOR"
              >
                {tutors.error
                  ? 'We could not load the teachers. Please try again in a moment.'
                  : 'Teacher profiles appear here as soon as our team has validated them.'}
              </EmptyState>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="section">
        <div className="container about-grid">
          <div>
            <span className="eyebrow">About us</span>
            <h2>Learning works better with the right person</h2>
          </div>
          <div className="stack text-muted">
            <p>
              Finding a good private teacher often depends on word of mouth. Sway3i brings the whole journey into one
              place: finding a teacher who matches your subject, level and budget, booking lessons on real availability,
              and following progress lesson after lesson.
            </p>
            <p>
              Teachers get a simple tool to present their experience, publish their courses and manage their schedule,
              while reviews from real students keep the quality high for everyone.
            </p>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div>
              <h2>Ready to start learning?</h2>
              <p>Create a free account and send your first booking request today.</p>
            </div>
            <div className="row">
              <Link to="/register?role=STUDENT" className="btn btn-accent btn-lg">
                Find my teacher
              </Link>
              <Link to="/register?role=TUTOR" className="btn btn-light btn-lg">
                I am a teacher
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
