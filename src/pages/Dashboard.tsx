import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import CriticalAlertBanner from '../components/dashboard/CriticalAlertBanner'
import KPIGrid from '../components/dashboard/KPIGrid'
import RiskMap from '../components/dashboard/RiskMap'
import DisasterPanel from '../components/dashboard/DisasterPanel'
import RiskChart from '../components/dashboard/RiskChart'
import SafeRoute from '../components/dashboard/SafeRoute'
import AccessibilityStatus from '../components/dashboard/AccessibilityStatus'
import AlertPanel from '../components/dashboard/AlertPanel'
import { systemStatus } from '../data/mockData'
import { useLanguage } from '../context/LanguageContext'

// Section container with entrance animation
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 28 }}
    >
      {children}
    </motion.div>
  )
}

export default function Dashboard() {
  const { t } = useLanguage()

  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = time.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '4px 0 24px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Page header matching Image 1 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {t('dashboard.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            {dateStr} · {timeStr} IST ·{' '}
            <span style={{ color: 'var(--color-accent-green)', fontWeight: 600 }}>{t('status.northeastIndia')}</span>
          </p>
        </div>

        {/* Quick stats badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', fontWeight: 700 }}>
              64
            </span>{' '}
            {t('dashboard.zonesMonitored')}
          </div>

          <motion.div
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--color-accent-green-dim)',
              border: '1px solid var(--color-accent-green-border)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-accent-green)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent-green)', display: 'inline-block' }} />
            {t('dashboard.live')}
          </motion.div>
        </div>
      </motion.div>

      {/* Critical alert marquee banner */}
      <CriticalAlertBanner />

      {/* 4 Top KPI Cards */}
      <Section delay={0.05}>
        <KPIGrid />
      </Section>

      {/* Hero map + Disasters layout */}
      <Section delay={0.12}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 350px',
            gap: 16,
            alignItems: 'stretch',
          }}
          className="map-grid"
        >
          <RiskMap />
          <DisasterPanel />
        </div>
      </Section>

      {/* Analytics row: Weather/Risk Chart + Safe Route */}
      <Section delay={0.20}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 350px',
            gap: 16,
            alignItems: 'stretch',
          }}
          className="analytics-grid"
        >
          <RiskChart />
          <SafeRoute />
        </div>
      </Section>

      {/* Accessibility & Alerts */}
      <Section delay={0.28}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '400px minmax(0, 1fr)',
            gap: 16,
            alignItems: 'stretch',
          }}
          className="bottom-grid"
        >
          <AccessibilityStatus />
          <AlertPanel />
        </div>
      </Section>

      {/* Clean Dashboard Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '16px 0 4px',
          borderTop: '1px solid var(--color-border)',
          fontSize: 12,
          color: 'var(--color-text-muted)',
        }}
      >
        SmartLogix Command Center · Smart India Hackathon 2026 · Northeast India Tactical Grid
      </div>
    </div>
  )
}
