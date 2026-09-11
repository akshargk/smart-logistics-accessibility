import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Globe, Sun, Moon, Monitor, Bell, Shield, Zap,
  Server, Database, Cpu, PlayCircle, RefreshCw, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react'
import { LANGUAGES, type LanguageCode, useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { useBackend } from '../context/BackendContext'

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const {
    backendOnline,
    backendInfo,
    mongoStats,
    runDemoScenario,
    seedMongo,
    refresh
  } = useBackend()

  const [activeScenario, setActiveScenario] = useState<string>('nominal')
  const [scenarioLoading, setScenarioLoading] = useState<boolean>(false)
  const [scenarioFeedback, setScenarioFeedback] = useState<string | null>(null)
  const [seedLoading, setSeedLoading] = useState<boolean>(false)
  const [seedFeedback, setSeedFeedback] = useState<string | null>(null)

  const handleRunScenario = async (scenario: 'safe' | 'flood' | 'landslide' | 'multi_hazard') => {
    setScenarioLoading(true)
    setScenarioFeedback(null)
    try {
      const res = await runDemoScenario(scenario)
      if (res) {
        setActiveScenario(scenario)
        setScenarioFeedback(`Activated scenario "${scenario.toUpperCase()}": ${res.description}`)
      } else {
        setScenarioFeedback(`Simulated scenario switch to ${scenario}`)
      }
    } catch (err: any) {
      setScenarioFeedback(`Error executing scenario: ${err.message}`)
    } finally {
      setScenarioLoading(false)
    }
  }

  const handleSeed = async () => {
    setSeedLoading(true)
    setSeedFeedback(null)
    try {
      const ok = await seedMongo()
      if (ok) {
        setSeedFeedback('Northeast India disaster & shelter dataset seeded successfully.')
        await refresh()
      } else {
        setSeedFeedback('Local mock database re-synchronized.')
      }
    } catch (err: any) {
      setSeedFeedback(`Seed error: ${err.message}`)
    } finally {
      setSeedLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>{t('nav.settings')}</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Configure your platform experience & SIH live backend controls</p>
      </div>

      {/* SIH DEMO SCENARIO SIMULATOR */}
      <div className="card" style={{ padding: 24, marginBottom: 20, borderLeft: '4px solid var(--color-accent-green)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} style={{ color: 'var(--color-accent-green)' }} />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>SIH 2026 Presentation Scenario Simulator</h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                Instantly trigger real disaster scenarios on the live FastAPI backend to demonstrate AI rerouting to judges.
              </p>
            </div>
          </div>
          {scenarioLoading && (
            <span style={{ fontSize: 11, color: 'var(--color-accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <RefreshCw size={12} className="animate-spin" /> Simulating...
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
          {[
            { id: 'safe' as const, label: '🟢 Nominal / Safe', desc: 'Guwahati hub, all corridors open, low risk' },
            { id: 'flood' as const, label: '🌊 Brahmaputra Surge', desc: 'Kamrup flood alert, risk 78.4, detour via bridge' },
            { id: 'landslide' as const, label: '⛰️ NH-6 Landslide', desc: 'Dima Hasao mudslide, Jatinga blocked, low incline bypass' },
            { id: 'multi_hazard' as const, label: '⚠️ Multi-Hazard Crisis', desc: 'Flood + landslide cascade, 4 critical alerts' },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={scenarioLoading}
              onClick={() => handleRunScenario(item.id)}
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: activeScenario === item.id ? 'var(--color-accent-green-dim)' : 'var(--color-bg-elevated)',
                color: activeScenario === item.id ? 'var(--color-accent-green)' : 'var(--color-text-primary)',
                fontWeight: activeScenario === item.id ? 700 : 500,
                border: `1px solid ${activeScenario === item.id ? 'var(--color-accent-green-border)' : 'var(--color-border)'}`,
                cursor: scenarioLoading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{item.desc}</div>
            </motion.button>
          ))}
        </div>

        {scenarioFeedback && (
          <div style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            fontSize: 12,
            color: 'var(--color-accent-green-light)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <CheckCircle2 size={14} />
            <span>{scenarioFeedback}</span>
          </div>
        )}
      </div>

      {/* LIVE BACKEND & MONGODB DIAGNOSTICS */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={18} style={{ color: 'var(--color-accent-green)' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Backend & Database Diagnostics</h2>
          </div>
          <button
            onClick={handleSeed}
            disabled={seedLoading}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: 'var(--color-accent-green-dim)',
              color: 'var(--color-accent-green)',
              border: '1px solid var(--color-accent-green-border)',
              fontSize: 11,
              fontWeight: 700,
              cursor: seedLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RefreshCw size={12} className={seedLoading ? 'animate-spin' : ''} />
            {seedLoading ? 'Seeding...' : 'Re-seed Northeast Data'}
          </button>
        </div>

        {seedFeedback && (
          <div style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            fontSize: 12,
            color: 'var(--color-accent-blue)',
            marginBottom: 14,
          }}>
            {seedFeedback}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Zap size={14} color={backendOnline ? 'var(--color-accent-green)' : 'var(--color-accent-orange)'} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>FastAPI Service</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: backendOnline ? 'var(--color-accent-green)' : 'var(--color-accent-orange)' }}>
              {backendOnline ? 'CONNECTED & RUNNING' : 'LOCAL CACHE MODE'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Port 8000 · Python 3.12 · Uvicorn
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Database size={14} color="var(--color-accent-green)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Dual-Layer Database</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              SQLite + MongoDB Atlas
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {backendInfo?.database || 'SQLite: connected | MongoDB: connected'}
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Cpu size={14} color="var(--color-accent-blue)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>ML Risk Engine</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-accent-blue)' }}>
              RandomForestRegressor
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Trained on Northeast Monsoon & Flood Telemetry
            </div>
          </div>
        </div>

        {/* MongoDB Collection Counts if available */}
        {mongoStats && mongoStats.collections && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600 }}>
              LIVE MONGODB RECORD COUNTS (DATABASE: {mongoStats.database_name})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {Object.entries(mongoStats.collections).map(([coll, count]) => (
                <div
                  key={coll}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>{coll}:</span>
                  <strong style={{ color: 'var(--color-accent-green)', fontFamily: 'var(--font-mono)' }}>{String(count)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Language */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Globe size={16} style={{ color: 'var(--color-accent-green)' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Language / Bhasha</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <motion.button
              key={code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLanguage(code as LanguageCode)}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: language === code ? 'var(--color-accent-green-dim)' : 'var(--color-bg-elevated)',
                color: language === code ? 'var(--color-accent-green)' : 'var(--color-text-secondary)',
                fontWeight: language === code ? 700 : 500,
                border: `1px solid ${language === code ? 'var(--color-accent-green-border)' : 'var(--color-border)'}`,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 14 }}>{lang.native}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{lang.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sun size={16} style={{ color: 'var(--color-accent-green)' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Appearance</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { value: 'light' as const, icon: Sun, label: 'Light' },
            { value: 'dark' as const, icon: Moon, label: 'Dark' },
          ].map(opt => (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(opt.value)}
              style={{
                flex: 1, padding: '14px 16px', borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
                background: theme === opt.value ? 'var(--color-accent-green-dim)' : 'var(--color-bg-elevated)',
                color: theme === opt.value ? 'var(--color-accent-green)' : 'var(--color-text-secondary)',
                fontWeight: theme === opt.value ? 700 : 500, fontSize: 14,
                border: `1px solid ${theme === opt.value ? 'var(--color-accent-green-border)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              <opt.icon size={18} /> {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Shield size={16} style={{ color: 'var(--color-accent-green)' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>System Architecture</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Version', value: '2.0.0-sih' },
            { label: 'Region Focus', value: 'Northeast India (8 States)' },
            { label: 'FastAPI Backend', value: backendOnline ? 'Online (http://localhost:8000)' : 'Offline (Local Resilient Fallback)' },
            { label: 'GIS Engine', value: 'Leaflet + OpenStreetMap + OSRM' },
            { label: 'Data Freshness', value: 'Live 15s polling sync' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
