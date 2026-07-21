import type { ButtonHTMLAttributes } from 'react'
import Spinner from './Spinner'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'lg' | 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const spinnerSize: Record<Size, number> = { lg: 18, md: 16, sm: 14 }

function Button({ variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props }: ButtonProps) {
  const classes = [
    'tld-button',
    `tld-button--${variant}`,
    `tld-button--${size}`,
    loading && 'tld-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <Spinner size={spinnerSize[size]} />}
      {children}
    </button>
  )
}

export default Button
