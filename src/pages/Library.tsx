import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import CourseLocked from '../components/CourseLocked'
import Header from '../components/Header'
import BackLink from '../components/BackLink'
import Footer from '../components/Footer'
import {
  getCourseBySlug,
  listLibraryAssets,
  fileUrl,
  LIBRARY_CATEGORIES,
  type Course,
  type LibraryAsset,
  type LibraryCategory,
} from '../lib/content'
import { canAccessCourse } from '../lib/enrollments'
import './Home.css'

// The library belongs to a program — this page only ever shows the files for
// the course in the URL, plus anything marked as general (course_id null).
function Library() {
  const { slug = '' } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [assets, setAssets] = useState<LibraryAsset[]>([])
  const [active, setActive] = useState<LibraryCategory | 'all'>('all')
  const [allowed, setAllowed] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const found = await getCourseBySlug(slug)
        setCourse(found)
        if (found) {
          // Fails closed, and separately from the course lookup so a gate error
          // doesn't make a real programme look like it doesn't exist.
          const ok = await canAccessCourse(found.id).catch((err) => {
            console.warn('[library] access check failed, locking:', err)
            return false
          })
          setAllowed(ok)
          setAssets(ok ? await listLibraryAssets(found.id) : [])
        }
      } catch {
        setCourse(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  const available = useMemo(
    () => LIBRARY_CATEGORIES.filter((c) => assets.some((a) => a.category === c.value)),
    [assets],
  )

  const shown = active === 'all' ? assets : assets.filter((a) => a.category === active)

  function assetHref(asset: LibraryAsset): string {
    return asset.external_url ?? fileUrl('library', asset.file_path) ?? '#'
  }

  if (loading) return null

  if (!course) {
    return (
      <div className="tld-home">
        <Header />
        <section className="tld-section">
          <h2>البرنامج غير موجود</h2>
          <p>لم نتمكن من العثور على هذا البرنامج.</p>
        </section>
        <BackLink to="/home" label="العودة إلى الرئيسية" />
        <Footer />
      </div>
    )
  }

  if (!allowed) return <CourseLocked course={course} />

  return (
    <div className="tld-home">
      <AppHeader tag={course.tag} title={course.title} subtitle="ملفات ومراجع البرنامج، جاهزة للتحميل." />
      <BackLink to={`/courses/${course.slug}`} label={`العودة إلى ${course.title}`} />

      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>مكتبة البرنامج</h2>
        </div>

        {available.length > 0 && (
          <div className="tld-library__filters">
            <button
              type="button"
              className={`tld-pill-tag${active === 'all' ? '' : ' tld-pill-tag--outline'} tld-library__filter`}
              onClick={() => setActive('all')}
            >
              الكل
            </button>
            {available.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`tld-pill-tag${active === category.value ? '' : ' tld-pill-tag--outline'} tld-library__filter`}
                onClick={() => setActive(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        <div className="tld-grid tld-grid--3">
          {shown.map((asset) => (
            <div className="tld-card" key={asset.id}>
              <span className="tld-pill-tag tld-pill-tag--outline">
                {LIBRARY_CATEGORIES.find((c) => c.value === asset.category)?.label ?? asset.category}
              </span>
              <h3>{asset.title}</h3>
              {asset.description && <p>{asset.description}</p>}
              <a
                href={assetHref(asset)}
                target="_blank"
                rel="noopener noreferrer"
                className="tld-button tld-button--ghost tld-button--sm"
              >
                عرض الملف
              </a>
            </div>
          ))}
        </div>

        {assets.length === 0 && <p>ما فيه ملفات في مكتبة هذا البرنامج حالياً.</p>}
      </section>

      <Footer />
    </div>
  )
}

export default Library
