import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

// Drives a horizontally scrollable strip that also auto-advances and loops
// forever in both directions. Shared by GalleryStrip and MentorStrip.
//
// The markup must render three identical copies of the content, with `groupRef`
// on the first one. The scroller is parked on the middle copy so there's a full
// copy of runway either way; wrap() then keeps scrollLeft inside that copy by
// jumping exactly one copy-width whenever it drifts out. Because the copies are
// identical, that jump is invisible — which is what makes the loop seamless
// whether it's the animation or the user doing the scrolling.

const DEFAULT_SPEED = 45 // px per second

export function useInfiniteMarquee(speed: number = DEFAULT_SPEED) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const dragRef = useRef<{ startX: number; startScroll: number } | null>(null)

  const wrap = useCallback(() => {
    const scroller = scrollerRef.current
    const group = groupRef.current
    if (!scroller || !group) return

    const width = group.offsetWidth
    if (width === 0) return

    if (scroller.scrollLeft < width * 0.5) {
      scroller.scrollLeft += width
    } else if (scroller.scrollLeft >= width * 1.5) {
      scroller.scrollLeft -= width
    }
  }, [])

  // Park on the middle copy once layout has settled.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const scroller = scrollerRef.current
      const group = groupRef.current
      if (scroller && group) scroller.scrollLeft = group.offsetWidth
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  // Idle auto-scroll. Paused while hovered, focused, or dragged, and disabled
  // outright for reduced-motion users — who can still scroll it themselves.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now

      const scroller = scrollerRef.current
      if (scroller && !pausedRef.current && !dragRef.current) {
        scroller.scrollLeft += speed * delta
        wrap()
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [wrap, speed])

  // Mouse drag-to-scroll. Touch is left to native overflow scrolling, which
  // already has momentum and would fight a synthetic implementation.
  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const scroller = scrollerRef.current
    if (!scroller) return

    dragRef.current = { startX: event.clientX, startScroll: scroller.scrollLeft }
    scroller.setPointerCapture(event.pointerId)
    scroller.classList.add('is-dragging')
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const scroller = scrollerRef.current
    if (!drag || !scroller) return

    scroller.scrollLeft = drag.startScroll - (event.clientX - drag.startX)
    wrap()
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current
    if (!dragRef.current || !scroller) return

    dragRef.current = null
    if (scroller.hasPointerCapture(event.pointerId)) scroller.releasePointerCapture(event.pointerId)
    scroller.classList.remove('is-dragging')
  }

  const handlers = {
    // Focusable so it can be scrolled with the arrow keys, not just the mouse.
    tabIndex: 0,
    onScroll: wrap,
    onMouseEnter: () => (pausedRef.current = true),
    onMouseLeave: () => (pausedRef.current = false),
    onFocus: () => (pausedRef.current = true),
    onBlur: () => (pausedRef.current = false),
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  }

  return { scrollerRef, groupRef, handlers }
}

/** Three identical copies — index 0 is the one that gets `groupRef`. */
export const MARQUEE_COPIES = [0, 1, 2]
