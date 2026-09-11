import { motion } from 'motion/react'
import { Navigation, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Clock, Ruler, Accessibility, ExternalLink } from 'lucide-react'
import { SafeRouteResult, CandidateRoute } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

interface VisualRouteIntelligenceProps {
  safeRoute: SafeRouteResult | null
  onViewOnMap?: () => void
}

export default function VisualRouteIntelligence({ safeRoute, onViewOnMap }: VisualRouteIntelligenceProps) {
  const { t } = useLanguage()

  if (!safeRoute) {
    return (
      <div
        style={{
          borderRadius: 12,
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          padding: 24,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          minHeight: 280,
        }}
      >
        <Navigation size={24} color="var(--color-text-muted)" style={{ opacity: 0.5 }} />
        <span style={{ fontSize: 13 }}>No route evaluated yet. Select a location or scenario above to calculate optimal route.</span>
      </div>
    )
  }

  const candidateRoutes = safeRoute.candidate_routes || []
  const recommendedCand = candidateRoutes.find(c => c.is_recommended)

  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
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
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
            }}
          >
            <ShieldCheck size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {t('routeGuidance')}
            </h3>
          </div>
        </div>

        <span
          style={{
            padding: '3px 8px',
            borderRadius: 5,
            fontSize: 10.5,
            fontWeight: 800,
            background: safeRoute.status === 'SAFE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: safeRoute.status === 'SAFE' ? '#10B981' : '#F59E0B',
            border: `1px solid ${safeRoute.status === 'SAFE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          }}
        >
          {safeRoute.status}
        </span>
      </div>

      {/* Body container */}
      <div
        className="waypoint-scrollbar"
        style={{
          padding: '14px 16px',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* RECOMMENDED ROUTE HERO CARD */}
        <div
          style={{
            padding: '14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.18) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.45)',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>🛡</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#10B981', letterSpacing: '0.04em' }}>
                {t('safestReliableRoute')}
              </span>
            </div>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 4,
                background: '#10B981',
                color: '#0A0B0E',
                letterSpacing: '0.06em',
              }}
            >
              {t('recommended')}
            </span>
          </div>

          {/* Principle Tag: FASTEST ROUTE ≠ SAFEST RELIABLE ROUTE */}
          <div
            style={{
              padding: '3px 8px',
              borderRadius: 4,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#FBBF24',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              width: 'fit-content',
            }}
          >
            <span>⚖</span>
            <span>{t('fastestNotSafest')}</span>
          </div>

          {/* Destination */}
          <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {t('destShelter')}: <strong style={{ color: 'var(--color-text-primary)' }}>{safeRoute.destination_name}</strong>
          </div>

          {/* Core Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
              marginTop: 4,
            }}
          >
            <div style={{ padding: '6px 8px', borderRadius: 6, background: 'rgba(10, 11, 14, 0.6)', textAlign: 'center' }}>
              <div style={{ fontSize: 9.5, color: 'var(--color-text-muted)' }}>{t('riskOutput').includes('जोखिम') ? 'जोखिम' : 'RISK'}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                {safeRoute.ml_risk_score !== undefined ? `${safeRoute.ml_risk_score}/100` : 'LOW'}
              </div>
            </div>

            <div style={{ padding: '6px 8px', borderRadius: 6, background: 'rgba(10, 11, 14, 0.6)', textAlign: 'center' }}>
              <div style={{ fontSize: 9.5, color: 'var(--color-text-muted)' }}>{t('distance')}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>
                {safeRoute.distance_km} km
              </div>
            </div>

            <div style={{ padding: '6px 8px', borderRadius: 6, background: 'rgba(10, 11, 14, 0.6)', textAlign: 'center' }}>
              <div style={{ fontSize: 9.5, color: 'var(--color-text-muted)' }}>{t('eta')}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#FCD34D', fontFamily: 'var(--font-mono)' }}>
                ~{safeRoute.estimated_minutes}m
              </div>
            </div>

            <div style={{ padding: '6px 8px', borderRadius: 6, background: 'rgba(10, 11, 14, 0.6)', textAlign: 'center' }}>
              <div style={{ fontSize: 9.5, color: 'var(--color-text-muted)' }}>A11Y</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#F472B6' }}>
                {safeRoute.is_accessible ? '♿ Suitable' : 'Standard'}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic selection reason */}
        {safeRoute.selection_reason && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              fontSize: 11,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4,
            }}
          >
            <strong style={{ color: '#60A5FA' }}>Adaptive ML Rationale: </strong>
            {safeRoute.selection_reason}
          </div>
        )}

        {/* CANDIDATE CORRIDORS COMPARISON */}
        {candidateRoutes.length > 0 && (
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('candidateRoutesTitle')} ({candidateRoutes.length})</span>
              <span style={{ color: '#60A5FA', textTransform: 'none', fontWeight: 600 }}>OSRM + ML Evaluated</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {candidateRoutes.map((cand, idx) => {
                const isRec = cand.is_recommended
                const isHazard = cand.status === 'BLOCKED' || cand.status === 'HAZARD_PRONE'
                const badgeColor = isRec ? '#10B981' : isHazard ? '#EF4444' : '#F59E0B'
                const badgeBg = isRec ? 'rgba(16, 185, 129, 0.15)' : isHazard ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'
                const routeLetter = String.fromCharCode(65 + idx) // ROUTE A, ROUTE B, ROUTE C

                return (
                  <div
                    key={cand.route_id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: isRec ? 'rgba(16, 185, 129, 0.06)' : 'var(--color-bg-elevated)',
                      border: `1px solid ${isRec ? 'rgba(16, 185, 129, 0.4)' : 'var(--color-border)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          ROUTE {routeLetter}: {cand.name}
                        </span>
                        {isRec && (
                          <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: '#10B981', color: '#000' }}>
                            SAFEST
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: badgeBg,
                          color: badgeColor,
                        }}
                      >
                        {cand.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: 10.5, color: 'var(--color-text-muted)' }}>
                      <span>📏 {cand.distance_km} km</span>
                      <span>⏱️ ~{cand.estimated_minutes}m</span>
                      <span style={{ color: badgeColor, fontWeight: 700 }}>
                        Risk: {cand.ml_risk_score}/100
                      </span>
                      {cand.is_accessible && (
                        <span style={{ color: '#F472B6' }}>♿ Accessible</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer view on map button */}
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--color-text-muted)',
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
          <span>OSRM Physical Road Engine</span>
        </span>
        <button
          onClick={() => {
            if (onViewOnMap) {
              onViewOnMap()
            } else {
              const mapEl = document.querySelector('.leaflet-container')
              if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#60A5FA',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {t('viewOnMap')}
        </button>
      </div>
    </div>
  )
}
