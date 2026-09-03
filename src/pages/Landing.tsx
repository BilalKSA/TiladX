import CrossLink from '../components/CrossLink'
import { APP_ORIGIN } from '../lib/origins'
import SiteLayout from '../components/SiteLayout'
import ProgramQuiz from '../components/ProgramQuiz'
import GalleryCards from '../components/GalleryCards'
import Mascot from '../components/Mascot'
import MentorStrip from '../components/MentorStrip'
import BoardMembers from '../components/BoardMembers'
import BackgroundNoise from '../components/ui/background-snippets-noise-effect11'
import { getGallery } from '../data/gallery'
import { getBenefits } from '../data/benefits'
import { useLocale, useT } from '../i18n'
import './Landing.css'

function Landing() {
  const locale = useLocale()
  const t = useT()
  const gallery = getGallery(locale)
  const benefits = getBenefits(locale)
  const photoFor = (id: string) => gallery.find((item) => item.id === id)

  return (
    <SiteLayout flush>
      {/* ---- hero ---- */}
      {/* Full-screen band: copy on the start side (right, in RTL), photo deck
          on the end side. Spotlight + grain sit behind both. */}
      <div className="tld-band tld-marketing__hero-bg">
        <BackgroundNoise patternAlpha={18} animated={false} />
        <div className="tld-marketing__hero-inner">
          <section className="tld-marketing__hero">
            <h1>{t.hero.title}</h1>
            <p>{t.hero.subtitle}</p>
            <div className="tld-marketing__hero-actions">
              <CrossLink origin={APP_ORIGIN} to="/register" className="tld-button tld-button--on-primary tld-button--lg">
                {t.hero.ctaStudent}
              </CrossLink>
              <a href="#about" className="tld-button tld-button--lg tld-marketing__hero-alt">
                {t.hero.ctaParent}
              </a>
            </div>
          </section>

          <GalleryCards />
        </div>
      </div>

      {/* ---- why tilad ---- */}
      {/* Flat band the rows sit on — no card chrome, just the surface. */}
      <div className="tld-band tld-why-bg">
        <section className="tld-section tld-why" id="why">
          <Mascot>{t.why.heading}</Mascot>

          <div className="tld-why__rows">
            {benefits.map((item) => {
              const photo = photoFor(item.photo)

              return (
                <article className="tld-why__row" key={item.title}>
                  <div className="tld-why__text">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>

                  {photo?.src && (
                    <figure className="tld-why__photo">
                      <img src={photo.src} alt={photo.caption} loading="lazy" />
                    </figure>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      </div>

      {/* ---- about + board + mentors ---- */}
      {/* One band: what Tilad is, who runs it, then who mentors in it. */}
      <div className="tld-band tld-band--invert tld-marketing__band" id="about">
        <BackgroundNoise baseColor="transparent" animated={false} patternAlpha={18} />

        <section className="tld-section tld-marketing__about">
          <div className="tld-marketing__about-text">
            <div className="tld-section__heading">
              <h2>{t.about.heading}</h2>
            </div>
            {t.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className="tld-marketing__quote">
            <span className="tld-marketing__quote-mark" aria-hidden="true">
              ”
            </span>
            <p>{t.about.quote}</p>
            <span className="tld-marketing__quote-by">{t.about.quoteBy}</span>
          </aside>
        </section>

        <BoardMembers />

        <div id="mentors">
          <section className="tld-section tld-marketing__strip-head">
            <div className="tld-section__heading">
              <h2>{t.mentors.heading}</h2>
            </div>
            <p className="tld-section__lead">{t.mentors.lead}</p>
          </section>
          <MentorStrip />
        </div>
      </div>

      {/* ---- quiz ---- */}
      {/* Full-bleed band backed by the event collage. The quiz itself is a
          self-contained light card, so only the intro copy rides the dark
          band's inverted ink. */}
      <div className="tld-band tld-band--invert tld-quiz-bg">
        <section className="tld-section tld-marketing__quiz-section" id="quiz">
          <div className="tld-marketing__quiz-intro">
            <h2>{t.quiz.heading}</h2>
            <p>{t.quiz.intro}</p>
          </div>
          <ProgramQuiz />
        </section>
      </div>
    </SiteLayout>
  )
}

export default Landing
