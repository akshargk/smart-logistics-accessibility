import { useState } from 'react'
import { motion } from 'motion/react'
import { Route, MapPin, Clock, ArrowRight, Shield, AlertTriangle, Cpu, Navigation, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react'
import { routes } from '../data/mockData'
import { useLanguage } from '../context/LanguageContext'
import { useBackend } from '../context/BackendContext'
import { SafeRouteResponse } from '../services/api'
import RiskMap from '../components/dashboard/RiskMap'

const statusColors = {
  SAFE: { bg: 'var(--color-accent-green-dim)', color: 'var(--color-accent-green)', border: 'var(--color-accent-green-border)' },
  CAUTION: { bg: 'var(--color-accent-orange-dim)', color: 'var(--color-accent-orange)', border: 'var(--color-accent-orange-border)' },
  BLOCKED: { bg: 'var(--color-accent-red-dim)', color: 'var(--color-accent-red)', border: 'var(--color-accent-red-border)' },
}

const PRESET_LOCATIONS = [
  { label: 'Guwahati Riverfront (Brahmaputra Zone)', lat: 26.182, lon: 91.742 },
  { label: 'Jatinga Ridge, Dima Hasao (NH-6 Landslide)', lat: 25.105, lon: 92.981 },
  { label: 'Imphal Valley (Manipur Lowland)', lat: 24.817, lon: 93.936 },
  { label: 'Tezpur North Bank (Sonitpur)', lat: 26.633, lon: 92.792 },
]

export default function RoutesPage() {
  const { t } = useLanguage()
  const { calculateRoute, safeRoute: contextSafeRoute, backendOnline } = useBackend()

  const [selectedPreset, setSelectedPreset] = useState<number>(0)
  const [preferAccessible, setPreferAccessible] = useState<boolean>(true)
  const [calculating, setCalculating] = useState<boolean>(false)
  const [routeResult, setRouteResult] = useState<SafeRouteResponse | null>(contextSafeRoute)

  const handleCalculate = async () => {
    setCalculating(true)
    try {
      const origin = PRESET_LOCATIONS[selectedPreset]
      const res = await calculateRoute(origin.lat, origin.lon, preferAccessible)
      if (res) {
        setRouteResult(res)
      }
    } finally {
      setCalculating(false)
    }
  }

  const stats = {
    safe: routes.filter(r => r.status === 'SAFE').length,
    caution: routes.filter(r => r.status === 'CAUTION').length,
    blocked: routes.filter(r => r.status === 'BLOCKED').length,
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{t('nav.routes')}</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              ML-evaluated evacuation corridors, multi-candidate path selection & terrain gradient analysis
            </p>
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
              RANDOM FOREST ML ENGINE READY
            </span>
          )}
        </div>
      </div>

      {/* AI SAFE ROUTE EVALUATOR CARD */}
      <div className="card" style={{ padding: 24, marginBottom: 24, borderLeft: '4px solid var(--color-accent-green)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="var(--color-accent-green)" />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Evacuation Route Optimizer (FastAPI + OSRM + Scikit-Learn)</h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                Computes collision-free evacuation paths around active Northeast flood and landslide zones.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, alignItems: 'end', marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              Incident / Evacuation Origin
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: 13,
              }}
            >
              {PRESET_LOCATIONS.map((loc, idx) => (
                <option key={loc.label} value={idx}>
                  {loc.label} ({loc.lat.toFixed(3)}, {loc.lon.toFixed(3)})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferAccessible}
                onChange={(e) => setPreferAccessible(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--color-accent-green)' }}
              />
              <span>♿ Prioritize Wheelchair & Low-Grade Detour</span>
            </label>
          </div>

          <div>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="btn-hero-primary"
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: calculating ? 'not-allowed' : 'pointer',
              }}
            >
              {calculating ? <RefreshCw size={14} className="animate-spin" /> : <Cpu size={14} />}
              {calculating ? 'Analyzing ML Risk...' : 'Calculate Safe Evacuation Route'}
            </button>
          </div>
        </div>

        {/* Dynamic Route Results */}
        {routeResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 16,
              borderRadius: 10,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div>
                <span className="section-label" style={{ marginBottom: 4 }}>RECOMMENDED SAFE SHELTER ROUTE</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Destination: {routeResult.destination_name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Type: {routeResult.destination_type} · Selection: {routeResult.selection_reason || 'Minimal flood exposure with low gradient clearance'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'var(--color-accent-green-dim)',
                  color: 'var(--color-accent-green)',
                  border: '1px solid var(--color-accent-green-border)',
                  fontSize: 11,
                  fontWeight: 800,
                }}>
                  STATUS: {routeResult.status}
                </span>
                {routeResult.ml_risk_score !== undefined && (
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: 'var(--color-accent-blue-dim)',
                    color: 'var(--color-accent-blue)',
                    border: '1px solid var(--color-accent-blue-border)',
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    ML RISK: {routeResult.ml_risk_score.toFixed(1)}/100
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
              <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>DISTANCE</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                  {routeResult.distance_km} km
                </div>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>ESTIMATED TIME</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent-green)' }}>
                  {routeResult.estimated_minutes} min
                </div>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>HAZARDS AVOIDED</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent-blue)' }}>
                  {routeResult.hazards_avoided} active zones
                </div>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>ACCESSIBILITY</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: routeResult.is_accessible ? 'var(--color-accent-green)' : 'var(--color-text-muted)' }}>
                  {routeResult.is_accessible ? '♿ Certified Safe' : 'Standard'}
                </div>
              </div>
            </div>

            {/* Candidate Alternatives */}
            {routeResult.candidate_routes && routeResult.candidate_routes.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  CANDIDATE ROUTE EVALUATION MATRIX ({routeResult.candidate_routes.length} PATHS ANALYZED)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {routeResult.candidate_routes.map((cand, idx) => (
                    <div
                      key={cand.route_id || idx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: cand.is_recommended ? 'rgba(32,168,107,0.1)' : 'var(--color-bg-surface)',
                        border: `1px solid ${cand.is_recommended ? 'var(--color-accent-green-border)' : 'var(--color-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {cand.is_recommended ? (
                          <CheckCircle2 size={14} color="var(--color-accent-green)" />
                        ) : (
                          <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--color-text-muted)', display: 'inline-block' }} />
                        )}
                        <strong>{cand.destination_name}</strong>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>via {cand.distance_km} km ({cand.estimated_minutes}m)</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          Risk: {cand.ml_risk_score.toFixed(1)}/100
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: cand.status === 'SAFE' ? 'var(--color-accent-green-dim)' : 'var(--color-accent-orange-dim)',
                          color: cand.status === 'SAFE' ? 'var(--color-accent-green)' : 'var(--color-accent-orange)',
                        }}>
                          {cand.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* GIS LIVE ROAD MAP VISUALIZER */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
              Physical Road Network &amp; Evacuation GIS
            </h3>
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            OSRM Street Geometry · Real Highway Intersections
          </span>
        </div>
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--color-border)', minHeight: 480 }}>
          <RiskMap
            fullHeight={false}
            initialFilter="routes"
            activeRoute={routeResult || contextSafeRoute}
            userLocation={PRESET_LOCATIONS[selectedPreset]}
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Safe Corridors', count: stats.safe, icon: Shield, ...statusColors.SAFE },
          { label: 'Caution Required', count: stats.caution, icon: AlertTriangle, ...statusColors.CAUTION },
          { label: 'Blocked Lifelines', count: stats.blocked, icon: Route, ...statusColors.BLOCKED },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card"
            style={{ padding: 16, borderLeft: `3px solid ${stat.color}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{stat.count}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monitored Lifeline Route list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '8px 0' }}>Monitored Northeast Highway Corridors</h3>
        {routes.map((route, i) => {
          const sc = statusColors[route.status]
          return (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card"
              style={{ padding: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <MapPin size={12} style={{ color: 'var(--color-accent-green)' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{route.from}</span>
                    <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{route.to}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {route.eta > 0 && <span>ETA: {route.eta} min</span>}
                    {route.distance > 0 && <span>{route.distance} km</span>}
                    {route.blockedRoadsAvoided > 0 && <span>{route.blockedRoadsAvoided} blocked roads avoided</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                    letterSpacing: '0.03em',
                  }}>
                    {route.status}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} /> {route.lastUpdated}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
