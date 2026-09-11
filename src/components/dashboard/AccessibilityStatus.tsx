import { motion } from 'motion/react'
import { Accessibility, Home, HandHelping, Bus, AlertOctagon, CheckCircle, XCircle } from 'lucide-react'
import { accessibilityData } from '../../data/mockData'

export default function AccessibilityStatus() {
  const stats = [
    {
      label: 'Accessible Routes',
      value: accessibilityData.accessibleRoutes.count,
      note: accessibilityData.accessibleRoutes.note,
      Icon: Accessibility,
      color: 'var(--color-accent-pink)',
      dim: 'var(--color-accent-pink-dim)',
    },
    {
      label: 'Accessible Shelters',
      value: accessibilityData.accessibleShelters.count,
      note: accessibilityData.accessibleShelters.note,
      Icon: Home,
      color: 'var(--color-accent-blue)',
      dim: 'var(--color-accent-blue-dim)',
    },
    {
      label: 'Assistance Required',
      value: accessibilityData.assistanceRequired.count,
      note: accessibilityData.assistanceRequired.note,
      Icon: HandHelping,
      color: 'var(--color-accent-orange)',
      dim: 'var(--color-accent-orange-dim)',
    },
    {
      label: 'Accessible Transport',
      value: accessibilityData.accessibleTransport.count,
      note: accessibilityData.accessibleTransport.note,
      Icon: Bus,
      color: 'var(--color-accent-green)',
      dim: 'var(--color-accent-green-dim)',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 26 }}
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
      role="region"
      aria-label="Accessibility Status"
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
              background: 'var(--color-accent-pink-dim)',
              border: '1px solid var(--color-accent-pink-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Accessibility size={15} color="var(--color-accent-pink)" />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Accessibility Status
            </h3>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
              Inclusive disaster response
            </p>
          </div>
        </div>
        <div
          style={{
            padding: '3px 9px',
            borderRadius: 20,
            background: 'var(--color-accent-pink-dim)',
            border: '1px solid var(--color-accent-pink-border)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--color-accent-pink)',
          }}
        >
          A11Y
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginBottom: 16,
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              style={{
                padding: '12px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: stat.dim,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <stat.Icon size={13} color={stat.color} strokeWidth={2} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{stat.label}</span>
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: stat.color,
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {stat.note}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature list */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Feature Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {accessibilityData.features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.07 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 7,
                  background: feature.active ? 'rgba(236, 72, 153, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                  border: `1px solid ${feature.active ? 'var(--color-accent-pink-border)' : 'var(--color-accent-red-border)'}`,
                }}
              >
                {feature.active ? (
                  <CheckCircle size={13} color="var(--color-accent-pink)" strokeWidth={2} />
                ) : (
                  <XCircle size={13} color="var(--color-accent-red)" strokeWidth={2} />
                )}
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1 }}>
                  {feature.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: feature.active ? 'var(--color-accent-pink)' : 'var(--color-accent-red)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {feature.count}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
