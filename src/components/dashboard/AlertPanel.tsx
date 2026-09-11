import { motion, AnimatePresence } from 'motion/react'
import { Bell, AlertOctagon, AlertTriangle, Info, Clock, MapPin } from 'lucide-react'
import { alerts } from '../../data/mockData'
import type { RiskLevel } from '../../data/mockData'
import { RiskBadge } from '../ui/Badges'

const severityIcons: Record<RiskLevel, typeof Bell> = {
  CRITICAL: AlertOctagon,
  HIGH: AlertTriangle,
  MODERATE: Bell,
  LOW: Info,
}

const severityColors: Record<RiskLevel, { border: string; bg: string; icon: string }> = {
  CRITICAL: {
    border: 'rgba(239, 68, 68, 0.4)',
    bg: 'rgba(239, 68, 68, 0.06)',
    icon: '#FCA5A5',
  },
  HIGH: {
    border: 'var(--color-accent-red-border)',
    bg: 'var(--color-accent-red-dim)',
    icon: 'var(--color-accent-red)',
  },
  MODERATE: {
    border: 'var(--color-accent-orange-border)',
    bg: 'var(--color-accent-orange-dim)',
    icon: 'var(--color-accent-orange)',
  },
  LOW: {
    border: 'var(--color-border)',
    bg: 'var(--color-bg-elevated)',
    icon: 'var(--color-text-muted)',
  },
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.4 },
  },
}

const alertVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
}

export default function AlertPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, type: 'spring', stiffness: 260, damping: 26 }}
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      role="region"
      aria-label="Recent Alerts"
      aria-live="polite"
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 18px 12px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'var(--color-accent-red-dim)',
              border: '1px solid var(--color-accent-red-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={15} color="var(--color-accent-red)" />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Recent Alerts
            </h3>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
              {alerts.filter(a => a.isNew).length} new since last check
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ y: -1, scale: 1.015, filter: 'brightness(1.08)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: '5px 12px',
            borderRadius: 7,
            background: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
          aria-label="View all alerts"
        >
          View All
        </motion.button>
      </div>

      {/* Alerts list */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          maxHeight: 420,
        }}
      >
        <AnimatePresence mode="popLayout">
          {alerts.map(alert => {
            const Icon = severityIcons[alert.severity]
            const colors = severityColors[alert.severity]
            const isHighPriority = alert.severity === 'HIGH' || alert.severity === 'CRITICAL'

            return (
              <motion.article
                key={alert.id}
                variants={alertVariants}
                layout
                whileHover={{ x: 2, scale: 1.006, boxShadow: '0 4px 16px -2px rgba(0,0,0,0.3)' }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 9,
                  padding: '11px 13px',
                  cursor: 'default',
                  overflow: 'hidden',
                }}
                aria-label={`${alert.severity} alert: ${alert.title}`}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {/* Icon */}
                  <div style={{ flexShrink: 0, paddingTop: 1 }}>
                    {isHighPriority ? (
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Icon size={15} color={colors.icon} strokeWidth={2.5} />
                      </motion.div>
                    ) : (
                      <Icon size={15} color={colors.icon} strokeWidth={2} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                        flexWrap: 'wrap',
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          lineHeight: 1.3,
                          flex: 1,
                        }}
                      >
                        {alert.title}
                        {alert.isNew && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              display: 'inline-block',
                              marginLeft: 6,
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: 'var(--color-accent-blue)',
                              color: '#fff',
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              verticalAlign: 'middle',
                            }}
                          >
                            NEW
                          </motion.span>
                        )}
                      </span>
                      <RiskBadge risk={alert.severity} size="sm" dot={false} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} color="var(--color-text-muted)" />
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                          {alert.location}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} color="var(--color-text-muted)" />
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--color-text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {alert.timeAgo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
