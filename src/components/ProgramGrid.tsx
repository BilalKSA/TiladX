import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCourses, fileUrl, type Course } from '../lib/content'
import './ProgramGrid.css'

/** Public programs band on the landing page.
 *
 *  Cards are deliberately informational rather than links: `/courses/:slug`
 *  sits behind RequireAuth, which bounces anonymous visitors to /login without
 *  keeping the destination — so every card click would strand a first-time
 *  visitor. One CTA to /register carries the whole section instead. */
function ProgramGrid() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => {})
  }, [])

  // Nothing published yet, or the fetch failed — drop the band entirely rather
  // than leave a heading over an empty grid.
  if (courses.length === 0) return null

  return (
    <section className="tld-section tld-programs" id="programs">
      <div className="tld-section__heading">
        <h2>البرامج</h2>
      </div>
      <p className="tld-section__lead">
        كل برنامج مسار كامل من أول فكرة لين آخر عرض، مبني على تجارب طلاب خاضوا المنافسة قبلك.
      </p>

      <div className="tld-grid tld-grid--3 tld-programs__grid">
        {courses.map((course) => {
          const thumbnail = fileUrl('media', course.thumbnail_path)

          return (
            <article className="tld-card tld-programs__card" key={course.id}>
              {thumbnail && <img className="tld-programs__thumb" src={thumbnail} alt="" loading="lazy" />}
              <span className="tld-pill-tag tld-pill-tag--outline">{course.tag}</span>
              <h3>{course.title}</h3>
              {course.description && <p>{course.description}</p>}
            </article>
          )
        })}
      </div>

      <div className="tld-programs__cta">
        <Link to="/register" className="tld-button tld-button--primary tld-button--lg">
          أصنع معنا
        </Link>
      </div>
    </section>
  )
}

export default ProgramGrid
