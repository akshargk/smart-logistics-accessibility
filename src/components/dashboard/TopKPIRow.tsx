import { motion } from 'motion/react'
import { AlertTriangle, ShieldCheck, ShieldAlert, Bell, Waves, Home } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

interface TopKPIRowProps {
  hazardsCount?: number
  sheltersCount?: number
  highRiskZonesCount?: number
  alertsCount?: number
}

export default function TopKPIRow({
  hazardsCount = 5,
  sheltersCount = 7,
  highRiskZonesCount = 3,
  alertsCount = 12,
}: TopKPIRowProps) {
  const { t } = useLanguage()

  const kpis = [
    {
      id: 'hazards',
      value: hazardsCount,
      label: t('activeHazards'),
      sub: 'Monitored Rivers & Slopes',
      icon: Waves,
      color: 'var(--color-accent-red)',
      stripColor: 'var(--color-accent-red)',
      badgeBg: 'var(--color-accent-red-dim)',
      badge: 'LIVE',
    },
    {
      id: 'shelters',
      value: sheltersCount,
      label: t('safeShelters'),
      sub: 'Accessible Logistics Hubs',
      icon: Home,
      color: 'var(--color-accent-green)',
      stripColor: 'var(--color-accent-green)',
      badgeBg: 'var(--color-accent-green-dim)',
      badge: 'VERIFIED',
    },
    {
      id: 'highrisk',
      value: highRiskZonesCount,
      label: t('highRiskZones'),
      sub: 'Brahmaputra & Hill Slopes',
      icon: ShieldAlert,
      color: 'var(--color-accent-orange)',
      stripColor: 'var(--color-accent-orange)',
      badgeBg: 'var(--color-accent-orange-dim)',
      badge: 'CRITICAL',
    },
    {
      id: 'alerts',
      value: alertsCount,
      label: t('activeAlerts'),
      sub: 'Real-Time Dispatches',
      icon: Bell,
      color: 'var(--color-accent-blue)',
      stripColor: 'var(--color-accent-blue)',
      badgeBg: 'var(--color-accent-blue-dim)',
      badge: 'BROADCAST',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
      }}
      role="region"
      aria-label="Core Logistics Indicators"
    >
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
            whileHover={{ y: -2, scale: 1.01 }}
            style={{
              padding: '16px 18px 14px',
              borderRadius: 12,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top colored accent strip */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: kpi.stripColor,
              }}
            />

            {/* Top row: icon + badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: kpi.badgeBg,
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: kpi.color,
                }}
              >
                <Icon size={17} strokeWidth={2.4} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: kpi.badgeBg,
                  color: kpi.color,
                  border: '1px solid var(--color-border)',
                }}
              >
                {kpi.badge}
              </span>
            </div>

            {/* Large number */}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {kpi.value}
              </span>
            </div>

            {/* Small label */}
            <div style={{ marginTop: 6 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: kpi.color,
                }}
              >
                {kpi.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {kpi.sub}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )

}
