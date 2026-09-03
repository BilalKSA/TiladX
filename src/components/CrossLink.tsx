import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { isCurrentOrigin } from '../lib/origins'

interface CrossLinkProps {
  /** SITE_ORIGIN or APP_ORIGIN — which half of the product `to` lives on. */
  origin: string
  /** Path, including any hash. */
  to: string
  className?: string
  'aria-label'?: string
  children: ReactNode
}

/** A link that may or may not cross an origin boundary.
 *
 *  Same origin → a router Link, so navigation stays client-side. Different
 *  origin → a real anchor, because React Router would otherwise handle the
 *  click itself and the hosting redirect would never fire. */
function CrossLink({ origin, to, children, ...rest }: CrossLinkProps) {
  if (isCurrentOrigin(origin)) return <Link to={to} {...rest}>{children}</Link>

  return <a href={`${origin}${to}`} {...rest}>{children}</a>
}

export default CrossLink
