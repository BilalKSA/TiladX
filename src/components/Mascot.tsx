import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import './Mascot.css'

interface MascotProps {
  children: ReactNode
}

/** The mascot read as a cursor: as the section scrolls in, it drags across the
 *  title selecting it, and stops at the far edge. The sweep is the whole
 *  animation — there is no lift afterwards.
 *
 *  It owns the heading because the sweep has to be measured against the real
 *  rendered title width — a fixed offset would over- or under-shoot as the
 *  text, font size or viewport changed. */
function Mascot({ children }: MascotProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const spanRef = useRef(0)
  const reduceMotion = useReducedMotion()

  // Measured against the title itself, not the section wrapper — the wrapper
  // starts well above the text (it reserves room for the parked cursor), so
  // keying to it fired the sweep the moment the section appeared.
  //
  // Progress 0 lands as the title reaches mid-viewport and 1 as it nears the
  // top, so the whole sweep happens under the reader's eye.
  // Phones don't pin (see Mascot.css), which changes what the scroll range has
  // to be measured against.
  const [pinned, setPinned] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 761px)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(min-width: 761px)')
    const sync = () => setPinned(query.matches)
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // Pinned: the track is a tall spacer and progress runs 0 -> 1 over exactly
  // the span where the stage is stuck, so the page looks frozen while the
  // sweep plays. Native scrolling drives it — no wheel hijacking.
  //
  // Unpinned: the track collapses to its content, which is SHORTER than the
  // viewport. 'end end' is then reached *before* 'start start', so the same
  // offsets run the sweep backwards. This range enters and exits forwards at
  // any height.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: pinned ? ['start start', 'end end'] : ['start 0.85', 'end 0.4'],
  })

  const x = useMotionValue(0)

  /** Horizontal position depends on BOTH scroll progress and the measured
   *  title width, which is why this can't be a plain useTransform: that only
   *  recalculates when the scroll value changes. On a fresh load nothing has
   *  scrolled, so it would run once against a width of 0 and strand the cursor
   *  in the middle of the title instead of at the leading edge. */
  const placeCursor = useCallback(() => {
    const span = spanRef.current
    // Reduced motion shows the finished state rather than the starting one.
    const p = reduceMotion ? 1 : scrollYProgress.get()

    x.set(span / 2 - p * span)
  }, [reduceMotion, scrollYProgress, x])

  useMotionValueEvent(scrollYProgress, 'change', placeCursor)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return

    // Fires once on observe, which is what seeds the correct start position
    // before any scrolling happens.
    const observer = new ResizeObserver(([entry]) => {
      spanRef.current = entry.contentRect.width
      placeCursor()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [placeCursor])

  const highlight = useTransform(scrollYProgress, [0.04, 1], [0, 1])

  return (
    // Reduced motion collapses the track: a long pinned stretch with nothing
    // moving is just dead scroll.
    <div className={`tld-mascot${reduceMotion ? ' tld-mascot--static' : ''}`} ref={trackRef}>
      <div className="tld-mascot__pin">
        <div className="tld-mascot__stage">
          <h2 className="tld-mascot__title" ref={titleRef}>
            <motion.span
              className="tld-mascot__highlight"
              style={{ scaleX: reduceMotion ? 1 : highlight }}
              aria-hidden="true"
            />
            <span className="tld-mascot__label">{children}</span>
          </h2>

          <motion.img
            className="tld-mascot__cursor"
            src="/assets/mascot.png"
            alt=""
            aria-hidden="true"
            // Rotation goes through motion rather than the CSS `rotate`
            // property: that property composes *before* `transform`, which
            // would tilt the sweep's axis and send it diagonally.
            style={{ x, y: '18%', rotate: -135 }}
          />
        </div>
      </div>
    </div>
  )
}

export default Mascot
