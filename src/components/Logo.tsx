import './Logo.css'

const sources = {
  ink: '/assets/tilad-logo-maroon.png',
  white: '/assets/tilad-logo-white.png',
}

function Logo({ variant = 'ink', className }: { variant?: 'ink' | 'white'; className?: string }) {
  const classes = ['tld-logo', className].filter(Boolean).join(' ')
  return <img className={classes} src={sources[variant]} alt="تلاد · tilad" />
}

export default Logo
