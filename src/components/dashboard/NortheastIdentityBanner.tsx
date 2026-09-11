import { motion } from 'motion/react'
import { Users, Mountain, ShieldCheck, HeartHandshake, Compass } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function NortheastIdentityBanner() {
  const { t } = useLanguage()

  return (
    <div
      style={{
        padding: '14px 20px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #123C2A 0%, #173B63 100%)',
        border: '1.5px solid #C9A227',
        boxShadow: '0 4px 16px rgba(18, 60, 42, 0.18)',
        color: '#FAF6EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
      role="region"
      aria-label="Northeast India Identity"
    >
      {/* Subtle topographic contour overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: `radial-gradient(circle at 95% 20%, rgba(201, 162, 39, 0.12) 0%, transparent 55%),
            repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 31px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Left: People & Culture branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #E67E22 0%, #C9A227 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 2px 10px rgba(230, 126, 34, 0.4)',
          }}
        >
          <Users size={22} strokeWidth={2.4} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                padding: '2px 7px',
                borderRadius: 4,
                background: 'rgba(201, 162, 39, 0.25)',
                color: '#C9A227',
                border: '1px solid rgba(201, 162, 39, 0.45)',
                textTransform: 'uppercase',
              }}
            >
              NORTHEAST INDIA
            </span>
            <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 600 }}>
              Autonomous Disaster Logistics Grid
            </span>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginTop: 2, letterSpacing: '-0.01em' }}>
            8 STATES • DIVERSE COMMUNITIES • CONNECTED LOGISTICS
          </h2>

          <div style={{ fontSize: 11.5, color: '#E2E8F0', marginTop: 2 }}>
            Empowering community first-responders, elderly citizens, and wheelchair users across river basins &amp; mountain slopes.
          </div>
        </div>
      </div>

      {/* Right: State Sector Badges */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {[
          'Assam (Brahmaputra)',
          'Meghalaya (Garo/Khasi)',
          'Arunachal Pradesh',
          'Sikkim (Himalayan)',
          'Nagaland',
          'Manipur',
          'Mizoram',
          'Tripura',
        ].map(st => (
          <span
            key={st}
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FAF6EE',
            }}
          >
            {st}
          </span>
        ))}
      </div>
    </div>
  )
}
