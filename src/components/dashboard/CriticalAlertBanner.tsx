import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertOctagon, X, ChevronRight } from 'lucide-react'
import { alerts } from '../../data/mockData'

export default function CriticalAlertBanner() {
  const [dismissed, setDismissed] = useState(false)
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').slice(0, 2)

  if (criticalAlerts.length === 0) return null

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="critical-banner"
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)',
            border: '1px solid var(--color-accent-red-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            overflow: 'hidden',
          }}
          role="alert"
          aria-label="Critical alerts banner"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              flexWrap: 'wrap',
            }}
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <AlertOctagon size={16} color="var(--color-accent-red)" strokeWidth={2.5} />
            </motion.div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-accent-red)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              CRITICAL ALERTS
            </span>
            <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
              {criticalAlerts.map((alert, i) => (
                <span
                  key={alert.id}
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {i > 0 && <span style={{ color: 'var(--color-border-strong)' }}>·</span>}
                  <strong style={{ color: 'var(--color-text-primary)' }}>{alert.title}</strong>
                  <span style={{ color: 'var(--color-text-muted)' }}>— {alert.location}</span>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'var(--color-accent-red)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
                aria-label="View all critical alerts"
              >
                View All
                <ChevronRight size={11} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDismissed(true)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Dismiss critical alerts banner"
              >
                <X size={13} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
