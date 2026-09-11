import { motion } from 'motion/react'
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, AlertOctagon, MapPin, Wind, Droplets } from 'lucide-react'
import { RiskAnalysisResult } from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

interface VisualRiskSummaryProps {
  riskResult: RiskAnalysisResult | null
}

export default function VisualRiskSummary({ riskResult }: VisualRiskSummaryProps) {
  const { t } = useLanguage()

  if (!riskResult) return null

  const getSeverityStyle = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return {
          color: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          barBg: '#EF4444',
          icon: AlertOctagon,
        }
      case 'HIGH':
        return {
          color: '#F87171',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          barBg: '#EF4444',
          icon: AlertTriangle,
        }
      case 'MEDIUM':
      case 'MODERATE':
        return {
          color: '#F97316',
          bg: 'rgba(249, 115, 22, 0.12)',
          border: 'rgba(249, 115, 22, 0.3)',
          barBg: '#F97316',
          icon: AlertTriangle,
        }
      default:
        return {
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          barBg: '#10B981',
          icon: CheckCircle2,
        }
    }
  }

  const sev = getSeverityStyle(riskResult.risk_level)
  const Icon = sev.icon
  const score = riskResult.risk_score || 0

  // Derive maximum factor contribution to scale bar percentages
  const maxFactorVal = Math.max(
    ...riskResult.factors.map(f => f.contribution),
    30
  )

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
              background: sev.bg,
              border: `1px solid ${sev.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: sev.color,
            }}
          >
            <Icon size={15} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {t('riskOutput')}
          </h3>
        </div>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 800,
            background: sev.bg,
            color: sev.color,
            border: `1px solid ${sev.border}`,
            letterSpacing: '0.04em',
          }}
        >
          {riskResult.risk_level} {t('riskOutput').includes('जोखिम') ? 'जोखिम' : t('riskOutput').includes('বিপদ') ? 'বিপদ' : 'RISK'}
        </span>
      </div>

      {/* Main visual body */}
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
        {/* Visual score display with progress meter */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: 'var(--color-bg-elevated)',
            border: `1px solid ${sev.border}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>
              {t('calculatedRiskScore')}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: sev.color,
                  lineHeight: 1,
                }}
              >
                {score.toFixed(1)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                / 100
              </span>
            </div>
          </div>

          {/* Segmented risk meter */}
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden', display: 'flex' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(5, score))}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: sev.barBg,
                borderRadius: 4,
              }}
            />
          </div>

          {/* Severity markers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--color-text-muted)', marginTop: 4, fontWeight: 700 }}>
            <span>LOW (0-35)</span>
            <span>MED (36-65)</span>
            <span>HIGH (66-85)</span>
            <span>CRITICAL (86+)</span>
          </div>
        </div>

        {/* Short reasoning banner */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border)',
            fontSize: 11.5,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.4,
          }}
        >
          <strong style={{ color: 'var(--color-text-primary)' }}>{t('riskReasoning')}: </strong>
          {riskResult.reason}
        </div>

        {/* Contributing Factors Visual Bars */}
        {riskResult.factors && riskResult.factors.length > 0 && (
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {t('contributingFactors')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {riskResult.factors.map(f => {
                const pct = Math.min(100, Math.round((f.contribution / maxFactorVal) * 100))
                return (
                  <div
                    key={f.factor}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 7,
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {f.factor}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: sev.color }}>
                        +{f.contribution.toFixed(1)}
                      </span>
                    </div>

                    {/* Visual contribution bar */}
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                        style={{
                          height: '100%',
                          background: sev.barBg,
                          borderRadius: 3,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Nearby Hazard Proximity */}
        {riskResult.nearby_events && riskResult.nearby_events.length > 0 && (
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {t('nearbyHazardProximity')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {riskResult.nearby_events.slice(0, 3).map(ev => (
                <div
                  key={ev.event_id}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={12} color={sev.color} />
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{ev.name}</span>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>
                    {ev.distance_km} km ({ev.zone})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10.5,
          color: 'var(--color-text-muted)',
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span>IMD Doppler / CWC River Basin</span>
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60A5FA' }}>
          LIVE MODEL
        </span>
      </div>
    </div>
  )
}
