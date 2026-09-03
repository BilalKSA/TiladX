import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { getGallery } from '../data/gallery'
import { useLocale } from '../i18n'
import './GalleryCards.css'

const SWAP_MS = 3800
/** Cards deep enough to read as a deck; the rest wait offstage. */
const VISIBLE = 3

/** Auto-swapping photo deck. The front card cycles on a timer, the two behind
 *  it sit back and slightly smaller to give the stack depth.
 *
 *  Interactive: click any visible card to bring it forward, and drag along the
 *  bar underneath to scrub through the photos by hand. Rotation pauses while a
 *  pointer or keyboard focus is inside so it can't yank a card away mid-read. */
function GalleryCards() {
  const gallery = getGallery(useLocale())
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const barRef = useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()
  const count = gallery.length

  /** Nearest dot to the pointer, measured off real DOM positions rather than a
   *  left-to-right ratio — that keeps it correct under dir="rtl", where the
   *  first photo sits at the right-hand end of the bar. */
  const indexFromPointer = (clientX: number) => {
    const bar = barRef.current
    if (!bar) return null

    let nearest = 0
    let shortest = Infinity

    Array.from(bar.children).forEach((child, index) => {
      const box = (child as HTMLElement).getBoundingClientRect()
      const distance = Math.abs(clientX - (box.left + box.width / 2))
      if (distance < shortest) {
        shortest = distance
        nearest = index
      }
    })

    return nearest
  }

  const scrubTo = (clientX: number) => {
    const index = indexFromPointer(clientX)
    if (index !== null) setActive(index)
  }

  const startScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Capture so a drag that wanders off the bar keeps feeding us moves.
    event.currentTarget.setPointerCapture(event.pointerId)
    setScrubbing(true)
    scrubTo(event.clientX)
  }

  const endScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setScrubbing(false)
  }

  useEffect(() => {
    // An unstoppable auto-rotating carousel is the thing this setting exists to
    // prevent — hold on the current card instead.
    if (reduceMotion || held || scrubbing || count < 2) return

    const id = window.setInterval(() => setActive((i) => (i + 1) % count), SWAP_MS)
    return () => window.clearInterval(id)
  }, [count, reduceMotion, held, scrubbing])

  if (count === 0) return null

  return (
    <div
      className="tld-gallery-cards"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="tld-gallery-cards__deck">
        {gallery.map((item, index) => {
          const offset = (index - active + count) % count
          const stacked = offset < VISIBLE

          return (
            <motion.figure
              className="tld-gallery-cards__card"
              key={item.id}
              style={{ zIndex: count - offset, pointerEvents: stacked ? 'auto' : 'none' }}
              animate={{
                y: offset * -20,
                scale: 1 - offset * 0.06,
                opacity: stacked ? 1 - offset * 0.28 : 0,
              }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 210, damping: 28 }}
              aria-hidden={offset !== 0}
              // The front card steps forward; a back card jumps to itself.
              onClick={() => setActive(offset === 0 ? (active + 1) % count : index)}
            >
              {item.src ? (
                <img src={item.src} alt={item.caption} draggable={false} />
              ) : (
                <div className="tld-gallery-cards__placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10" r="1.5" />
                    <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
                  </svg>
                </div>
              )}

              <figcaption className="tld-gallery-cards__caption">
                <span className="tld-gallery-cards__tag">{item.tag}</span>
                {item.caption}
              </figcaption>
            </motion.figure>
          )
        })}
      </div>

      {/* Drag anywhere along this to scrub the deck. The dots stay real buttons
          so it's still operable by keyboard and screen reader. */}
      <div
        className={`tld-gallery-cards__dots${scrubbing ? ' tld-gallery-cards__dots--scrubbing' : ''}`}
        ref={barRef}
        onPointerDown={startScrub}
        onPointerMove={(event) => scrubbing && scrubTo(event.clientX)}
        onPointerUp={endScrub}
        onPointerCancel={endScrub}
      >
        {gallery.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className="tld-gallery-cards__dot"
            aria-label={item.caption}
            aria-current={index === active}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default GalleryCards
