import { motion } from 'motion/react'
import { Accessibility, Home, CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

interface VisualAccessibilityCardProps {
  preferAccessible?: boolean
  onToggleAccessible?: (val: boolean) => void
  accessibleSheltersCount?: number
  recommendedShelterName?: string
  occupancyPercent?: number
}

export default function VisualAccessibilityCard({
  preferAccessible = true,
  onToggleAccessible,
  accessibleSheltersCount = 4,
  recommendedShelterName = 'Sarusajai Stadium Logistics Hub (Guwahati)',
  occupancyPercent = 68,
}: VisualAccessibilityCardProps) {
  const { t } = useLanguage()

  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--color-bg-surface)',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'rgba(236, 72, 153, 0.2)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EC4899',
            }}
          >
            <Accessibility size={16} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {t('accessibilityTitle')}
          </h3>
        </div>

        {/* Priority Toggle / Badge */}
        {onToggleAccessible ? (
          <button
            onClick={() => onToggleAccessible(!preferAccessible)}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              background: preferAccessible ? 'rgba(236, 72, 153, 0.25)' : 'var(--color-bg-elevated)',
              border: `1px solid ${preferAccessible ? '#EC4899' : 'var(--color-border)'}`,
              color: preferAccessible ? '#F472B6' : 'var(--color-text-muted)',
              fontSize: 10.5,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>♿ Wheelchair Priority:</span>
            <span>{preferAccessible ? 'ON' : 'OFF'}</span>
          </button>
        ) : (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(236, 72, 153, 0.2)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#F472B6',
              fontSize: 10.5,
              fontWeight: 800,
            }}
          >
            ♿ Wheelchair Priority: ON
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Metric pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('accessibleSheltersCount')}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#EC4899', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {accessibleSheltersCount} Hubs
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Slope / Step Filter
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} /> Zero Barrier
            </div>
          </div>
        </div>

        {/* Recommended Shelter + Capacity Bar */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            background: 'var(--color-bg-elevated)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('recommendedShelter')}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981' }}>
              VERIFIED ACCESSIBLE
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {recommendedShelterName}
          </div>

          {/* Capacity Meter Bar */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 3 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{t('shelterCapacity')} Utilization</span>
              <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: occupancyPercent > 85 ? '#EF4444' : '#60A5FA' }}>
                {occupancyPercent}%
              </span>
            </div>

            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${occupancyPercent}%` }}
                transition={{ duration: 0.6 }}
                style={{
                  height: '100%',
                  background: occupancyPercent > 85
                    ? '#EF4444'
                    : occupancyPercent > 70
                    ? '#F59E0B'
                    : '#3B82F6',
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        </div>

        {/* Accessibility Features Checklist Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            'Step-free Ramps',
            'Wheelchair Vans Monitored',
            'Medical Oxygen Ready',
            'Disability Helpdesk Active',
          ].map(feature => (
            <span
              key={feature}
              style={{
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 4,
                background: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                color: '#F472B6',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <CheckCircle2 size={11} color="#10B981" />
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
