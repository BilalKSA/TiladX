import CrossLink from '../components/CrossLink'
import { APP_ORIGIN } from '../lib/origins'
import SiteLayout from '../components/SiteLayout'
import SitePageHead from '../components/SitePageHead'
import BackgroundNoise from '../components/ui/background-snippets-noise-effect11'
import { getBenefits } from '../data/benefits'
import { getGallery } from '../data/gallery'
import { useLocale, useT } from '../i18n'
import './WhyTilad.css'

function WhyTilad() {
  const locale = useLocale()
  const t = useT()
  const benefits = getBenefits(locale)
  const gallery = getGallery(locale)
  const photoFor = (id: string) => gallery.find((item) => item.id === id)

  const headPhoto = photoFor('presenting')

  return (
    <SiteLayout title={t.whyPage.title}>
      <SitePageHead
        eyebrow={t.whyPage.eyebrow}
        title={t.whyPage.title}
        lead={t.whyPage.lead}
        art={headPhoto?.src}
        artAlt={headPhoto?.caption ?? ''}
      />

      {/* ---- the three claims, one row each ---- */}
      {/* Alternating rows, no card chrome — the same rhythm as the landing's
          short version, with the detail paragraph the landing leaves out.
          No grain: the texture is for maroon surfaces, and on a light band it
          reads as dirt rather than as film. */}
      <div className="tld-band tld-why-page__bg">
        <section className="tld-section tld-why-page">
          <div className="tld-why-page__rows">
            {benefits.map((item, index) => {
              const photo = photoFor(item.photo)

              return (
                <article className="tld-why-page__row" key={item.title}>
                  <div className="tld-why-page__text">
                    <span className="tld-why-page__index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2>{item.title}</h2>
                    <p className="tld-why-page__lead">{item.description}</p>
                    <p>{item.detail}</p>
                  </div>

                  {photo?.src && (
                    <figure className="tld-why-page__photo">
                      <img src={photo.src} alt={photo.caption} loading="lazy" />
                    </figure>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      </div>

      {/* ---- what's included ---- */}
      {/* One frame, hairline-separated rows. The old version was five floating
          cards in a two-column grid, which left a gap under the fifth. */}
      <section className="tld-section">
        <div className="tld-section__heading">
          <h2>{t.whyPage.includedHeading}</h2>
        </div>
        <p className="tld-section__lead">{t.whyPage.includedLead}</p>

        <div className="tld-frame tld-why-page__included">
          <ul className="tld-why-page__list">
            {t.whyPage.included.map((item) => (
              <li key={item}>
                <span className="tld-why-page__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- objections ---- */}
      {/* Inverted band: the assumption sits faint on the maroon, the answer in
          full ink beneath it, so the correction is the thing that reads. */}
      <div className="tld-band tld-band--invert tld-why-page__myths-bg">
        <BackgroundNoise baseColor="transparent" animated={false} patternAlpha={18} />

        <section className="tld-section">
          <div className="tld-section__heading">
            <h2>{t.whyPage.mythsHeading}</h2>
          </div>
          <p className="tld-section__lead">{t.whyPage.mythsLead}</p>

          <div className="tld-why-page__myths">
            {t.whyPage.misconceptions.map((item) => (
              <article className="tld-why-page__myth" key={item.myth}>
                <p className="tld-why-page__myth-label">{t.whyPage.mythLabel}</p>
                <p className="tld-why-page__myth-claim">«{item.myth}»</p>

                <p className="tld-why-page__truth-label">{t.whyPage.truthLabel}</p>
                <p className="tld-why-page__truth">{item.truth}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* ---- cta ---- */}
      <section className="tld-section">
        <div className="tld-marketing__cta">
          <h2>{t.whyPage.ctaHeading}</h2>
          <p>{t.whyPage.ctaBody}</p>
          <CrossLink origin={APP_ORIGIN} to="/register" className="tld-button tld-button--lg">
            {t.header.register}
          </CrossLink>
        </div>
      </section>
    </SiteLayout>
  )
}

export default WhyTilad
