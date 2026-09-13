import type { CSSProperties } from 'react'
import './Skeleton.css'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
  /** Use on a maroon/invert surface (e.g. inside AppHeader's panel). */
  invert?: boolean
}

/** A shimmering placeholder block. Give it real layout with className/style —
 *  reuse the actual component's class (e.g. `.tld-program-card__media`) where
 *  possible, so the skeleton keeps that element's real size and radius. */
function Skeleton({ className, style, invert = false }: SkeletonProps) {
  const classes = ['tld-skeleton', invert && 'tld-skeleton--invert', className].filter(Boolean).join(' ')
  return <span className={classes} style={style} aria-hidden="true" />
}

export default Skeleton
