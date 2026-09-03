import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useReducedMotion } from 'motion/react'
import { listPublishedCourses, listLessons, fileUrl, type Course, type Lesson } from '../lib/content'
import './ProgramTabs.css'

/** Course titles are stored with "دورة" in them; the tabs read tighter
 *  without it. Display-only — the stored title is never modified. */
const tabLabel = (title: string) =>
  title
    .replace(/(^|\s)دورة(\s|$)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

/** Programs browser: one tab per course, with that course's lessons and
 *  artwork in the panel below. Everything comes from Postgres, so it stays in
 *  step with the admin console. */
function ProgramTabs() {
  const [courses, setCourses] = useState<Course[]>([])
  const [active, setActive] = useState(0)
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({})
  const [held, setHeld] = useState(false)
  // Auto-rotation stops for good once someone picks a tab themselves —
  // continuing to swap panels under a reader is hostile, not helpful.
  const [taken, setTaken] = useState(false)
  const reduceMotion = useReducedMotion()
  // Ids already requested. A ref rather than deriving from `lessons`, so the
  // fetch effect doesn't re-run every time a result lands.
  const requested = useRef<Set<string>>(new Set())
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    listPublishedCourses()
      .then(setCourses)
      .catch(() => {})
  }, [])

  const current = courses[active]

  useEffect(() => {
    if (reduceMotion || held || taken || courses.length < 2) return

    const id = window.setInterval(() => setActive((i) => (i + 1) % courses.length), 4500)
    return () => window.clearInterval(id)
  }, [reduceMotion, held, taken, courses.length])

  const pick = (index: number) => {
    setActive(index)
    setTaken(true)
  }

  useEffect(() => {
    if (!current || requested.current.has(current.id)) return

    requested.current.add(current.id)
    listLessons(current.id)
      .then((rows) => setLessons((prev) => ({ ...prev, [current.id]: rows })))
      .catch(() => {})
  }, [current])

  /** Arrow keys move between tabs. Under dir="rtl" the visual order is
   *  mirrored, so ArrowRight steps *back* through the list. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowLeft' ? 1 : event.key === 'ArrowRight' ? -1 : 0
    if (step === 0) return

    event.preventDefault()
    const next = (active + step + courses.length) % courses.length
    pick(next)
    tabRefs.current[next]?.focus()
  }

  // Nothing published yet, or the fetch failed — drop the section rather than
  // leave a heading over an empty frame.
  if (courses.length === 0 || !current) return null

  const rows = lessons[current.id] ?? []
  const thumbnail = fileUrl('media', current.thumbnail_path)

  return (
    <section
      className="tld-section tld-ptabs"
      id="programs"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="tld-section__heading">
        <h2>برامجنا</h2>
      </div>
      <div className="tld-ptabs__tabs" role="tablist" aria-label="البرامج" onKeyDown={onKeyDown}>
        {courses.map((course, index) => {
          const selected = index === active

          return (
            <button
              type="button"
              key={course.id}
              role="tab"
              id={`ptab-${course.id}`}
              aria-selected={selected}
              aria-controls={`ppanel-${course.id}`}
              // Roving tabindex: one stop for the whole group, then arrows.
              tabIndex={selected ? 0 : -1}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              className={`tld-ptabs__tab${selected ? ' tld-ptabs__tab--active' : ''}`}
              onClick={() => pick(index)}
            >
              {tabLabel(course.title)}
            </button>
          )
        })}
      </div>

      <div
        className="tld-ptabs__panel"
        role="tabpanel"
        id={`ppanel-${current.id}`}
        aria-labelledby={`ptab-${current.id}`}
      >
        <div className="tld-ptabs__subjects">
          <h3>المواضيع المغطاة</h3>

          {rows.length > 0 ? (
            <ul>
              {rows.map((lesson) => (
                <li key={lesson.id}>{lesson.title}</li>
              ))}
            </ul>
          ) : (
            // Lessons not loaded yet, or none published — the course blurb is
            // a better placeholder than an empty list.
            <p>{current.description}</p>
          )}
        </div>

        <div className="tld-ptabs__media">
          {thumbnail ? (
            <img src={thumbnail} alt="" loading="lazy" />
          ) : (
            <span className="tld-ptabs__tag">{current.tag}</span>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProgramTabs
