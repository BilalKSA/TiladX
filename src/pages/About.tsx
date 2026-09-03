import CrossLink from '../components/CrossLink'
import { APP_ORIGIN } from '../lib/origins'
import SiteLayout from '../components/SiteLayout'
import SitePageHead from '../components/SitePageHead'
import BoardMembers from '../components/BoardMembers'
import BackgroundNoise from '../components/ui/background-snippets-noise-effect11'
import { getGallery } from '../data/gallery'
import { getImpact, IMPACT_READY } from '../data/impact'
import { useLocale, useT } from '../i18n'
import './About.css'

function About() {
  const locale = useLocale()
  const t = useT()
  const gallery = getGallery(locale)
  const photoFor = (id: string) => gallery.find((item) => item.id === id)

  const headPhoto = photoFor('isef-talk')
  const storyPhoto = photoFor('audience')

  // Placeholder figures until real ones land, so they are shown while the page
  // is being designed but never on tilad.org. See src/data/impact.ts.
  const stats = IMPACT_READY || import.meta.env.DEV ? getImpact(locale) : []

  return (
    <SiteLayout title={t.aboutPage.title}>
      <SitePageHead
        eyebrow={t.aboutPage.eyebrow}
        title={t.aboutPage.title}
        lead={t.aboutPage.lead}
        art={headPhoto?.src}
        artAlt={headPhoto?.caption ?? ''}
      />

      {/* ---- impact strip ---- */}
      {/* Straddles the seam under the head: a light frame lifted half over the
          dark band, so the page opens on proof rather than on more prose. */}
      {stats.length > 0 && (
        <div className="tld-band tld-about__impact-band">
          <section className="tld-section tld-about__impact-section">
            <div className="tld-frame tld-about__impact">
              <h2 className="tld-about__impact-heading">{t.aboutPage.impactHeading}</h2>

              <dl className="tld-about__stats">
                {stats.map((stat) => (
                  <div className="tld-about__stat" key={stat.label}>
                    <dt>
                      <span className="tld-about__stat-value">{stat.value}</span>
                      <span className="tld-about__stat-label">{stat.label}</span>
                    </dt>
                    <dd>{stat.note}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      )}

      {/* ---- the story ---- */}
      {/* Narrative on the start side; on the end side the photo carries the
          pull quote overlapping its lower corner. */}
      <section className="tld-section tld-about__story">
        <div className="tld-about__story-text">
          <p className="tld-about__eyebrow">{t.aboutPage.storyEyebrow}</p>
          <h2 className="tld-display tld-about__story-title">{t.aboutPage.storyHeading}</h2>

          <div className="tld-prose">
            {t.aboutPage.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="tld-about__story-side">
          {storyPhoto?.src && (
            <figure className="tld-about__story-photo">
              <img src={storyPhoto.src} alt={storyPhoto.caption} loading="lazy" />
            </figure>
          )}

          <aside className="tld-about__quote">
            <span className="tld-about__quote-mark" aria-hidden="true">
              ”
            </span>
            <p>{t.about.quote}</p>
            <span className="tld-about__quote-by">{t.about.quoteBy}</span>
          </aside>
        </div>
      </section>

      {/* ---- mission ---- */}
      {/* One sentence, set at display size on the grain hero surface. The
          heaviest single moment on the page, and the only place the mission is
          stated. */}
      <div className="tld-band tld-band--hero tld-about__mission-band">
        <BackgroundNoise baseColor="transparent" animated={false} patternAlpha={18} />

        <section className="tld-section tld-about__mission">
          <p className="tld-about__eyebrow tld-about__eyebrow--invert">{t.aboutPage.missionEyebrow}</p>
          <p className="tld-display tld-about__mission-line">{t.aboutPage.mission}</p>
          <p className="tld-about__mission-note">{t.aboutPage.missionNote}</p>
        </section>
      </div>

      {/* ---- values ---- */}
      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>{t.aboutPage.valuesHeading}</h2>
        </div>

        <div className="tld-about__values">
          {t.aboutPage.values.map((value, index) => (
            <article className="tld-about__value" key={value.title}>
              <span className="tld-about__value-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---- board ---- */}
      <div className="tld-band tld-band--invert tld-about__board-bg">
        <BackgroundNoise baseColor="transparent" animated={false} patternAlpha={18} />
        <BoardMembers />
      </div>

      {/* ---- cta ---- */}
      <section className="tld-section">
        <div className="tld-marketing__cta">
          <h2>{t.aboutPage.ctaHeading}</h2>
          <p>{t.aboutPage.ctaBody}</p>
          <CrossLink origin={APP_ORIGIN} to="/register" className="tld-button tld-button--lg">
            {t.header.register}
          </CrossLink>
        </div>
      </section>
    </SiteLayout>
  )
}

export default About
