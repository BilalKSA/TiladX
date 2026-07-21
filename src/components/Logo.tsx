import './Logo.css'

function Logo({ variant = 'ink' }: { variant?: 'ink' | 'white' }) {
  return (
    <div className={`tld-logo tld-logo--${variant}`}>
      <span className="tld-logo__ar">تلاد</span>
      <span className="tld-logo__en">tilad</span>
    </div>
  )
}

export default Logo
