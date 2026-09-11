import React from 'react'
import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BklitMetricProps {
  icon: React.ReactNode
  label: string
  value: number | string
  delta: number
  deltaLabel: string
  trend: 'up' | 'down' | 'stable'
  accentColor: string
  accentDim: string
  index?: number
  className?: string
}

/**
 * Bklit UI — Telemetry Metric Card
 * Incorporates composable data visualization aesthetics, subtle radial spotlight,
 * and high-contrast telemetry numbers suited for mission-critical command centers.
 */
export function BklitMetricCard({
  icon,
  label,
  value,
  delta,
  deltaLabel,
  trend,
  accentColor,
  accentDim,
  index = 0,
  className,
}: BklitMetricProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up'
      ? 'var(--color-accent-red)'
      : trend === 'down'
      ? 'var(--color-accent-green)'
      : 'var(--color-text-muted)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 26 }}
      whileHover={{ y: -2, boxShadow: `0 8px 30px ${accentColor}18` }}
      className={cn(
        'relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 overflow-hidden transition-all duration-300 flex flex-col justify-between gap-3',
        className
      )}
    >
      {/* Top micro-line indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}40 60%, transparent 100%)`,
        }}
      />

      {/* Header with Icon and Trend Pill */}
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center border"
          style={{
            backgroundColor: accentDim,
            borderColor: `${accentColor}30`,
            color: accentColor,
          }}
        >
          {icon}
        </div>

        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-mono border"
          style={{
            backgroundColor: `${trendColor}12`,
            borderColor: `${trendColor}30`,
            color: trendColor,
          }}
        >
          <TrendIcon size={11} strokeWidth={2.5} />
          <span>{delta > 0 ? `+${delta}` : delta}</span>
        </div>
      </div>

      {/* Main Metric Value */}
      <div>
        <div className="text-3xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1 tracking-wide">
          {label}
        </div>
      </div>

      {/* Footer / Delta Subtitle */}
      <div className="pt-2.5 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex items-center justify-between">
        <span>
          <strong style={{ color: trendColor }}>
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)}
          </strong>{' '}
          {deltaLabel}
        </span>
        <span className="text-[10px] font-mono opacity-60">TELEMETRY</span>
      </div>
    </motion.div>
  )
}
export default BklitMetricCard
