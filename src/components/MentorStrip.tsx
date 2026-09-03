import { useEffect, useState } from 'react'
import { listMentors, fileUrl, type Mentor } from '../lib/content'
import { useT } from '../i18n'
import { useInfiniteMarquee, MARQUEE_COPIES } from './useInfiniteMarquee'
import './Marquee.css'
import './MentorStrip.css'

// Slightly slower than the photo strip — names need longer to read than
// images do to register.
const SPEED = 32

function MentorStrip() {
  const t = useT()
  const { scrollerRef, groupRef, handlers } = useInfiniteMarquee(SPEED)
  const [mentors, setMentors] = useState<Mentor[]>([])

  useEffect(() => {
    listMentors()
      .then(setMentors)
      .catch(() => {})
  }, [])

  if (mentors.length === 0) return null

  return (
    <section
      className="tld-marquee tld-mentors"
      ref={scrollerRef}
      role="region"
      aria-label={t.mentors.regionAria}
      {...handlers}
    >
      <div className="tld-marquee__track">
        {MARQUEE_COPIES.map((copy) => (
          <div
            className="tld-marquee__group"
            key={copy}
            ref={copy === 0 ? groupRef : undefined}
            aria-hidden={copy !== 0}
          >
            {mentors.map((mentor) => {
              const photo = fileUrl('media', mentor.photo_path)
              return (
                <article className="tld-mentor" key={`${copy}-${mentor.id}`}>
                  <div className="tld-mentor__avatar">
                    {photo ? (
                      <img src={photo} alt={mentor.name} loading="lazy" draggable={false} />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <circle cx="12" cy="8.5" r="3.75" />
                        <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
                      </svg>
                    )}
                  </div>
                  <h3>{mentor.name}</h3>
                  {mentor.title && <p className="tld-mentor__title">{mentor.title}</p>}
                </article>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

export default MentorStrip
