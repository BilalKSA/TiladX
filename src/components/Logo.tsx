import './Logo.css'

const sources = {
  ink: '/assets/tilad-logo-maroon.png',
  white: '/assets/tilad-logo-white.png',
}

interface LogoProps {
  /** 'auto' swaps to the white logo in dark mode; 'ink'/'white' force one regardless of theme. */
  variant?: 'ink' | 'white' | 'auto'
  className?: string
}

function Logo({ variant = 'auto', className }: LogoProps) {
  const classes = ['tld-logo', className].filter(Boolean).join(' ')

  if (variant !== 'auto') {
    return <img className={classes} src={sources[variant]} alt="تلاد · tilad" />
  }

  return (
    <span className="tld-logo-swap">
      <img className={`${classes} tld-logo-swap__light`} src={sources.ink} alt="تلاد · tilad" />
      <img className={`${classes} tld-logo-swap__dark`} src={sources.white} alt="تلاد · tilad" />
    </span>
  )
}

export default Logo
