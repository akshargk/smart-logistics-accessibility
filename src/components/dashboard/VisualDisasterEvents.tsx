import { motion } from 'motion/react'
import { Waves, Mountain, CloudLightning, Wind, MapPin, Radio } from 'lucide-react'
import { BackendDisasterEvent } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

interface VisualDisasterEventsProps {
  events: BackendDisasterEvent[]
}

export default function VisualDisasterEvents({ events }: VisualDisasterEventsProps) {
  const { t } = useLanguage()

  const getDisasterIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'FLOOD': return { icon: Waves, emoji: '🌊', color: '#3B82F6' }
      case 'LANDSLIDE': return { icon: Mountain, emoji: '⛰️', color: '#F97316' }
      case 'CYCLONE': return { icon: CloudLightning, emoji: '🌀', color: '#EC4899' }
      case 'STORM': return { icon: Wind, emoji: '🌪️', color: '#EAB308' }
      default: return { icon: Waves, emoji: '🚨', color: '#EF4444' }
    }
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: '#FCA5A5', border: 'rgba(239, 68, 68, 0.4)' }
      case 'HIGH':
        return { bg: 'rgba(239, 68, 68, 0.12)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' }
      case 'MEDIUM':
      case 'MODERATE':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' }
      default:
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' }
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
          <Radio size={16} color="#EF4444" />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {t('activeDisastersTitle')} ({events.length})
          </h3>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          DB ACTIVE HAZARDS
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        {events.map(ev => {
          const info = getDisasterIcon(ev.disaster_type)
          const sevStyle = getSeverityBadge(ev.severity)
          return (
            <motion.div
              key={ev.id}
              whileHover={{ y: -2, scale: 1.01 }}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'var(--color-bg-elevated)',
                border: `1px solid ${sevStyle.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Row 1: Type + Severity Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{info.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: info.color, letterSpacing: '0.04em' }}>
                    {ev.disaster_type?.toUpperCase()}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: sevStyle.bg,
                    color: sevStyle.text,
                    border: `1px solid ${sevStyle.border}`,
                  }}
                >
                  {ev.severity}
                </span>
              </div>

              {/* Row 2: Location Name */}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {ev.name}
              </div>

              {/* Row 3: Status dot + Radius */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#10B981', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  {ev.status || 'Active'}
                </span>
                <span>Radius: {ev.radius_km} km</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
