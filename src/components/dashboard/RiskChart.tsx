import { motion } from 'motion/react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { weatherTrend } from '../../data/mockData'
import { TrendingUp } from 'lucide-react'

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-strong)',
        borderRadius: 9,
        padding: '10px 14px',
        boxShadow: 'var(--shadow-elevated)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{entry.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {entry.value}{entry.name === 'Risk Score' ? '' : entry.name === 'Rainfall' ? ' mm' : entry.name === 'Wind' ? ' km/h' : '°C'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RiskChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 26 }}
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      role="region"
      aria-label="Risk and Weather Trends Chart"
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 20px 10px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Risk &amp; Weather Trends
            </h3>
            <TrendingUp size={14} color="var(--color-accent-orange)" />
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Last 9 hours · Assam / Brahmaputra Valley
          </p>
        </div>
        {/* Current risk score */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--color-accent-orange)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
            }}
          >
            {weatherTrend[weatherTrend.length - 1].riskScore}
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>RISK SCORE</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '16px 8px 8px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weatherTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWind" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: '#525869', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#525869', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#8B92A8', paddingTop: 8 }}
              iconSize={8}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="riskScore"
              name="Risk Score"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#gradRisk)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="rainfall"
              name="Rainfall"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#gradRain)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="windSpeed"
              name="Wind"
              stroke="#F97316"
              strokeWidth={1.5}
              fill="url(#gradWind)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              strokeDasharray="5 3"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Current readings */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          background: 'var(--color-border)',
          borderTop: '1px solid var(--color-border)',
          marginTop: 'auto',
          flexShrink: 0,
        }}
      >
        {[
          { label: 'Rainfall', value: `${weatherTrend[weatherTrend.length - 1].rainfall} mm/h`, color: 'var(--color-accent-blue)' },
          { label: 'Wind Speed', value: `${weatherTrend[weatherTrend.length - 1].windSpeed} km/h`, color: 'var(--color-accent-orange)' },
          { label: 'Temperature', value: `${weatherTrend[weatherTrend.length - 1].temperature}°C`, color: 'var(--color-accent-green)' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: 'var(--color-bg-elevated)',
              padding: '12px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Telemetry Status Footer */}
      <div
        style={{
          padding: '8px 18px',
          background: 'var(--color-bg-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--color-text-muted)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--color-accent-green)',
              display: 'inline-block',
            }}
          />
          <span>Doppler AWS Stream · Kamrup &amp; Lower Assam Basin</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          LIVE TELEMETRY
        </span>
      </div>
    </motion.div>
  )
}
