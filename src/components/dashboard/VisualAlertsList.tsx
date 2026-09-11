import { motion } from 'motion/react'
import { AlertTriangle, AlertOctagon, Bell, CheckCircle2, MapPin, Clock } from 'lucide-react'
import { BackendAlert } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

interface VisualAlertsListProps {
  alerts: BackendAlert[]
  onAcknowledge?: (id: string) => void
}

export default function VisualAlertsList({ alerts, onAcknowledge }: VisualAlertsListProps) {
  const { t } = useLanguage()

  const getAlertTheme = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return {
          icon: AlertOctagon,
          badgeBg: 'rgba(239, 68, 68, 0.2)',
          text: '#FCA5A5',
          border: 'rgba(239, 68, 68, 0.4)',
        }
      case 'HIGH':
        return {
          icon: AlertTriangle,
          badgeBg: 'rgba(239, 68, 68, 0.12)',
          text: '#F87171',
          border: 'rgba(239, 68, 68, 0.3)',
        }
      case 'MEDIUM':
      case 'MODERATE':
        return {
          icon: AlertTriangle,
          badgeBg: 'rgba(245, 158, 11, 0.12)',
          text: '#FBBF24',
          border: 'rgba(245, 158, 11, 0.3)',
        }
      default:
        return {
          icon: Bell,
          badgeBg: 'rgba(16, 185, 129, 0.12)',
          text: '#34D399',
          border: 'rgba(16, 185, 129, 0.3)',
        }
    }
  }

  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={16} color="#F59E0B" />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {t('triggeredAlertsTitle')} ({alerts.length})
          </h3>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          DISPATCH QUEUE
        </span>
      </div>

      {alerts.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
          No active alerts in current sector.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map(alert => {
            const theme = getAlertTheme(alert.risk_level)
            const Icon = theme.icon
            const isAck = alert.status === 'ACKNOWLEDGED'

            return (
              <motion.div
                key={alert.id}
                whileHover={{ x: 2 }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--color-bg-elevated)',
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                {/* Left: Severity badge + title + short message */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 9.5,
                        fontWeight: 800,
                        background: theme.badgeBg,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      {alert.risk_level}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {alert.title}
                    </span>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 3, lineHeight: 1.35 }}>
                    {alert.message}
                  </p>
                </div>

                {/* Right: Acknowledge button / status */}
                <div>
                  {isAck ? (
                    <span style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <CheckCircle2 size={13} /> {t('acknowledged')}
                    </span>
                  ) : onAcknowledge ? (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t('acknowledge')}
                    </button>
                  ) : (
                    <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)' }}>
                      {alert.status}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
