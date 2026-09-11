import React from 'react'
import { motion, HTMLMotionProps } from 'motion/react'
import { cn } from '../../lib/utils'

interface KokonutButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  className?: string
}

/**
 * Kokonut UI — Action Button
 * Features subtle spring micro-interaction, shimmer border sheen, and crisp typography.
 */
export function KokonutButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  ...props
}: KokonutButtonProps) {
  const variantStyles = {
    primary:
      'bg-[var(--color-accent-blue)] text-white hover:bg-blue-600 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    secondary:
      'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)] border border-[var(--color-border)]',
    danger:
      'bg-[var(--color-accent-red)] text-white hover:bg-red-600 border border-red-400/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    ghost:
      'bg-transparent text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 border border-transparent',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-6 py-2.5 text-base rounded-xl gap-2.5',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-base)]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  )
}
