import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import CrossLink from '../components/CrossLink'
import { APP_ORIGIN } from '../lib/origins'
import SiteLayout from '../components/SiteLayout'
import SitePageHead from '../components/SitePageHead'
import Spinner from '../components/Spinner'
import { listMentors, fileUrl, type Mentor } from '../lib/content'
import { getGallery } from '../data/gallery'
import { useLocale, useT } from '../i18n'
import './Mentors.css'

/** Full mentor profiles — the strip on the landing page shows name and title
 *  only, this is where the bio lives.
 *
 *  Reads the same `mentors` table the admin panel writes to, so a mentor added
 *  there shows up here without a deploy. The filter chips are derived from the
 *  distinct `track` values present: no track on any row means no filter bar,
 *  which is what an existing database looks like before the column is filled. */
function Mentors() {
  const locale = useLocale()
  const t = useT()
  const gallery = getGallery(locale)
  const headPhoto = gallery.find((item) => item.id === 'alumni')

  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  /** null = "all". Anything else is an exact track string. */
  const [track, setTrack] = useState<string | null>(null)
  // Portraits that 404'd, by mentor id — each card falls back to the dotted
  // placeholder on its own.
  const [missing, setMissing] = useState<string[]>([])
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    listMentors()
      .then(setMentors)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])

  const tracks = useMemo(
    () => [...new Set(mentors.map((m) => m.track).filter((value): value is string => !!value))],
    [mentors],
  )

  const shown = track === null ? mentors : mentors.filter((m) => m.track === track)

  /** The chip list, "all" first, as the keyboard walks it. */
  const chips: (string | null)[] = [null, ...tracks]
  /** One track is not a choice — the bar only earns its space from two up. */
  const hasFilters = tracks.length > 1
  const chipId = (value: string | null) => `mentor-track-${value ?? '__all'}`

  /** Arrow keys move between chips. Under dir="rtl" the visual order is
   *  mirrored, so ArrowRight steps *back* through the list. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rtl = locale === 'ar'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
    const step = event.key === forward ? 1 : event.key === backward ? -1 : 0
    if (step === 0) return

    event.preventDefault()
    const current = chips.indexOf(track)
    const next = (current + step + chips.length) % chips.length
    setTrack(chips[next])
    chipRefs.current[next]?.focus()
  }

  return (
    <SiteLayout title={t.mentorsPage.title}>
      <SitePageHead
        eyebrow={t.mentorsPage.eyebrow}
        title={t.mentorsPage.title}
        lead={t.mentorsPage.lead}
        art={headPhoto?.src}
        artAlt={headPhoto?.caption ?? ''}
      >
        {!loading && !failed && mentors.length > 0 && (
          <p className="tld-mentors-page__count">{t.mentorsPage.count(mentors.length)}</p>
        )}
      </SitePageHead>

      <section className="tld-section tld-mentors-page">
        {/* Only worth showing once there is more than one track to choose. */}
        {hasFilters && (
          <div
            className="tld-mentors-page__filters"
            role="tablist"
            aria-label={t.mentorsPage.filterAria}
            onKeyDown={onKeyDown}
          >
            {chips.map((value, index) => {
              const selected = value === track

              return (
                <button
                  type="button"
                  key={value ?? '__all'}
                  role="tab"
                  id={chipId(value)}
                  aria-controls="mentors-panel"
                  aria-selected={selected}
                  // Roving tabindex: one tab stop for the whole group, then
                  // arrows — the same pattern as ProgramTabs.
                  tabIndex={selected ? 0 : -1}
                  ref={(node) => {
                    chipRefs.current[index] = node
                  }}
                  className={`tld-mentors-page__chip${selected ? ' tld-mentors-page__chip--active' : ''}`}
                  onClick={() => setTrack(value)}
                >
                  {value ?? t.mentorsPage.filterAll}
                </button>
              )
            })}
          </div>
        )}

        {loading && (
          <p className="tld-mentors-page__state">
            <Spinner size={18} />
            <span>{t.mentorsPage.loading}</span>
          </p>
        )}

        {!loading && failed && <p className="tld-mentors-page__state">{t.mentorsPage.failed}</p>}

        {!loading && !failed && mentors.length === 0 && (
          <p className="tld-mentors-page__state">{t.mentorsPage.empty}</p>
        )}

        {!loading && !failed && mentors.length > 0 && shown.length === 0 && (
          <p className="tld-mentors-page__state">{t.mentorsPage.emptyTrack}</p>
        )}

        {/* The grid is the tablist's panel — but only when there is a tablist.
            With no filter bar the roles would be orphaned, so they come off. */}
        <div
          className="tld-mentors-page__grid"
          id="mentors-panel"
          role={hasFilters ? 'tabpanel' : undefined}
          aria-labelledby={hasFilters ? chipId(track) : undefined}
        >
          {shown.map((mentor) => {
            const photo = missing.includes(mentor.id) ? null : fileUrl('media', mentor.photo_path)

            return (
              <article className="tld-mentor-profile" key={mentor.id}>
                <div className="tld-mentor-profile__portrait">
                  {photo ? (
                    <img
                      src={photo}
                      alt={mentor.name}
                      loading="lazy"
                      draggable={false}
                      onError={() => setMissing((ids) => [...ids, mentor.id])}
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <circle cx="12" cy="8.5" r="3.75" />
                      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
                    </svg>
                  )}

                  {mentor.track && <span className="tld-mentor-profile__track">{mentor.track}</span>}
                </div>

                <div className="tld-mentor-profile__body">
                  <h2>{mentor.name}</h2>
                  {mentor.title && <p className="tld-mentor-profile__title">{mentor.title}</p>}
                  {mentor.bio && <p className="tld-mentor-profile__bio">{mentor.bio}</p>}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="tld-section">
        <div className="tld-marketing__cta">
          <h2>{t.mentorsPage.ctaHeading}</h2>
          <p>{t.mentorsPage.ctaBody}</p>
          <CrossLink origin={APP_ORIGIN} to="/register" className="tld-button tld-button--lg">
            {t.header.register}
          </CrossLink>
        </div>
      </section>
    </SiteLayout>
  )
}

export default Mentors
