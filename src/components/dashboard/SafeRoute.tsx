import { motion } from 'motion/react'
import { ArrowRight, MapPin, Navigation, Clock, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { routes } from '../../data/mockData'
import { RiskBadge } from '../ui/Badges'

export default function SafeRoute() {
  const primaryRoute = routes[0]
  const statusConfig = {
    SAFE: { color: 'var(--color-accent-green)', Icon: CheckCircle, bg: 'var(--color-accent-green-dim)' },
    CAUTION: { color: 'var(--color-accent-orange)', Icon: AlertTriangle, bg: 'var(--color-accent-orange-dim)' },
    BLOCKED: { color: 'var(--color-accent-red)', Icon: AlertTriangle, bg: 'var(--color-accent-red-dim)' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 26 }}
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        minHeight: 0,
      }}
      role="region"
      aria-label="Safe Route Information"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'var(--color-accent-green-dim)',
              border: '1px solid var(--color-accent-green-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Navigation size={15} color="var(--color-accent-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Safe Route
            </h3>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
              Optimal evacuation path
            </p>
          </div>
        </div>
        <RiskBadge risk={primaryRoute.risk} size="md" />
      </div>

      {/* Route visualization */}
      <div style={{ padding: '14px 16px', flex: 1 }}>
        {/* From → To */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 12 }}>
          {/* Origin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'var(--color-accent-blue-dim)',
                border: '1px solid var(--color-accent-blue-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MapPin size={15} color="var(--color-accent-blue)" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Current Location
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 1 }}>
                {primaryRoute.from}
              </div>
            </div>
          </div>

          {/* Route line visual */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0 6px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.12 }}
                  style={{
                    width: 2,
                    height: 7,
                    borderRadius: 1,
                    background: 'var(--color-accent-green)',
                  }}
                />
              ))}
            </div>
            {/* Route stats inline */}
            <div
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                gap: 16,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {primaryRoute.eta}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>min ETA</div>
              </div>
              <div style={{ width: 1, background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {primaryRoute.distance}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>km</div>
              </div>
              <div style={{ width: 1, background: 'var(--color-border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-accent-green)', fontFamily: 'var(--font-mono)' }}>
                  {primaryRoute.blockedRoadsAvoided}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>avoided</div>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'var(--color-accent-green-dim)',
                border: '1px solid var(--color-accent-green-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={15} color="var(--color-accent-green)" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Destination Shelter
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 1 }}>
                {primaryRoute.to}
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 8,
            background: statusConfig[primaryRoute.status].bg,
            border: `1px solid ${primaryRoute.status === 'SAFE' ? 'var(--color-accent-green-border)' : 'var(--color-border)'}`,
            marginBottom: 12,
          }}
        >
          {(() => {
            const { Icon } = statusConfig[primaryRoute.status]
            return <Icon size={13} color={statusConfig[primaryRoute.status].color} />
          })()}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: statusConfig[primaryRoute.status].color,
            }}
          >
            Route {primaryRoute.status === 'SAFE' ? 'Clear' : primaryRoute.status}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} />
            {primaryRoute.lastUpdated}
          </span>
        </div>

        {/* All routes */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            All Active Routes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {routes.map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 10px',
                  borderRadius: 7,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: route.status === 'SAFE' ? 'var(--color-accent-green)' :
                      route.status === 'CAUTION' ? 'var(--color-accent-orange)' : 'var(--color-accent-red)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {route.from.split(' ')[0]} → {route.to.split(' ')[0]}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {route.status === 'BLOCKED' ? 'BLOCKED' : `${route.eta}m`}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ y: -1, scale: 1.012, background: '#2563EB', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)' }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            const mapEl = document.querySelector('.leaflet-container')
            if (mapEl) {
              mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            window.dispatchEvent(new CustomEvent('smartlogix:focus-route', { detail: { routeId: 'r-nh6' } }))
          }}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 9,
            background: 'var(--color-accent-blue)',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            letterSpacing: '0.01em',
          }}
          aria-label="View recommended route on map"
        >
          <Navigation size={14} />
          VIEW ROUTE ON MAP
          <ArrowRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}
