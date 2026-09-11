import { useState } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, MapPin, Clock, Filter, Check, Radio, Send } from 'lucide-react'
import { alerts as mockAlerts, type RiskLevel } from '../data/mockData'
import { useLanguage } from '../context/LanguageContext'
import { useBackend } from '../context/BackendContext'

const severityIcons: Record<RiskLevel, { color: string; bgClass: string }> = {
  CRITICAL: { color: 'var(--color-accent-red)', bgClass: 'risk-critical' },
  HIGH: { color: 'var(--color-accent-orange)', bgClass: 'risk-high' },
  MODERATE: { color: 'var(--color-accent-yellow)', bgClass: 'risk-moderate' },
  LOW: { color: 'var(--color-accent-green)', bgClass: 'risk-low' },
}

export default function AlertsPage() {
  const { t } = useLanguage()
  const { recentAlerts, acknowledgeAlert, refresh } = useBackend()
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL')
  const [generating, setGenerating] = useState(false)

  const liveAlerts = recentAlerts.length > 0
    ? recentAlerts.map(a => ({
        id: a.id,
        severity: (['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].includes(a.risk_level)
          ? a.risk_level
          : (a.risk_level === 'MEDIUM' ? 'MODERATE' : 'HIGH')) as RiskLevel,
        title: a.title,
        location: a.location_name || 'Northeast Corridor',
        timeAgo: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
        isNew: a.status === 'ACTIVE',
        status: a.status,
        message: a.message,
      }))
    : mockAlerts

  const filtered = filter === 'ALL' ? liveAlerts : liveAlerts.filter(a => a.severity === filter)

  const handleGenerateAlert = async () => {
    try {
      setGenerating(true)
      const { api } = await import('../services/api')
      // Generate alerts for Guwahati flood risk coordinates
      await api.generateAlerts(26.185, 91.745)
      await refresh()
    } catch (err) {
      console.error('Failed to trigger alert generation', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>{t('nav.alerts')}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Real-time disaster alerts across Northeast India · SQLite & MongoDB Atlas synced
          </p>
        </div>

        {/* Generate test alert button */}
        <button
          onClick={handleGenerateAlert}
          disabled={generating}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            background: 'var(--color-accent-red-dim)',
            border: '1px solid var(--color-accent-red-border)',
            color: 'var(--color-accent-red)',
            fontSize: 12,
            fontWeight: 700,
            cursor: generating ? 'not-allowed' : 'pointer',
          }}
        >
          <Radio size={14} />
          <span>{generating ? 'Querying Risk...' : 'Simulate GPS Risk Alert (Guwahati)'}</span>
        </button>
      </div>

      {/* Severity filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
        {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.04em',
              background: filter === level ? (level === 'ALL' ? 'var(--color-bg-elevated)' : `${severityIcons[level as RiskLevel]?.color}12`) : 'transparent',
              color: filter === level ? (level === 'ALL' ? 'var(--color-text-primary)' : severityIcons[level as RiskLevel]?.color) : 'var(--color-text-muted)',
              border: `1px solid ${filter === level ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
              cursor: 'pointer',
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((alert, i) => {
          const sev = severityIcons[alert.severity] || severityIcons.HIGH
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card"
              style={{
                padding: '16px 20px',
                borderLeft: `3px solid ${sev.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className={`risk-badge ${sev.bgClass}`}>
                      <AlertTriangle size={10} /> {alert.severity}
                    </span>
                    {alert.isNew && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'var(--color-accent-green-dim)', color: 'var(--color-accent-green)',
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} /> {alert.location}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {alert.timeAgo}
                  </div>
                  {'status' in alert && alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        color: 'var(--color-accent-green)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Acknowledge alert in backend"
                    >
                      <Check size={12} /> Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
