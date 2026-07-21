import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'lg' | 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const classes = ['tld-button', `tld-button--${variant}`, `tld-button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return <button className={classes} {...props} />
}

export default Button
