import { motion } from 'motion/react'
import type { RiskLevel } from '../../data/mockData'

interface BadgeProps {
  risk: RiskLevel
  size?: 'sm' | 'md'
  dot?: boolean
}

const riskConfig: Record<RiskLevel, { label: string; className: string; dotColor: string }> = {
  LOW: { label: 'LOW', className: 'risk-low', dotColor: 'var(--color-accent-green)' },
  MODERATE: { label: 'MODERATE', className: 'risk-moderate', dotColor: 'var(--color-accent-orange)' },
  HIGH: { label: 'HIGH', className: 'risk-high', dotColor: 'var(--color-accent-red)' },
  CRITICAL: { label: 'CRITICAL', className: 'risk-critical', dotColor: '#FCA5A5' },
}

export function RiskBadge({ risk, size = 'sm', dot = true }: BadgeProps) {
  const config = riskConfig[risk]
  return (
    <span
      className={`risk-badge ${config.className}`}
      style={{ fontSize: size === 'md' ? 12 : 10, padding: size === 'md' ? '3px 9px' : '2px 7px' }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: config.dotColor,
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
      )}
      {config.label}
    </span>
  )
}

interface LiveIndicatorProps {
  label?: string
  color?: string
}

export function LiveIndicator({ label = 'LIVE', color = 'var(--color-accent-red)' }: LiveIndicatorProps) {
  return (
    <div className="live-indicator" style={{ color }}>
      <motion.span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {label}
    </div>
  )
}

interface StatusDotProps {
  color?: string
  pulse?: boolean
  size?: number
}

export function StatusDot({ color = 'var(--color-accent-green)', pulse = false, size = 7 }: StatusDotProps) {
  const dot = (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )

  if (!pulse) return dot

  return (
    <motion.span
      style={{ display: 'inline-block', flexShrink: 0 }}
      animate={{ opacity: [1, 0.4, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {dot}
    </motion.span>
  )
}

interface TimeAgoProps {
  text: string
}

export function TimeAgo({ text }: TimeAgoProps) {
  return (
    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
      {text}
    </span>
  )
}
