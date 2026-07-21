import { Link } from 'react-router-dom'
import './BackLink.css'

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <div className="tld-back-link">
      <Link to={to} className="tld-button tld-button--ghost tld-button--sm">
        ← {label}
      </Link>
    </div>
  )
}

export default BackLink
