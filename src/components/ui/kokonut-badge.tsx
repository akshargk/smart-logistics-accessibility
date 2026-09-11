import { motion } from 'motion/react'
import { cn } from '../../lib/utils'

interface KokonutBadgeProps {
  label: string
  color?: string
  pulse?: boolean
  variant?: 'solid' | 'subtle' | 'outline'
  className?: string
}

/**
 * Kokonut UI — Status Indicator Badge
 * Displays glowing micro-dot with animated pulse and subtle backdrop.
 */
export function KokonutBadge({
  label,
  color = '#10B981',
  pulse = true,
  variant = 'subtle',
  className,
}: KokonutBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none',
        variant === 'subtle' && 'border backdrop-blur-sm',
        className
      )}
      style={{
        backgroundColor: variant === 'subtle' ? `${color}15` : variant === 'solid' ? color : 'transparent',
        borderColor: `${color}40`,
        color: variant === 'solid' ? '#FFFFFF' : color,
      }}
    >
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
        {pulse && (
          <motion.span
            animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
      <span className="tracking-wide uppercase text-[10px] font-mono">{label}</span>
    </div>
  )
}
