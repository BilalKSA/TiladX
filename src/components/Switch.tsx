import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import './Switch.css'

interface SwitchProps {

  value: boolean
  onToggle: () => void
  iconOn: ReactNode
  iconOff: ReactNode

  label: string
  className?: string
}

function Switch({ value, onToggle, iconOn, iconOff, label, className }: SwitchProps) {
  const reduceMotion = useReducedMotion()

  const classes = ['tld-switch', value && 'tld-switch--on', className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      className={classes}
      onClick={onToggle}
    >
      <motion.span
        className="tld-switch__thumb"
        layout
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', duration: 0.6, bounce: 0.2 }
        }
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={value ? 'on' : 'off'}
            className="tld-switch__icon"
            initial={{ opacity: 0, rotate: value ? -60 : 60 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: value ? 60 : -60 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
          >
            {value ? iconOn : iconOff}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  )
}

export default Switch
