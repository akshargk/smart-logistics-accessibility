import { motion, AnimatePresence } from 'motion/react'
import { Waves, Mountain, CloudLightning, Wind, Clock, Users } from 'lucide-react'
import { disasters } from '../../data/mockData'
import type { DisasterType, RiskLevel } from '../../data/mockData'
import { RiskBadge, LiveIndicator } from '../ui/Badges'

const disasterIcons: Record<DisasterType, typeof Waves> = {
  FLOOD: Waves,
  LANDSLIDE: Mountain,
  CYCLONE: CloudLightning,
  STORM: Wind,
  DROUGHT: Wind,
  EARTHQUAKE: Mountain,
}

const disasterColors: Record<DisasterType, string> = {
  FLOOD: 'var(--color-accent-blue)',
  LANDSLIDE: 'var(--color-accent-orange)',
  CYCLONE: 'var(--color-accent-pink)',
  STORM: 'var(--color-accent-yellow)',
  DROUGHT: 'var(--color-accent-orange)',
  EARTHQUAKE: 'var(--color-accent-red)',
}

const riskBorderColors: Record<RiskLevel, string> = {
  HIGH: 'var(--color-accent-red-border)',
  CRITICAL: 'rgba(239,68,68,0.4)',
  MODERATE: 'var(--color-accent-orange-border)',
  LOW: 'var(--color-border)',
}

function formatTime(isoStr: string): string {
  const date = new Date(isoStr)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
}

export default function DisasterPanel() {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        minHeight: 540,
      }}
      role="region"
      aria-label="Active Disasters Panel"
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px 10px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            Active Disasters
          </h2>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {disasters.filter(d => d.status === 'ACTIVE').length} active · {disasters.length} monitored
          </p>
        </div>
        <LiveIndicator label="MONITORING" color="var(--color-accent-orange)" />
      </div>

      {/* Disaster list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <AnimatePresence>
          {disasters.map(disaster => {
            const Icon = disasterIcons[disaster.type]
            const iconColor = disasterColors[disaster.type]
            const isActive = disaster.status === 'ACTIVE'
            const isHighRisk = disaster.severity === 'HIGH' || disaster.severity === 'CRITICAL'

            return (
              <motion.div
                key={disaster.id}
                variants={itemVariants}
                layout
                whileHover={{ x: 2, scale: 1.006, boxShadow: '0 4px 16px -2px rgba(0,0,0,0.3)' }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: isHighRisk ? 'rgba(239, 68, 68, 0.04)' : 'var(--color-bg-elevated)',
                  border: `1px solid ${riskBorderColors[disaster.severity]}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: 'default',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `${iconColor}18`,
                      border: `1px solid ${iconColor}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color={iconColor} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {disaster.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--color-text-secondary)',
                        marginTop: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {disaster.region}
                    </div>
                  </div>
                  <RiskBadge risk={disaster.severity} />
                </div>

                {/* Description */}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
                  {disaster.description}
                </div>

                {/* Footer row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {disaster.evacuees !== undefined && disaster.evacuees > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={11} color="var(--color-text-muted)" />
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {disaster.evacuees.toLocaleString()} evacuees
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} color="var(--color-text-muted)" />
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatTime(disaster.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: isActive ? 'var(--color-accent-red)' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {isActive && (
                      <motion.span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--color-accent-red)',
                          display: 'inline-block',
                        }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    {disaster.status}
                  </span>
                </div>

                {/* Affected area */}
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Affected area</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {disaster.affectedArea}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
