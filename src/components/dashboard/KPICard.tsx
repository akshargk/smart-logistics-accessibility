import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

interface KPICardProps {
  icon: ReactNode
  label: string
  value: number
  delta: number
  deltaLabel: string
  trend: 'up' | 'down' | 'stable'
  accentColor: string
  accentDim: string
  index?: number
}

export default function KPICard({
  icon,
  label,
  value,
  delta,
  deltaLabel,
  trend,
  accentColor,
  accentDim,
  index = 0,
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'var(--color-accent-red)' : trend === 'down' ? 'var(--color-accent-green)' : 'var(--color-text-muted)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 26 }}
      whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(0,0,0,0.3)' }}
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle accent line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
          opacity: 0.7,
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: accentDim,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: trendColor,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <TrendIcon size={12} strokeWidth={2.5} />
          {delta > 0 ? '+' : ''}{delta}
        </div>
      </div>

      {/* Value */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.08 + 0.2 }}
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {value.toLocaleString()}
        </motion.div>
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </div>
      </div>

      {/* Delta label */}
      <div
        style={{
          paddingTop: 12,
          borderTop: '1px solid var(--color-border)',
          fontSize: 11,
          color: 'var(--color-text-muted)',
        }}
      >
        <span style={{ color: trendColor, fontWeight: 600 }}>
          {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)}
        </span>{' '}
        {deltaLabel}
      </div>
    </motion.div>
  )
}
