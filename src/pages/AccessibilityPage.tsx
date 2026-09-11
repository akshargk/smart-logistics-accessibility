import { motion } from 'motion/react'
import { Accessibility, CheckCircle, XCircle, Route, Building, Users, Truck, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { accessibilityData } from '../data/mockData'
import { useLanguage } from '../context/LanguageContext'
import { useBackend } from '../context/BackendContext'

export default function AccessibilityPage() {
  const { t } = useLanguage()
  const { safeLocations, backendOnline } = useBackend()

  const accessibleLocations = safeLocations.filter(loc => loc.is_accessible)
  const totalCapacity = accessibleLocations.reduce((sum, loc) => sum + (loc.capacity || 0), 0)
  const currentOccupancy = accessibleLocations.reduce((sum, loc) => sum + (loc.current_occupancy || 0), 0)

  const stats = [
    {
      label: 'Accessible Routes',
      value: accessibilityData.accessibleRoutes.count,
      note: 'Monitored gradient < 6°',
      icon: Route,
      color: 'var(--color-accent-green)'
    },
    {
      label: 'Accessible Shelters',
      value: accessibleLocations.length > 0 ? accessibleLocations.length : accessibilityData.accessibleShelters.count,
      note: `${totalCapacity > 0 ? totalCapacity.toLocaleString() : '12,400'} total beds`,
      icon: Building,
      color: 'var(--color-accent-blue)'
    },
    {
      label: 'Evacuees Accommodated',
      value: currentOccupancy > 0 ? currentOccupancy.toLocaleString() : '4,820',
      note: 'Active in shelters',
      icon: Users,
      color: 'var(--color-accent-orange)'
    },
    {
      label: 'Accessible Fleet Units',
      value: accessibilityData.accessibleTransport.count,
      note: 'Wheelchair lift equipped',
      icon: Truck,
      color: 'var(--color-accent-green)'
    },
  ]

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Accessibility size={20} style={{ color: 'var(--color-accent-green)' }} />
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{t('nav.accessibility')}</h1>
          </div>
          {backendOnline && (
            <span style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent-green)',
              background: 'var(--color-accent-green-dim)',
              border: '1px solid var(--color-accent-green-border)',
              padding: '3px 8px',
              borderRadius: 6,
              fontWeight: 700,
            }}>
              FASTAPI LIVE SYNC ({safeLocations.length} LOCATIONS)
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Inclusive logistics — ensuring evacuation routes, relief camps, and ambulances are accessible for elderly and disabled individuals
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card"
            style={{ padding: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${stat.color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{stat.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8, padding: '4px 8px', borderRadius: 6, background: 'var(--color-bg-elevated)', display: 'inline-block' }}>
              {stat.note}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Registered Accessible Shelters from Backend */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Registered Accessible Shelters & Medical Hubs</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Equipped with zero-step wheelchair ramps, oxygen banks, and sign-language medical triage
            </p>
          </div>
          <span style={{
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: 6,
            background: 'var(--color-accent-green-dim)',
            color: 'var(--color-accent-green)',
            fontWeight: 700,
          }}>
            {accessibleLocations.length || 7} Accessible Facilities
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
          {(accessibleLocations.length > 0 ? accessibleLocations : [
            { id: '1', name: 'Guwahati Medical College Hospital (GMCH)', location_type: 'HOSPITAL', capacity: 2500, current_occupancy: 1820, is_accessible: true, contact: '0361-2529457', address: 'Bhangagarh, Guwahati' },
            { id: '2', name: 'Sarusajai Stadium Evacuation Hub', location_type: 'RELIEF_CAMP', capacity: 3500, current_occupancy: 950, is_accessible: true, contact: '0361-2245001', address: 'Lokhra Rd, Guwahati' },
            { id: '3', name: 'Silchar Civil Hospital Shelter', location_type: 'HOSPITAL', capacity: 1200, current_occupancy: 680, is_accessible: true, contact: '03842-245366', address: 'Hospital Rd, Silchar' },
            { id: '4', name: 'Imphal RIMS Evacuation Center', location_type: 'HOSPITAL', capacity: 1800, current_occupancy: 420, is_accessible: true, contact: '0385-2414625', address: 'Lamphelpat, Imphal' },
          ]).map((shelter) => {
            const occupancyPct = Math.min(100, Math.round(((shelter.current_occupancy || 0) / (shelter.capacity || 1)) * 100))
            return (
              <div
                key={shelter.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{shelter.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={11} color="var(--color-accent-green)" /> {shelter.address || 'Northeast Regional Hub'}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--color-accent-green-dim)',
                    color: 'var(--color-accent-green)',
                    border: '1px solid var(--color-accent-green-border)',
                  }}>
                    ♿ ACCESSIBLE
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  <span>Capacity: <strong>{shelter.capacity?.toLocaleString()} beds</strong></span>
                  <span>Occupied: <strong>{shelter.current_occupancy?.toLocaleString()} ({occupancyPct}%)</strong></span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 5, borderRadius: 3, background: 'var(--color-bg-surface)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${occupancyPct}%`,
                      height: '100%',
                      borderRadius: 3,
                      background: occupancyPct > 80 ? 'var(--color-accent-orange)' : 'var(--color-accent-green)',
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>

                {shelter.contact && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={10} /> Emergency Desk: <strong>{shelter.contact}</strong>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Features checklist */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Accessibility Protocol Verification</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {accessibilityData.features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 8,
                background: feature.active ? 'var(--color-accent-green-dim)' : 'var(--color-accent-red-dim)',
                border: `1px solid ${feature.active ? 'var(--color-accent-green-border)' : 'var(--color-accent-red-border)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                {feature.active
                  ? <CheckCircle size={16} style={{ color: 'var(--color-accent-green)' }} />
                  : <XCircle size={16} style={{ color: 'var(--color-accent-red)' }} />
                }
                <span style={{ fontWeight: 500 }}>{feature.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: feature.active ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                {feature.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
