import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  MapPin, AlertTriangle, Truck, Building, Layers, Navigation,
  Shield, Activity, Radio, PhoneCall, CheckCircle2, ChevronRight, Wind, Droplets, Zap
} from 'lucide-react'
import RiskMap, { neHazards, neShelters, neRoutes, type NEHazard } from '../components/dashboard/RiskMap'
import { useLanguage } from '../context/LanguageContext'
import { useBackend } from '../context/BackendContext'

export default function LiveMapPage() {
  const { t } = useLanguage()
  const { activeEvents, safeLocations, backendOnline } = useBackend()

  const dynamicHazards: NEHazard[] = useMemo(() => {
    if (!activeEvents || activeEvents.length === 0) return neHazards

    return activeEvents.map((ev, i) => {
      const fallback = neHazards[i % neHazards.length]
      // Project lat/lon to map SVG viewBox (800x580)
      const x = Math.min(750, Math.max(80, Math.round(((ev.longitude - 88.0) / 8.5) * 650 + 80)))
      const y = Math.min(520, Math.max(120, Math.round(((28.0 - ev.latitude) / 4.2) * 400 + 100)))

      return {
        id: ev.id,
        name: ev.name,
        type: (ev.disaster_type as any) || 'FLOOD',
        severity: (ev.severity === 'CRITICAL' ? 'CRITICAL' : ev.severity === 'HIGH' ? 'HIGH' : 'MODERATE') as any,
        state: ev.name.includes('Guwahati') || ev.name.includes('Assam') || ev.name.includes('Jatinga') ? 'Assam' :
               ev.name.includes('Imphal') ? 'Manipur' :
               ev.name.includes('Shillong') ? 'Meghalaya' :
               ev.name.includes('Sikkim') ? 'Sikkim' : 'Northeast India',
        highway: fallback?.highway || 'Lifeline Corridor',
        x: fallback?.x ?? x,
        y: fallback?.y ?? y,
        lat: ev.latitude || fallback?.lat || 26.2,
        lon: ev.longitude || fallback?.lon || 92.8,
        radiusKm: ev.radius_km || fallback?.radiusKm || 15,
        evacuees: ev.evacuees || fallback?.evacuees || 1200,
        updatedAt: 'Live telemetry',
        description: ev.description || fallback?.description || 'Active Northeast disaster zone.',
        detour: fallback?.detour || 'SmartLogix dynamic reroute active: Divert via monitored bypass corridor.',
      }
    })
  }, [activeEvents])

  const [selectedHazardDetail, setSelectedHazardDetail] = useState<NEHazard | null>(null)
  const currentHazard = selectedHazardDetail || dynamicHazards[0] || neHazards[1]

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1600, margin: '0 auto' }}>
      {/* ── SITUATIONAL AWARENESS TICKER ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '10px 16px',
          background: 'linear-gradient(90deg, rgba(239,68,68,0.12) 0%, rgba(32,168,107,0.08) 100%)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          >
            DISASTER ADVISORY
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {currentHazard.name} · {currentHazard.highway} Blocked · Dynamic Reroute Active
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <span>🛰️ NavIC Live Stream: <strong>100% Signal</strong></span>
          <span>⚡ Backend: <strong style={{ color: backendOnline ? 'var(--color-accent-green)' : 'var(--color-accent-orange)' }}>{backendOnline ? 'FastAPI Live' : 'Cached Fallback'}</strong></span>
        </div>
      </div>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            {t('nav.liveMap')} — Northeast India Command Center
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Full GIS tactical view · Terrain accessibility grading · Multi-agency emergency logistics
          </p>
        </div>

        {/* Quick telemetry badges */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="var(--color-accent-green)" />
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>ACTIVE HAZARDS</div>
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent-green)' }}>
                {dynamicHazards.length} Zones
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio size={14} color="#38BDF8" />
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>FLEET TRACKING</div>
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38BDF8' }}>14 Units</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN COMMAND LAYOUT ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: 16,
          alignItems: 'stretch',
        }}
        className="map-grid"
      >
        {/* Main Map */}
        <div style={{ minHeight: 660, display: 'flex', flexDirection: 'column' }}>
          <RiskMap
            fullHeight={true}
            initialFilter="all"
            customHazards={dynamicHazards}
            onSelectHazard={setSelectedHazardDetail}
          />
        </div>

        {/* Tactical Incident & Rerouting Inspector Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Active Incident Card */}
          <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid var(--color-accent-red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="section-label">FOCUSED INCIDENT</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'var(--color-accent-red-dim)',
                  color: 'var(--color-accent-red-light)',
                  border: '1px solid var(--color-accent-red-border)',
                }}
              >
                {currentHazard.severity}
              </span>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
              {currentHazard.name}
            </h3>
            <div style={{ fontSize: 12, color: 'var(--color-accent-green)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
              {currentHazard.highway} · {currentHazard.state}
            </div>

            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
              {currentHazard.description}
            </p>

            <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>RECOMMENDED DETOUR</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent-green-light)' }}>
                {currentHazard.detour}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
              <span>Evacuees Affected: <strong>{currentHazard.evacuees.toLocaleString()}</strong></span>
              <span>Updated: <strong>{currentHazard.updatedAt}</strong></span>
            </div>
          </div>

          {/* Emergency Ambulance Telemetry Card */}
          <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid var(--color-accent-green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className="section-label">LIVE AMBULANCE TELEMETRY</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-accent-green)' }}>
                ● 48 KM/H
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(32,168,107,0.14)',
                  border: '1px solid var(--color-accent-green-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Truck size={22} color="var(--color-accent-green)" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Ambulance Unit #AMB-NE-08</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Assam Emergency Medical Taskforce</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Destination:</span>
                <span style={{ fontWeight: 600 }}>Silchar Civil Hospital</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>ETA via Safe Detour:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-accent-green)', fontFamily: 'var(--font-mono)' }}>54 min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Max Terrain Incline:</span>
                <span style={{ fontWeight: 600 }}>4.2° (Wheelchair Safe)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Transit Ramp Checkpoint:</span>
                <span style={{ color: 'var(--color-accent-blue)', fontWeight: 600 }}>Halflong Outpost (KM 182)</span>
              </div>
            </div>

            <button
              onClick={() => alert('Emergency dispatch notification transmitted to Silchar Disaster Center and NDRF Assam 1st Battalion.')}
              className="btn-hero-primary"
              style={{ width: '100%', padding: '9px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: 'pointer' }}
            >
              Dispatch Priority Escort
            </button>
          </div>

          {/* Quick List of All Incidents */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className="section-label">ALL REGIONAL INCIDENTS ({dynamicHazards.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dynamicHazards.map(h => (
                <div
                  key={h.id}
                  onClick={() => setSelectedHazardDetail(h)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 7,
                    background: currentHazard.id === h.id ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
                    border: `1px solid ${currentHazard.id === h.id ? 'var(--color-accent-green-border)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{h.highway} · {h.state}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: 3,
                      background: h.severity === 'CRITICAL' ? 'var(--color-accent-red-dim)' : 'var(--color-accent-orange-dim)',
                      color: h.severity === 'CRITICAL' ? 'var(--color-accent-red-light)' : 'var(--color-accent-orange-light)',
                    }}
                  >
                    {h.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
