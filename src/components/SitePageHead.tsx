import type { ReactNode } from 'react'
import BackgroundNoise from './ui/background-snippets-noise-effect11'

interface SitePageHeadProps {
  /** Small label above the title — where in the site the reader is. */
  eyebrow: string
  title: string
  lead?: string
  /** Optional photograph on the end side, which turns the head into the same
   *  two-column split the landing hero uses. Omit on the legal pages: a single
   *  centred column of type is the right shape there. */
  art?: string
  artAlt?: string
  /** Page-specific extras under the lead — a filter bar, a count, actions. */
  children?: ReactNode
}

/** Opening band of an inner site page — the thing that makes /about, /why,
 *  /mentors, /terms and /privacy read as one set.
 *
 *  Near-black maroon with grain, the same surface as the landing hero and the
 *  404, so an inner page announces itself in the brand before any content. It
 *  is built entirely from tokens, so it needs no dark-mode CSS of its own. */
function SitePageHead({ eyebrow, title, lead, art, artAlt = '', children }: SitePageHeadProps) {
  return (
    <div className={`tld-band tld-site-head${art ? ' tld-site-head--split' : ''}`}>
      <BackgroundNoise baseColor="transparent" animated={false} patternAlpha={18} />

      <div className="tld-site-head__inner">
        <div className="tld-site-head__copy">
          <p className="tld-site-head__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {lead && <p className="tld-site-head__lead">{lead}</p>}
          {children}
        </div>

        {art && (
          <figure className="tld-site-head__art">
            <img src={art} alt={artAlt} loading="eager" />
          </figure>
        )}
      </div>
    </div>
  )
}

export default SitePageHead
