import { gallery } from '../data/gallery'
import { useInfiniteMarquee, MARQUEE_COPIES } from './useInfiniteMarquee'
import './Marquee.css'
import './GalleryStrip.css'

function GalleryStrip() {
  const { scrollerRef, groupRef, handlers } = useInfiniteMarquee()

  return (
    <section
      className="tld-marquee tld-gallery"
      ref={scrollerRef}
      role="region"
      aria-label="لقطات من برامج تلاد"
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
            {gallery.map((item) => (
              <figure className="tld-gallery__item" key={`${copy}-${item.id}`}>
                {item.src ? (
                  <img src={item.src} alt={item.caption} loading="lazy" draggable={false} />
                ) : (
                  <div className="tld-gallery__placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="8.5" cy="10" r="1.5" />
                      <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
                    </svg>
                  </div>
                )}
                <figcaption>
                  <span className="tld-gallery__tag">{item.tag}</span>
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default GalleryStrip
