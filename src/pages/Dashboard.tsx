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
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page header */}
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
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Command Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            {dateStr} · {timeStr} IST ·{' '}
            <span style={{ color: 'var(--color-accent-blue)' }}>{systemStatus.activeRegion}</span>
          </p>
        </div>

        {/* Quick stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {systemStatus.totalZonesMonitored}
            </span>{' '}
            zones monitored
          </div>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--color-accent-green-dim)',
              border: '1px solid var(--color-accent-green-border)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-accent-green)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-green)', display: 'inline-block' }} />
            LIVE
          </motion.div>
        </div>
      </motion.div>

      {/* Critical alert banner */}
      <CriticalAlertBanner />

      {/* KPI cards */}
      <Section delay={0.05}>
        <KPIGrid />
      </Section>

      {/* HERO: Map + Disasters */}
      <Section delay={0.15}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: 16,
            alignItems: 'stretch',
          }}
          className="map-grid"
        >
          <RiskMap />
          <DisasterPanel />
        </div>
      </Section>

      {/* Analytics row: Chart + Safe Route */}
      <Section delay={0.25}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: 16,
            alignItems: 'stretch',
          }}
          className="analytics-grid"
        >
          <RiskChart />
          <SafeRoute />
        </div>
      </Section>

      {/* Bottom row: Accessibility + Alerts */}
      <Section delay={0.35}>
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

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          textAlign: 'center',
          padding: '16px 0 4px',
          borderTop: '1px solid var(--color-border)',
          fontSize: 11,
          color: 'var(--color-text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span>SmartLogix Command Center · Smart India Hackathon 2026</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          Mock data — not connected to live backend
        </span>
        <span>v0.1.0-sih</span>
      </motion.footer>
    </div>
  )
}
