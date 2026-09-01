import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Maximize2, Layers, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import { mapMarkers, routes, disasters } from '../../data/mockData'
import type { MapMarker } from '../../data/mockData'
import { LiveIndicator, RiskBadge } from '../ui/Badges'

// ── Map Legend ────────────────────────────────────────────────
export function MapLegend() {
  const items = [
    { color: 'var(--color-accent-red)', label: 'High Risk Zone' },
    { color: 'var(--color-accent-orange)', label: 'Moderate Risk' },
    { color: 'var(--color-accent-green)', label: 'Low / Safe' },
    { color: '#60A5FA', label: 'Safe Route', line: true },
    { color: '#94A3B8', label: 'Blocked Road', line: true, dashed: true },
    { color: 'var(--color-accent-pink)', label: 'Shelter' },
    { color: 'var(--color-accent-blue)', label: 'Vehicle / Unit' },
  ]
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 16px',
        padding: '10px 14px',
        background: 'var(--color-bg-overlay)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}
    >
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.line ? (
            <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden>
              <line
                x1="1" y1="4" x2="21" y2="4"
                stroke={item.color} strokeWidth="2.5"
                strokeDasharray={item.dashed ? '4 3' : undefined}
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: item.color,
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Marker tooltip ────────────────────────────────────────────
interface TooltipProps {
  marker: MapMarker
  onClose: () => void
}

function MarkerTooltip({ marker, onClose }: TooltipProps) {
  const disaster = disasters.find(d => d.coordinates.lat > 0 && marker.type === 'disaster')
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-strong)',
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 160,
        zIndex: 100,
        boxShadow: 'var(--shadow-elevated)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
        {marker.label}
      </div>
      {marker.details && (
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
          {marker.details}
        </div>
      )}
      <RiskBadge risk={marker.risk} size="sm" />
      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 10,
          height: 6,
          background: 'var(--color-bg-elevated)',
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
          borderBottom: '1px solid var(--color-border-strong)',
        }}
      />
    </motion.div>
  )
}

// ── Marker ────────────────────────────────────────────────────
interface MarkerProps {
  marker: MapMarker
  mapW: number
  mapH: number
  index: number
  onSelect: (id: string | null) => void
  isSelected: boolean
}

const markerColorMap = {
  disaster: {
    HIGH: 'var(--color-accent-red)',
    MODERATE: 'var(--color-accent-orange)',
    CRITICAL: '#FCA5A5',
    LOW: 'var(--color-accent-yellow)',
  },
  shelter: 'var(--color-accent-pink)',
  vehicle: 'var(--color-accent-blue)',
  checkpoint: 'var(--color-text-secondary)',
}

function MapMarkerEl({ marker, mapW, mapH, index, onSelect, isSelected }: MarkerProps) {
  const x = (marker.lng / 100) * mapW
  const y = (marker.lat / 100) * mapH

  let color: string
  if (marker.type === 'disaster') {
    color = (markerColorMap.disaster as Record<string, string>)[marker.risk] || 'var(--color-accent-red)'
  } else {
    color = markerColorMap[marker.type] || 'var(--color-text-secondary)'
  }

  const isHighRisk = marker.risk === 'HIGH' || marker.risk === 'CRITICAL'
  const size = isHighRisk ? 12 : 9

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 22 }}
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect(isSelected ? null : marker.id)}
      role="button"
      aria-label={`${marker.label}: ${marker.risk} risk`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(isSelected ? null : marker.id)}
    >
      {/* Pulse ring for HIGH risk */}
      {isHighRisk && (
        <motion.circle
          cx={x}
          cy={y}
          r={size + 4}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.4}
          animate={{ r: [size + 4, size + 10, size + 4], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Outer ring */}
      <motion.circle
        cx={x}
        cy={y}
        r={size + 2}
        fill={`${color}22`}
        stroke={`${color}55`}
        strokeWidth={1}
        whileHover={{ r: size + 5 }}
      />
      {/* Core */}
      <motion.circle
        cx={x}
        cy={y}
        r={size}
        fill={color}
        stroke="var(--color-bg-base)"
        strokeWidth={1.5}
        whileHover={{ r: size + 2 }}
        style={{ filter: isHighRisk ? `drop-shadow(0 0 5px ${color}88)` : undefined }}
      />
      {/* Inner dot */}
      <circle cx={x} cy={y} r={size * 0.35} fill="rgba(255,255,255,0.8)" />
    </motion.g>
  )
}

// ── Flood/Risk Zone overlay ───────────────────────────────────
function RiskZones({ mapW, mapH }: { mapW: number; mapH: number }) {
  const zones = [
    // Kerala coastal flood zone
    { cx: 30.5, cy: 56, rx: 4.5, ry: 5.5, color: 'var(--color-accent-red)', opacity: 0.12 },
    // Wayanad landslide
    { cx: 29, cy: 48.5, rx: 3, ry: 3.5, color: 'var(--color-accent-red)', opacity: 0.1 },
    // Chennai cyclone
    { cx: 52, cy: 42, rx: 5, ry: 4.5, color: 'var(--color-accent-orange)', opacity: 0.1 },
    // Bengaluru
    { cx: 38, cy: 50, rx: 2.5, ry: 2.5, color: 'var(--color-accent-orange)', opacity: 0.1 },
    // Godavari watch
    { cx: 52, cy: 38, rx: 3.5, ry: 3, color: 'var(--color-accent-yellow)', opacity: 0.08 },
  ]
  return (
    <>
      {zones.map((z, i) => (
        <motion.ellipse
          key={i}
          cx={(z.cx / 100) * mapW}
          cy={(z.cy / 100) * mapH}
          rx={(z.rx / 100) * mapW}
          ry={(z.ry / 100) * mapH}
          fill={z.color}
          opacity={z.opacity}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: z.opacity }}
          transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
        />
      ))}
    </>
  )
}

// ── Safe / Blocked route lines ────────────────────────────────
function RouteLine({ route, mapW, mapH, index }: { route: typeof routes[0], mapW: number; mapH: number; index: number }) {
  if (route.waypoints.length < 2) return null
  const pts = route.waypoints.map(w => `${(w.x / 100) * mapW},${(w.y / 100) * mapH}`).join(' ')
  const color = route.status === 'SAFE' ? 'var(--color-accent-blue)' :
    route.status === 'CAUTION' ? 'var(--color-accent-orange)' : 'var(--color-accent-red)'

  return (
    <motion.polyline
      points={pts}
      fill="none"
      stroke={color}
      strokeWidth={route.status === 'SAFE' ? 2.5 : 2}
      strokeDasharray={route.status === 'BLOCKED' ? '5 4' : route.status === 'CAUTION' ? '8 4' : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.85 }}
      transition={{ delay: 0.8 + index * 0.2, duration: 1, ease: 'easeOut' }}
      style={{ filter: route.status === 'SAFE' ? `drop-shadow(0 0 3px ${color}66)` : undefined }}
    />
  )
}

// ── India SVG Map base ────────────────────────────────────────
// Simplified India outline paths for the mock map background
const INDIA_PATH = `
  M 35 15 L 45 12 L 55 14 L 65 18 L 72 22 L 75 28 L 73 35
  L 70 40 L 72 45 L 68 50 L 65 55 L 60 58 L 55 62 L 52 68
  L 48 72 L 44 75 L 42 80 L 40 83 L 38 80 L 36 76 L 32 72
  L 28 68 L 25 62 L 23 55 L 22 48 L 20 42 L 18 36 L 20 28
  L 25 20 L 30 15 Z
`

// ── Main RiskMap Component ────────────────────────────────────
export default function RiskMap() {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [activeLayer, setActiveLayer] = useState<'all' | 'disasters' | 'routes' | 'shelters'>('all')
  const mapW = 700
  const mapH = 520

  const visibleMarkers = mapMarkers.filter(m => {
    if (activeLayer === 'all') return true
    if (activeLayer === 'disasters') return m.type === 'disaster'
    if (activeLayer === 'routes') return m.type === 'vehicle' || m.type === 'checkpoint'
    if (activeLayer === 'shelters') return m.type === 'shelter'
    return true
  })

  const selectedMarkerData = selectedMarker ? mapMarkers.find(m => m.id === selectedMarker) : null

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 480,
      }}
      role="region"
      aria-label="Live Risk Map"
    >
      {/* Map Header */}
      <div
        style={{
          padding: '16px 20px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              LIVE RISK MAP
            </h2>
            <LiveIndicator />
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Real-time disaster risk and accessibility monitoring — Southern India
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Layer filter */}
          <div style={{ display: 'flex', background: 'var(--color-bg-overlay)', borderRadius: 8, padding: 2, gap: 1 }}>
            {(['all', 'disasters', 'routes', 'shelters'] as const).map(layer => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeLayer === layer ? 'var(--color-bg-surface)' : 'transparent',
                  color: activeLayer === layer ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  transition: 'all 150ms ease',
                  letterSpacing: '0.02em',
                }}
                aria-pressed={activeLayer === layer}
              >
                {layer.charAt(0).toUpperCase() + layer.slice(1)}
              </button>
            ))}
          </div>

          {/* Icon buttons */}
          {[{ Icon: Layers, label: 'Toggle layers' }, { Icon: ZoomIn, label: 'Zoom in' }, { Icon: Maximize2, label: 'Fullscreen' }].map(({ Icon, label }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              title={label}
              aria-label={label}
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'var(--color-bg-overlay)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
              }}
            >
              <Icon size={13} />
            </motion.button>
          ))}

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            title="Refresh map data"
            aria-label="Refresh map data"
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: 'var(--color-accent-blue-dim)',
              border: '1px solid var(--color-accent-blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-accent-blue)',
            }}
          >
            <RefreshCw size={13} />
          </motion.button>
        </div>
      </div>

      {/* Map canvas */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: 'linear-gradient(180deg, #0D1117 0%, #111827 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0, opacity: 0.06 }}
          aria-hidden
        >
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#8B92A8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Gradient overlay bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: 'linear-gradient(to top, rgba(10,11,14,0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
          aria-hidden
        />

        {/* SVG map */}
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewBox={`0 0 ${mapW} ${mapH}`}
          width="100%"
          height="100%"
          style={{ display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Map of Southern India showing disaster zones and routes"
        >
          {/* India landmass background */}
          <motion.path
            d={`
              M 280 60 L 360 45 L 430 50 L 490 65 L 540 85
              L 565 105 L 570 130 L 560 155 L 545 175
              L 555 200 L 545 225 L 530 250 L 510 270
              L 490 290 L 470 310 L 450 335 L 430 355
              L 415 375 L 400 395 L 385 415 L 370 435
              L 355 455 L 340 470 L 325 455 L 310 435
              L 295 415 L 280 395 L 265 375 L 250 350
              L 235 325 L 220 298 L 210 270 L 205 242
              L 200 215 L 195 188 L 195 160 L 200 132
              L 210 108 L 225 85 L 245 68 Z
            `}
            fill="#161D2B"
            stroke="rgba(139, 146, 168, 0.15)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* State boundary lines (simplified) */}
          <motion.g
            opacity={0.08}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ delay: 0.5 }}
            stroke="#8B92A8"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="4 4"
          >
            <line x1="250" y1="240" x2="540" y2="240" />
            <line x1="250" y1="310" x2="520" y2="310" />
            <line x1="260" y1="175" x2="555" y2="175" />
            <line x1="365" y1="80" x2="365" y2="460" />
            <line x1="430" y1="80" x2="430" y2="340" />
          </motion.g>

          {/* Ocean texture dots */}
          {[...Array(30)].map((_, i) => (
            <circle
              key={`ocean-${i}`}
              cx={80 + (i % 10) * 60}
              cy={40 + Math.floor(i / 10) * 160}
              r={1}
              fill="rgba(59, 130, 246, 0.08)"
              aria-hidden
            />
          ))}

          {/* Risk zones */}
          <RiskZones mapW={mapW} mapH={mapH} />

          {/* Route lines */}
          {routes.map((route, i) => (
            <RouteLine key={route.id} route={route} mapW={mapW} mapH={mapH} index={i} />
          ))}

          {/* Markers */}
          {visibleMarkers.map((marker, i) => (
            <g key={marker.id} style={{ position: 'relative' }}>
              <MapMarkerEl
                marker={marker}
                mapW={mapW}
                mapH={mapH}
                index={i}
                onSelect={setSelectedMarker}
                isSelected={selectedMarker === marker.id}
              />
            </g>
          ))}

          {/* Location labels */}
          {[
            { x: 28, y: 60, label: 'Kerala' },
            { x: 38, y: 52, label: 'Bengaluru' },
            { x: 50, y: 45, label: 'Chennai' },
            { x: 47, y: 35, label: 'A.P.' },
            { x: 58, y: 28, label: 'Hyderabad' },
          ].map(loc => (
            <motion.text
              key={loc.label}
              x={(loc.x / 100) * mapW}
              y={(loc.y / 100) * mapH - 18}
              textAnchor="middle"
              fill="rgba(139, 146, 168, 0.5)"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
              letterSpacing="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              aria-hidden
            >
              {loc.label}
            </motion.text>
          ))}
        </motion.svg>

        {/* Marker tooltip */}
        {selectedMarkerData && (
          <div
            style={{
              position: 'absolute',
              bottom: 90,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMarkerData.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  minWidth: 200,
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {selectedMarkerData.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {selectedMarkerData.details}
                    </div>
                  </div>
                  <RiskBadge risk={selectedMarkerData.risk} />
                </div>
                <button
                  onClick={() => setSelectedMarker(null)}
                  style={{
                    fontSize: 11,
                    color: 'var(--color-accent-blue)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Dismiss ×
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Map stats overlay */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'rgba(10, 11, 14, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--color-border)',
            borderRadius: 9,
            padding: '8px 12px',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Monitoring
          </div>
          {[
            { label: 'Risk Zones', value: '5', color: 'var(--color-accent-red)' },
            { label: 'Safe Routes', value: '3', color: 'var(--color-accent-green)' },
            { label: 'Shelters', value: '3', color: 'var(--color-accent-pink)' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{stat.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</span>
            </div>
          ))}
        </motion.div>

        {/* Updated timestamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            position: 'absolute',
            bottom: 14,
            right: 14,
            fontSize: 10,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            zIndex: 10,
            background: 'rgba(10,11,14,0.5)',
            padding: '3px 8px',
            borderRadius: 4,
          }}
        >
          Updated 30 sec ago
        </motion.div>
      </div>

      {/* Legend */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
        <MapLegend />
      </div>
    </div>
  )
}
