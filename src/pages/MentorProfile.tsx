import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import SitePageHead from '../components/SitePageHead'
import BackLink from '../components/BackLink'
import Spinner from '../components/Spinner'
import Button from '../components/Button'
import { getMentorById, fileUrl, type Mentor } from '../lib/content'
import { useT } from '../i18n'
import './MentorProfile.css'

/** One mentor's public profile — /profiles/:id. Reachable with no sign-in,
 *  same as the /profiles directory it's linked from (see Mentors.tsx). */
function MentorProfile() {
  const { id = '' } = useParams()
  const t = useT()

  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setLoading(true)
    setFailed(false)
    getMentorById(id)
      .then(setMentor)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <SiteLayout title={t.mentorProfilePage.loading}>
        <section className="tld-section">
          <p className="tld-mentors-page__state">
            <Spinner size={18} />
            <span>{t.mentorProfilePage.loading}</span>
          </p>
        </section>
      </SiteLayout>
    )
  }

  if (failed || !mentor) {
    return (
      <SiteLayout title={t.mentorProfilePage.notFoundTitle}>
        <section className="tld-section">
          <h1>{t.mentorProfilePage.notFoundTitle}</h1>
          <p>{t.mentorProfilePage.notFoundBody}</p>
        </section>
        <BackLink to="/profiles" label={t.mentorProfilePage.backLink} />
      </SiteLayout>
    )
  }

  const photo = fileUrl('media', mentor.photo_path)

  return (
    <SiteLayout title={mentor.name}>
      <SitePageHead
        eyebrow={mentor.track || t.mentorProfilePage.eyebrow}
        title={mentor.name}
        lead={mentor.title ?? undefined}
        art={photo ?? undefined}
        artAlt={mentor.name}
      />

      <BackLink to="/profiles" label={t.mentorProfilePage.backLink} />

      <section className="tld-section tld-mentor-page">
        {mentor.bio && <p className="tld-mentor-page__bio">{mentor.bio}</p>}

        <div className="tld-mentor-page__actions">
          <Button type="button" variant="primary" size="md" disabled>
            {t.mentorProfilePage.messageButton}
          </Button>
          <span className="tld-mentor-page__soon">{t.mentorProfilePage.messageComingSoon}</span>
        </div>
      </section>
    </SiteLayout>
  )
}

export default MentorProfile
