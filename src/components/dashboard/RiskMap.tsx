import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import L from 'leaflet'
import {
  ZoomIn, ZoomOut, RefreshCw,
  X, Compass, PhoneCall
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useBackend } from '../../context/BackendContext'
import { roadCorridors } from '../../data/roadCorridors'
import { SafeRouteResponse } from '../../services/api'

// ── TYPES ──────────────────────────────────────────────────────
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
export type MarkerLayerType = 'all' | 'disasters' | 'routes' | 'shelters' | 'fleet'

export interface NEHazard {
  id: string
  name: string
  type: 'FLOOD' | 'LANDSLIDE' | 'CYCLONE' | 'EARTHQUAKE'
  severity: RiskLevel
  state: string
  highway: string
  x: number
  y: number
  lat?: number
  lon?: number
  radiusKm?: number
  evacuees: number
  updatedAt: string
  description: string
  detour: string
}

export interface NEShelter {
  id: string
  name: string
  state: string
  capacity: number
  accessible: boolean
  features: string[]
  x: number
  y: number
  lat: number
  lon: number
  contact: string
}

export interface NERoute {
  id: string
  name: string
  highway: string
  from: string
  to: string
  status: 'SAFE' | 'CAUTION' | 'BLOCKED'
  distanceKm: number
  etaMin: number
  inclineGrade: string
  accessible: boolean
  path: string
  detourPath?: string
  blockedPoint?: { x: number; y: number }
  waypoints: [number, number][]
  detourWaypoints?: [number, number][]
  blockedWaypoints?: [number, number][]
}

export interface NEFleetUnit {
  id: string
  callsign: string
  type: 'AMBULANCE' | 'RESCUE_4X4' | 'LOGISTICS_TRUCK'
  location: string
  lat: number
  lon: number
  status: 'ACTIVE' | 'DISPATCHED' | 'STANDBY'
  batteryOrFuel: string
  speed: string
  destination: string
  patientAboard: boolean
}

// ── REALISTIC NORTHEAST GIS DATA ───────────────────────────────
export const neHazards: NEHazard[] = [
  {
    id: 'h1',
    name: 'Brahmaputra Flood Surge',
    type: 'FLOOD',
    severity: 'CRITICAL',
    state: 'Assam',
    highway: 'NH-37 / Majuli Ferry Link',
    x: 520,
    y: 228,
    lat: 26.95,
    lon: 94.20,
    radiusKm: 28,
    evacuees: 12400,
    updatedAt: '2 min ago',
    description: 'Brahmaputra 1.4m above danger mark. Majuli southern embankment breached. NDRF amphibious craft active.',
    detour: 'Use North Bank ferry terminal at Kamalabari or inland bridge route via Jorhat.',
  },
  {
    id: 'h2',
    name: 'NH-6 Landslide — Jatinga Ridge',
    type: 'LANDSLIDE',
    severity: 'HIGH',
    state: 'Assam (Dima Hasao)',
    highway: 'NH-6 (KM 148)',
    x: 388,
    y: 395,
    lat: 25.12,
    lon: 93.03,
    radiusKm: 14,
    evacuees: 2100,
    updatedAt: '8 min ago',
    description: 'Massive mudslide and boulder deposit across both lanes. Clearance crew operating heavy earth-movers.',
    detour: 'SmartLogix Reroute active: Divert via Umrangso - Halflong bypass (+14 min, low gradient 4.2%).',
  },
  {
    id: 'h3',
    name: 'Imphal Valley Flash Inundation',
    type: 'FLOOD',
    severity: 'HIGH',
    state: 'Manipur',
    highway: 'NH-2 / NH-102',
    x: 535,
    y: 425,
    lat: 24.817,
    lon: 93.936,
    radiusKm: 18,
    evacuees: 4200,
    updatedAt: '15 min ago',
    description: 'Imphal river overflow in East District. Low-lying arterial routes submerged 45cm.',
    detour: 'Elevated bypass operational. Emergency transit only via Kangla west corridor.',
  },
  {
    id: 'h4',
    name: 'Kolasib Hill Slip',
    type: 'LANDSLIDE',
    severity: 'MODERATE',
    state: 'Mizoram',
    highway: 'NH-306',
    x: 418,
    y: 458,
    lat: 24.224,
    lon: 92.678,
    radiusKm: 12,
    evacuees: 350,
    updatedAt: '24 min ago',
    description: 'Single lane blocked by loose shale rock. Controlled single-lane shuttle traffic allowed.',
    detour: 'Heavy vehicles halted at Vairengte check gate. Light emergency transit prioritized.',
  },
  {
    id: 'h5',
    name: 'Teesta Gorge Seismic Tremor',
    type: 'EARTHQUAKE',
    severity: 'MODERATE',
    state: 'Sikkim',
    highway: 'NH-10',
    x: 102,
    y: 180,
    lat: 27.177,
    lon: 88.530,
    radiusKm: 16,
    evacuees: 0,
    updatedAt: '38 min ago',
    description: 'Magnitude 3.7 tremor detected near Rangpo. Structural integrity sensors green on all 4 suspension spans.',
    detour: 'Corridor fully open with speed restriction 30 km/h.',
  },
]

export const neShelters: NEShelter[] = [
  { id: 's1', name: 'Guwahati Trauma & Evacuation Hub', state: 'Assam', capacity: 2000, accessible: true, features: ['Wheelchair Ramps', 'Oxygen Concentrators', 'Dedicated Dialysis Unit'], x: 270, y: 295, lat: 26.144, lon: 91.736, contact: '0361-224500' },
  { id: 's2', name: 'Shillong Civil Medical Center', state: 'Meghalaya', capacity: 1200, accessible: true, features: ['Zero-step ramps', 'Braille Signage', 'Accessible Vans'], x: 305, y: 345, lat: 25.578, lon: 91.893, contact: '0364-250100' },
  { id: 's3', name: 'Tezpur Base Relief Camp', state: 'Assam', capacity: 1500, accessible: true, features: ['Low-incline access', 'Emergency Pediatric Unit'], x: 415, y: 255, lat: 26.634, lon: 92.793, contact: '0371-220044' },
  { id: 's4', name: 'Majuli Island Boat Terminal Shelter', state: 'Assam', capacity: 900, accessible: true, features: ['Amphibious Wheelchair Transfer', 'Life-support boats'], x: 520, y: 215, lat: 26.965, lon: 94.215, contact: '0377-274100' },
  { id: 's5', name: 'Halflong Bypass Relief Outpost', state: 'Assam', capacity: 600, accessible: true, features: ['Ramp Access', 'Warm Food & Triage'], x: 365, y: 405, lat: 25.174, lon: 93.018, contact: '0367-281200' },
  { id: 's6', name: 'Silchar Regional Relief Depot', state: 'Assam', capacity: 1800, accessible: true, features: ['Full Accessible Fleet', 'Emergency ICU Beds'], x: 390, y: 425, lat: 24.833, lon: 92.779, contact: '0384-230550' },
  { id: 's7', name: 'Dimapur Logistics Center', state: 'Nagaland', capacity: 1100, accessible: true, features: ['Wheelchair Lifts', 'NDRF Transport Point'], x: 530, y: 325, lat: 25.909, lon: 93.727, contact: '0386-242000' },
  { id: 's8', name: 'Imphal RIMS Evacuation Center', state: 'Manipur', capacity: 1400, accessible: true, features: ['Sign Language Facilitators', 'Accessible Restrooms'], x: 535, y: 410, lat: 24.808, lon: 93.928, contact: '0385-241400' },
]

export const neRoutes: NERoute[] = [
  {
    id: 'r-nh37',
    name: 'Assam Valley Lifeline',
    highway: 'NH-37',
    from: 'Guwahati (GMCH)',
    to: 'Dibrugarh Medical College',
    status: 'CAUTION',
    distanceKm: roadCorridors.nh37?.distanceKm || 445.6,
    etaMin: roadCorridors.nh37?.etaMin || 328,
    inclineGrade: '3.1° (Low River Valley)',
    accessible: true,
    path: 'M 270 295 L 345 290 L 430 270 L 515 240 L 635 200',
    waypoints: roadCorridors.nh37?.points || [
      [26.144, 91.736],
      [26.350, 92.680],
      [26.580, 93.170],
      [26.750, 94.220],
      [27.470, 94.910],
    ],
  },
  {
    id: 'r-nh6',
    name: 'Guwahati - Silchar Spine',
    highway: 'NH-6',
    from: 'Guwahati Hub',
    to: 'Silchar Civil Hospital',
    status: 'SAFE',
    distanceKm: roadCorridors.nh6_detour?.distanceKm || 324.5,
    etaMin: roadCorridors.nh6_detour?.etaMin || 301,
    inclineGrade: '4.2° (Low-grade detour)',
    accessible: true,
    path: 'M 270 295 L 305 345 L 345 365 L 375 380',
    blockedPoint: { x: 388, y: 395 },
    waypoints: roadCorridors.nh6_main?.points || [
      [26.144, 91.736],
      [25.578, 91.893],
      [25.440, 92.200],
    ],
    blockedWaypoints: roadCorridors.nh6_blocked?.points || [
      [25.440, 92.200],
      [25.190, 92.370],
      [25.120, 93.030],
    ],
    detourWaypoints: roadCorridors.nh6_detour?.points || [
      [25.440, 92.200],
      [25.510, 92.780],
      [25.174, 93.018],
      [24.833, 92.779],
    ],
  },
  {
    id: 'r-nh29',
    name: 'Nagaon - Dimapur - Kohima',
    highway: 'NH-29 / NH-2',
    from: 'Nagaon Junction',
    to: 'Kohima District Hospital',
    status: 'SAFE',
    distanceKm: roadCorridors.nh29?.distanceKm || 354.8,
    etaMin: roadCorridors.nh29?.etaMin || 269,
    inclineGrade: '5.4° (Moderate Ridge)',
    accessible: true,
    path: 'M 345 290 L 515 285 L 530 325 L 545 365 L 535 415',
    waypoints: roadCorridors.nh29?.points || [
      [26.350, 92.680],
      [26.520, 93.970],
      [25.909, 93.727],
      [25.670, 94.110],
      [24.820, 93.940],
    ],
  },
  {
    id: 'r-nh306',
    name: 'Barak - Mizoram Corridor',
    highway: 'NH-306',
    from: 'Silchar Depot',
    to: 'Aizawl Emergency Center',
    status: 'CAUTION',
    distanceKm: roadCorridors.nh306?.distanceKm || 176.2,
    etaMin: roadCorridors.nh306?.etaMin || 135,
    inclineGrade: '6.8° (Hill Corridor)',
    accessible: false,
    path: 'M 390 425 L 418 458 L 428 495',
    waypoints: roadCorridors.nh306?.points || [
      [24.833, 92.779],
      [24.510, 92.770],
      [24.224, 92.678],
      [23.730, 92.720],
    ],
  },
  {
    id: 'r-nh13',
    name: 'Trans-Arunachal Lifeline',
    highway: 'NH-13',
    from: 'Tezpur Airbase Depot',
    to: 'Tawang District Hospital',
    status: 'CAUTION',
    distanceKm: roadCorridors.nh13?.distanceKm || 326.0,
    etaMin: roadCorridors.nh13?.etaMin || 262,
    inclineGrade: '7.2° (High Altitude Pass)',
    accessible: true,
    path: 'M 415 255 L 410 180 L 380 140 L 340 110',
    waypoints: roadCorridors.nh13?.points || [
      [26.634, 92.793],
      [27.011, 92.645],
      [27.264, 92.422],
      [27.359, 92.242],
      [27.586, 91.865],
    ],
  },
]


export const neFleetUnits: NEFleetUnit[] = [
  {
    id: 'amb-04',
    callsign: 'Ambulance Unit 04',
    type: 'AMBULANCE',
    location: 'Halflong Umrangso Bypass',
    lat: 25.250,
    lon: 92.950,
    status: 'ACTIVE',
    batteryOrFuel: '84% (Hybrid 4x4)',
    speed: '48 km/h',
    destination: 'Silchar Civil Hospital',
    patientAboard: true,
  },
  {
    id: 'amb-09',
    callsign: 'Ambulance Unit 09',
    type: 'AMBULANCE',
    location: 'NH-37 Kaziranga Corridor',
    lat: 26.580,
    lon: 93.250,
    status: 'DISPATCHED',
    batteryOrFuel: '92% EV',
    speed: '55 km/h',
    destination: 'Tezpur Base Relief Camp',
    patientAboard: false,
  },
  {
    id: 'log-02',
    callsign: 'Logistics Convoy 02',
    type: 'LOGISTICS_TRUCK',
    location: 'Guwahati Dispur Hub',
    lat: 26.144,
    lon: 91.780,
    status: 'STANDBY',
    batteryOrFuel: '96% Diesel',
    speed: '0 km/h (Staging)',
    destination: 'Majuli Island Boat Terminal',
    patientAboard: false,
  },
]

// State focus coordinates
const stateCoordinates: Record<string, { center: [number, number]; zoom: number }> = {
  ALL: { center: [26.1, 92.8], zoom: 7 },
  Assam: { center: [26.2, 92.9], zoom: 7.5 },
  'Arunachal Pradesh': { center: [27.5, 94.2], zoom: 7.5 },
  Meghalaya: { center: [25.5, 91.5], zoom: 8.5 },
  Nagaland: { center: [25.7, 94.1], zoom: 8.5 },
  Manipur: { center: [24.8, 93.9], zoom: 8.5 },
  Mizoram: { center: [23.7, 92.7], zoom: 8.5 },
  Tripura: { center: [23.8, 91.5], zoom: 8.5 },
  Sikkim: { center: [27.4, 88.5], zoom: 9 },
}

// ── MAP LEGEND ────────────────────────────────────────────────
export function MapLegend() {
  const items = [
    { color: 'var(--color-accent-red)', label: 'Critical Hazard (Flood / Landslide)' },
    { color: '#22C55E', label: 'Mapped Road Highway Corridor', line: true },
    { color: '#10B981', label: 'AI Evacuation Route (OSRM Road Engine)', line: true },
    { color: '#0EA5E9', label: 'Alternative ML Candidate Corridor', line: true, dashed: true },
    { color: '#EF4444', label: 'Blocked Highway Pass', line: true, dashed: true },
    { color: 'var(--color-accent-pink)', label: '♿ Accessible Shelter / Hospital' },
    { color: '#38BDF8', label: '🚑 Emergency Ambulance / Convoy' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
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
                boxShadow: item.color === 'var(--color-accent-red)' ? '0 0 8px rgba(239,68,68,0.5)' : undefined,
              }}
            />
          )}
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── PROPS ──────────────────────────────────────────────────────
interface RiskMapProps {
  fullHeight?: boolean
  initialFilter?: MarkerLayerType
  onSelectHazard?: (hazard: NEHazard | null) => void
  className?: string
  customHazards?: NEHazard[]
  userLocation?: { lat: number; lon: number }
  activeRoute?: SafeRouteResponse | null
  externalEvents?: any
  highlightCorridor?: string
  onSelectRoute?: (route: NERoute | null) => void
}

export default function RiskMap({
  fullHeight = false,
  initialFilter = 'all',
  onSelectHazard,
  className = '',
  customHazards,
  userLocation,
  activeRoute,
  externalEvents,
  highlightCorridor,
  onSelectRoute,
}: RiskMapProps) {
  const { t } = useLanguage()
  const { activeEvents, safeLocations, backendOnline, safeRoute: contextSafeRoute } = useBackend()
  const effectiveRoute = activeRoute !== undefined ? activeRoute : contextSafeRoute

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layerGroupsRef = useRef<{
    hazards: L.LayerGroup
    routes: L.LayerGroup
    shelters: L.LayerGroup
    fleet: L.LayerGroup
  }>({
    hazards: L.layerGroup(),
    routes: L.layerGroup(),
    shelters: L.layerGroup(),
    fleet: L.layerGroup(),
  })

  const [activeLayer, setActiveLayer] = useState<MarkerLayerType>(initialFilter)
  const [selectedHazard, setSelectedHazard] = useState<NEHazard | null>(null)
  const [selectedShelter, setSelectedShelter] = useState<NEShelter | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<NERoute | null>(null)
  const [selectedFleet, setSelectedFleet] = useState<NEFleetUnit | null>(null)
  const [selectedState, setSelectedState] = useState<string>('ALL')
  const [mapTheme, setMapTheme] = useState<'tactical' | 'standard'>('tactical')
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Merge backend events or custom hazards
  const mergedHazards: NEHazard[] = useMemo(() => {
    if (customHazards && customHazards.length > 0) return customHazards

    if (activeEvents && activeEvents.length > 0) {
      return activeEvents.map((ev, i) => {
        const fallback = neHazards[i % neHazards.length]
        return {
          id: ev.id,
          name: ev.name,
          type: (['FLOOD', 'LANDSLIDE', 'CYCLONE', 'EARTHQUAKE'].includes(ev.disaster_type) ? ev.disaster_type : 'FLOOD') as any,
          severity: (['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].includes(ev.severity) ? ev.severity : 'HIGH') as RiskLevel,
          state: ev.name.includes('Guwahati') || ev.name.includes('Assam') ? 'Assam' :
                 ev.name.includes('Imphal') ? 'Manipur' :
                 ev.name.includes('Shillong') ? 'Meghalaya' :
                 ev.name.includes('Sikkim') ? 'Sikkim' : fallback.state,
          highway: fallback.highway,
          x: fallback.x,
          y: fallback.y,
          lat: ev.latitude || fallback.lat || 26.2,
          lon: ev.longitude || fallback.lon || 92.8,
          radiusKm: ev.radius_km || fallback.radiusKm || 15,
          evacuees: ev.evacuees || fallback.evacuees,
          updatedAt: 'Live telemetry',
          description: ev.description || fallback.description,
          detour: fallback.detour,
        }
      })
    }

    return neHazards
  }, [customHazards, activeEvents])

  // Merge backend safe locations with shelters
  const mergedShelters: NEShelter[] = useMemo(() => {
    if (safeLocations && safeLocations.length > 0) {
      return safeLocations.map((loc, i) => {
        const fallback = neShelters[i % neShelters.length]
        return {
          id: loc.id,
          name: loc.name,
          state: loc.address?.includes('Meghalaya') ? 'Meghalaya' :
                 loc.address?.includes('Manipur') ? 'Manipur' :
                 loc.address?.includes('Nagaland') ? 'Nagaland' : fallback.state,
          capacity: loc.capacity || fallback.capacity,
          accessible: loc.is_accessible ?? true,
          features: fallback.features,
          x: fallback.x,
          y: fallback.y,
          lat: loc.latitude || fallback.lat,
          lon: loc.longitude || fallback.lon,
          contact: loc.contact || fallback.contact,
        }
      })
    }
    return neShelters
  }, [safeLocations])

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initial = stateCoordinates.ALL
    const map = L.map(mapContainerRef.current, {
      center: initial.center,
      zoom: initial.zoom,
      minZoom: 6,
      maxZoom: 17,
      zoomControl: false,
      attributionControl: false,
    })

    // Real OpenStreetMap Tile Layer
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    })
    osmLayer.addTo(map)

    // Attribution control compact in bottom right
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> | SmartLogix GIS')
      .addTo(map)

    // Register Layer Groups
    layerGroupsRef.current.hazards.addTo(map)
    layerGroupsRef.current.routes.addTo(map)
    layerGroupsRef.current.shelters.addTo(map)
    layerGroupsRef.current.fleet.addTo(map)

    mapInstanceRef.current = map

    // ResizeObserver to automatically call invalidateSize when container resizes
    const ro = new ResizeObserver(() => {
      map.invalidateSize()
    })
    ro.observe(mapContainerRef.current)

    // Immediate and staggered invalidateSize to guarantee tile loading across layouts
    map.invalidateSize()
    const t1 = setTimeout(() => {
      map.invalidateSize()
    }, 120)
    const t2 = setTimeout(() => {
      map.invalidateSize()
    }, 450)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      ro.disconnect()
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // 2. Render Markers and Layers onto Map
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const { hazards: gHazards, routes: gRoutes, shelters: gShelters, fleet: gFleet } = layerGroupsRef.current

    // Clear previous layers
    gHazards.clearLayers()
    gRoutes.clearLayers()
    gShelters.clearLayers()
    gFleet.clearLayers()

    // ── HAZARDS LAYER ─────────────────────────
    if (activeLayer === 'all' || activeLayer === 'disasters') {
      const filteredHazards = mergedHazards.filter(h =>
        selectedState === 'ALL' || h.state.toLowerCase().includes(selectedState.toLowerCase())
      )

      filteredHazards.forEach(hazard => {
        const isCritical = hazard.severity === 'CRITICAL'
        const color = isCritical ? '#EF4444' : '#F97316'
        const lat = hazard.lat ?? 26.2
        const lon = hazard.lon ?? 92.8
        const radiusKm = hazard.radiusKm ?? 15

        // Pulsing Circle Buffer for Hazard Area
        const circle = L.circle([lat, lon], {
          radius: radiusKm * 1000,
          color: color,
          fillColor: color,
          fillOpacity: 0.16,
          weight: 1.5,
          dashArray: isCritical ? '6, 6' : undefined,
        })
        circle.bindTooltip(`<strong>${hazard.name}</strong><br/>${hazard.severity} RISK · ${radiusKm} km radius`, {
          className: 'leaflet-popup-content-wrapper',
          direction: 'top',
        })
        circle.on('click', () => {
          setSelectedHazard(hazard)
          setSelectedShelter(null)
          setSelectedRoute(null)
          setSelectedFleet(null)
          if (onSelectHazard) onSelectHazard(hazard)
        })
        gHazards.addLayer(circle)

        // Custom HTML Pin DivIcon
        const iconHtml = `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div class="${isCritical ? 'marker-pulse-red' : ''}" style="position: absolute; inset: -4px; border-radius: 50%; background: ${isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.25)'};"></div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${color}; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
        `
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-hazard-marker',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        })

        const marker = L.marker([lat, lon], { icon })
        marker.on('click', () => {
          setSelectedHazard(hazard)
          setSelectedShelter(null)
          setSelectedRoute(null)
          setSelectedFleet(null)
          if (onSelectHazard) onSelectHazard(hazard)
        })
        gHazards.addLayer(marker)
      })
    }

    // ── SHELTERS LAYER ────────────────────────
    if (activeLayer === 'all' || activeLayer === 'shelters') {
      const filteredShelters = mergedShelters.filter(s =>
        selectedState === 'ALL' || s.state.toLowerCase().includes(selectedState.toLowerCase())
      )

      filteredShelters.forEach(shelter => {
        const iconHtml = `
          <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="width: 24px; height: 24px; border-radius: 6px; background: #EC4899; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            ${shelter.accessible ? '<span style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%; background: #22C55E; border: 1.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; color: white;">♿</span>' : ''}
          </div>
        `
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-shelter-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })

        const marker = L.marker([shelter.lat, shelter.lon], { icon })
        marker.bindTooltip(`<strong>${shelter.name}</strong><br/>Capacity: ${shelter.capacity} · ${shelter.accessible ? '♿ Fully Accessible' : 'Standard'}`, {
          className: 'leaflet-popup-content-wrapper',
          direction: 'top',
        })
        marker.on('click', () => {
          setSelectedShelter(shelter)
          setSelectedHazard(null)
          setSelectedRoute(null)
          setSelectedFleet(null)
        })
        gShelters.addLayer(marker)
      })
    }

    // ── ROUTES LAYER ──────────────────────────
    if (activeLayer === 'all' || activeLayer === 'routes') {
      // 1. Physical Lifeline Corridors (Dense OSRM Road Geometries)
      neRoutes.forEach(route => {
        const isHighlighted = highlightCorridor && (
          route.highway.toLowerCase().includes(highlightCorridor.toLowerCase()) ||
          route.name.toLowerCase().includes(highlightCorridor.toLowerCase()) ||
          highlightCorridor.toLowerCase().includes(route.highway.toLowerCase())
        )

        // Highlight aura if corridor is selected
        if (isHighlighted) {
          const halo = L.polyline(route.waypoints, {
            color: route.status === 'SAFE' ? '#22C55E' : '#38BDF8',
            weight: 9,
            opacity: 0.45,
            lineCap: 'round',
            lineJoin: 'round',
          })
          gRoutes.addLayer(halo)
        }

        // Main Physical Highway Line
        const line = L.polyline(route.waypoints, {
          color: route.status === 'SAFE' ? '#22C55E' : route.status === 'CAUTION' ? '#F97316' : '#EF4444',
          weight: isHighlighted ? 5.5 : 4.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        })
        line.bindTooltip(`<strong>${route.highway} — ${route.name}</strong><br/>${route.from} → ${route.to} (${route.distanceKm} km, ETA ${route.etaMin}m)<br/><em>Follows real highway curves &amp; intersections</em>`, {
          className: 'leaflet-popup-content-wrapper',
          sticky: true,
        })
        line.on('click', () => {
          setSelectedRoute(route)
          setSelectedHazard(null)
          setSelectedShelter(null)
          setSelectedFleet(null)
          if (onSelectRoute) onSelectRoute(route)
        })
        gRoutes.addLayer(line)

        // Blocked section along physical road if any
        if (route.blockedWaypoints && route.blockedWaypoints.length > 0) {
          const blockedLine = L.polyline(route.blockedWaypoints, {
            color: '#EF4444',
            weight: 4.5,
            dashArray: '8, 6',
            opacity: 0.95,
            lineCap: 'round',
          })
          blockedLine.bindTooltip('<strong>BLOCKED HIGHWAY SECTION</strong><br/>Jatinga Landslide Pass — Impassable mud &amp; rockfall<br/><em>Traffic diverted to Umrangso bypass</em>', {
            className: 'leaflet-popup-content-wrapper',
            sticky: true,
          })
          gRoutes.addLayer(blockedLine)
        }

        // Safe Detour bypass along real mountain road if any
        if (route.detourWaypoints && route.detourWaypoints.length > 0) {
          const detourLine = L.polyline(route.detourWaypoints, {
            color: '#22C55E',
            weight: 5.5,
            opacity: 0.95,
            dashArray: '4, 6',
            lineCap: 'round',
          })
          detourLine.bindTooltip('<strong>SMARTLOGIX SAFE DETOUR</strong><br/>Umrangso - Halflong bypass corridor (Active)<br/><em>Grade audited &lt; 4.5° · Clear of active slides</em>', {
            className: 'leaflet-popup-content-wrapper',
            sticky: true,
          })
          detourLine.on('click', () => {
            setSelectedRoute(route)
            if (onSelectRoute) onSelectRoute(route)
          })
          gRoutes.addLayer(detourLine)
        }
      })

      // 2. Dynamic AI Evacuation Route & ML Candidate Corridors
      if (effectiveRoute && (activeLayer === 'all' || activeLayer === 'routes')) {
        const candidateRoutes = effectiveRoute.candidate_routes || []

        // Render Alternative Candidates first (underneath recommended route)
        candidateRoutes.forEach((cand) => {
          if (cand.is_recommended) return // will render as primary route
          const candPts: [number, number][] = cand.waypoints?.map(wp => [wp.latitude, wp.longitude]) || []
          if (candPts.length > 1) {
            const candColor = cand.status === 'BLOCKED' ? '#EF4444' : cand.status === 'CAUTION' ? '#F59E0B' : '#0EA5E9'
            const candLine = L.polyline(candPts, {
              color: candColor,
              weight: 3.5,
              opacity: 0.8,
              dashArray: '6, 6',
              lineCap: 'round',
              lineJoin: 'round',
            })
            candLine.bindTooltip(
              `<strong>${cand.name} (${cand.destination_name})</strong><br/>` +
              `Status: ${cand.status} · ML Risk: ${cand.ml_risk_score.toFixed(1)}/100<br/>` +
              `Distance: ${cand.distance_km} km · ETA: ${cand.estimated_minutes} min<br/>` +
              `<em>${cand.safety_verdict}</em>`,
              { className: 'leaflet-popup-content-wrapper', sticky: true }
            )
            gRoutes.addLayer(candLine)
          }
        })

        // Render Winning Recommended Safe Road Route
        const mainPts: [number, number][] = effectiveRoute.waypoints?.map(wp => [wp.latitude, wp.longitude]) || []
        if (mainPts.length > 1) {
          // Outer Emerald Glow Halo
          const haloLine = L.polyline(mainPts, {
            color: '#10B981',
            weight: 9,
            opacity: 0.4,
            lineCap: 'round',
            lineJoin: 'round',
          })
          gRoutes.addLayer(haloLine)

          // Inner Solid Road Line
          const primaryLine = L.polyline(mainPts, {
            color: '#22C55E',
            weight: 5,
            opacity: 1.0,
            lineCap: 'round',
            lineJoin: 'round',
          })
          primaryLine.bindTooltip(
            `<strong>RECOMMENDED SAFE EVACUATION ROUTE</strong><br/>` +
            `Destination: ${effectiveRoute.destination_name} (${effectiveRoute.distance_km} km, ${effectiveRoute.estimated_minutes} min)<br/>` +
            `Status: ${effectiveRoute.status} · ML Compound Risk: ${(effectiveRoute.ml_risk_score ?? 0).toFixed(1)}/100<br/>` +
            `Accessibility: ${effectiveRoute.is_accessible ? '♿ Fully Wheelchair Accessible' : 'Standard Road'}<br/>` +
            `<em>${effectiveRoute.selection_reason || 'Minimal hazard exposure along real road network'}</em>`,
            { className: 'leaflet-popup-content-wrapper', sticky: true }
          )
          gRoutes.addLayer(primaryLine)

          // Origin Marker (Start)
          if (effectiveRoute.from_location) {
            const originIcon = L.divIcon({
              html: `
                <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
                  <div class="marker-pulse-blue" style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(14,165,233,0.4);"></div>
                  <div style="width: 26px; height: 26px; border-radius: 50%; background: #0284C7; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                    <span style="font-size: 11px; font-weight: 800; color: white;">A</span>
                  </div>
                </div>
              `,
              className: 'custom-origin-marker',
              iconSize: [34, 34],
              iconAnchor: [17, 17],
            })
            const originMarker = L.marker(
              [effectiveRoute.from_location.latitude, effectiveRoute.from_location.longitude],
              { icon: originIcon }
            )
            originMarker.bindTooltip(`<strong>Evacuation Origin</strong><br/>${effectiveRoute.from_location.label || 'Incident Origin Point'}`, {
              className: 'leaflet-popup-content-wrapper',
              direction: 'top',
            })
            gRoutes.addLayer(originMarker)
          }

          // Destination Shelter Marker (End)
          if (effectiveRoute.to_location) {
            const destIcon = L.divIcon({
              html: `
                <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                  <div class="marker-pulse-green" style="position: absolute; inset: -5px; border-radius: 50%; background: rgba(34,197,94,0.4);"></div>
                  <div style="width: 28px; height: 28px; border-radius: 7px; background: #15803D; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5);">
                    <span style="font-size: 12px; font-weight: 800; color: white;">B</span>
                  </div>
                </div>
              `,
              className: 'custom-dest-marker',
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            })
            const destMarker = L.marker(
              [effectiveRoute.to_location.latitude, effectiveRoute.to_location.longitude],
              { icon: destIcon }
            )
            destMarker.bindTooltip(
              `<strong>${effectiveRoute.destination_name}</strong><br/>` +
              `Type: ${effectiveRoute.destination_type}<br/>` +
              `Status: ${effectiveRoute.status} · ML Risk: ${(effectiveRoute.ml_risk_score ?? 0).toFixed(1)}/100`,
              { className: 'leaflet-popup-content-wrapper', direction: 'top' }
            )
            gRoutes.addLayer(destMarker)
          }
        }
      }

      // 3. User GPS / Incident Location Marker if provided
      if (userLocation && userLocation.lat && userLocation.lon) {
        const userIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
              <div class="marker-pulse-blue" style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(56,189,248,0.4);"></div>
              <div style="width: 22px; height: 22px; border-radius: 50%; background: #0284C7; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #FFFFFF;"></div>
              </div>
            </div>
          `,
          className: 'custom-user-location-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
        const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
        userMarker.bindTooltip(`<strong>Current Location</strong><br/>${userLocation.lat.toFixed(3)}°N, ${userLocation.lon.toFixed(3)}°E`, {
          className: 'leaflet-popup-content-wrapper',
          direction: 'top',
        })
        gRoutes.addLayer(userMarker)
      }
    }

    // ── FLEET / AMBULANCE LAYER ───────────────
    if (activeLayer === 'all' || activeLayer === 'fleet') {
      neFleetUnits.forEach(unit => {
        const iconHtml = `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div class="marker-pulse-green" style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(56,189,248,0.3);"></div>
            <div style="width: 26px; height: 26px; border-radius: 50%; background: #0284C7; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              <span style="font-size: 13px;">🚑</span>
            </div>
          </div>
        `
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-fleet-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([unit.lat, unit.lon], { icon })
        marker.bindTooltip(`<strong>${unit.callsign}</strong><br/>${unit.location} · ${unit.speed}`, {
          className: 'leaflet-popup-content-wrapper',
          direction: 'top',
        })
        marker.on('click', () => {
          setSelectedFleet(unit)
          setSelectedHazard(null)
          setSelectedShelter(null)
          setSelectedRoute(null)
        })
        gFleet.addLayer(marker)
      })
    }
  }, [activeLayer, selectedState, mergedHazards, mergedShelters, effectiveRoute, userLocation, highlightCorridor])

  // Auto-focus on activeRoute when it is set or updated
  useEffect(() => {
    if (effectiveRoute && effectiveRoute.waypoints && effectiveRoute.waypoints.length > 1 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(effectiveRoute.waypoints.map(wp => [wp.latitude, wp.longitude]))
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
          animate: true,
          duration: 1.0,
        })
      }
    }
  }, [effectiveRoute])

  // Handle Corridor Highlight from parent or LandingPage
  useEffect(() => {
    if (!highlightCorridor || !mapInstanceRef.current) return
    const corridorLower = highlightCorridor.toLowerCase()
    const match = neRoutes.find(r =>
      r.highway.toLowerCase().includes(corridorLower) ||
      r.name.toLowerCase().includes(corridorLower) ||
      corridorLower.includes(r.highway.toLowerCase()) ||
      (corridorLower.includes('sela') && r.id === 'r-nh13') ||
      (corridorLower.includes('silchar') && r.id === 'r-nh6') ||
      (corridorLower.includes('kohima') && r.id === 'r-nh29') ||
      (corridorLower.includes('barak') && r.id === 'r-nh306') ||
      (corridorLower.includes('valley') && r.id === 'r-nh37')
    )
    if (match) {
      setSelectedRoute(match)
      const allPoints = [
        ...match.waypoints,
        ...(match.detourWaypoints || []),
        ...(match.blockedWaypoints || [])
      ]
      if (allPoints.length > 1) {
        const bounds = L.latLngBounds(allPoints)
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 11,
            animate: true,
            duration: 1.2,
          })
        }
      }
    }
  }, [highlightCorridor])

  // Listen to custom focus event from SafeRoute component
  useEffect(() => {
    const handleFocusRoute = (e: Event) => {
      const customEvent = e as CustomEvent
      const routeId = customEvent.detail?.routeId || 'r-nh6'
      const match = neRoutes.find(r => r.id === routeId)
      if (match && mapInstanceRef.current) {
        setSelectedRoute(match)
        const allPoints = [...match.waypoints, ...(match.detourWaypoints || [])]
        if (allPoints.length > 1) {
          const bounds = L.latLngBounds(allPoints)
          if (bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds, {
              padding: [45, 45],
              maxZoom: 11,
              animate: true,
              duration: 1.0,
            })
          }
        }
      }
    }
    window.addEventListener('smartlogix:focus-route', handleFocusRoute)
    return () => window.removeEventListener('smartlogix:focus-route', handleFocusRoute)
  }, [])

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode)
    const target = stateCoordinates[stateCode] || stateCoordinates.ALL
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.center, target.zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      })
    }
  }

  // Handle Zoom buttons
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn()
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut()
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize()
      const target = stateCoordinates[selectedState] || stateCoordinates.ALL
      mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 0.8 })
    }
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const states = [
    { code: 'ALL', name: 'All Northeast' },
    { code: 'Assam', name: 'Assam' },
    { code: 'Arunachal Pradesh', name: 'Arunachal' },
    { code: 'Meghalaya', name: 'Meghalaya' },
    { code: 'Nagaland', name: 'Nagaland' },
    { code: 'Manipur', name: 'Manipur' },
    { code: 'Mizoram', name: 'Mizoram' },
    { code: 'Tripura', name: 'Tripura' },
    { code: 'Sikkim', name: 'Sikkim' },
  ]

  return (
    <div
      className={`card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        minHeight: fullHeight ? 660 : 540,
        height: '100%',
        position: 'relative',
        isolation: 'isolate',
        zIndex: 1,
      }}
      role="region"
      aria-label="Northeast India Live GIS Risk Map"
    >
      {/* ── HEADER & CONTROLS ── */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(32,168,107,0.14)',
                border: '1px solid var(--color-accent-green-border)',
                color: 'var(--color-accent-green)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-green)', animation: 'pulse 1.5s infinite' }} />
              LIVE GIS CORRIDOR
            </span>
            <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
              Northeast India Tactical Map
            </h2>
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, marginBottom: 0 }}>
            8 States · OpenStreetMap Open GIS Engine · Live Fleet &amp; Reroute Telemetry
          </p>
        </div>

        {/* Controls toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Layer Filter Buttons */}
          <div style={{ display: 'flex', background: 'var(--color-bg-overlay)', borderRadius: 8, padding: 2, gap: 1 }}>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'disasters', label: 'Hazards' },
                { id: 'routes', label: 'Routes' },
                { id: 'shelters', label: 'Shelters ♿' },
                { id: 'fleet', label: 'Ambulance 🚑' },
              ] as const
            ).map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeLayer === l.id ? 'var(--color-bg-surface)' : 'transparent',
                  color: activeLayer === l.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  boxShadow: activeLayer === l.id ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Theme switcher: Tactical Dark / OSM Standard */}
          <button
            onClick={() => setMapTheme(m => m === 'tactical' ? 'standard' : 'tactical')}
            title="Toggle Map Style"
            style={{
              padding: '5px 9px',
              borderRadius: 6,
              background: 'var(--color-bg-overlay)',
              border: '1px solid var(--color-border)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Compass size={12} />
            {mapTheme === 'tactical' ? 'Tactical Dark' : 'OSM Standard'}
          </button>

          {/* Zoom controls */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)', cursor: 'pointer',
              }}
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)', cursor: 'pointer',
              }}
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleRefresh}
              title="Refresh / Re-center"
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)', cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── STATE FOCUS SELECTOR PILLS ── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '8px 18px',
          background: 'var(--color-bg-base)',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          flexShrink: 0,
        }}
        className="custom-scrollbar"
      >
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap', marginRight: 4 }}>
          Focus Region:
        </span>
        {states.map(st => (
          <button
            key={st.code}
            onClick={() => handleStateSelect(st.code)}
            style={{
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: selectedState === st.code ? 700 : 500,
              border: selectedState === st.code ? '1px solid var(--color-accent-green-border)' : '1px solid var(--color-border)',
              background: selectedState === st.code ? 'var(--color-accent-green-dim)' : 'transparent',
              color: selectedState === st.code ? 'var(--color-accent-green)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 120ms ease',
            }}
          >
            {st.name}
          </button>
        ))}
      </div>

      {/* ── LEAFLET MAP CONTAINER ── */}
      <div
        style={{
          position: 'relative',
          flex: '1 1 auto',
          width: '100%',
          minHeight: fullHeight ? 560 : 440,
          height: fullHeight ? 580 : 440,
          background: '#090D10',
          overflow: 'hidden',
        }}
        className={mapTheme === 'tactical' ? 'dark-osm-tiles' : ''}
      >
        {/* Real Leaflet Map */}
        <div
          ref={mapContainerRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            minHeight: fullHeight ? 560 : 440,
            zIndex: 1,
          }}
        />

        {/* Tactical Map Overlay HUD */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 20,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              padding: '6px 10px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              OSRM Autonomous Routing Engine: <strong style={{ color: '#22C55E' }}>ACTIVE</strong>
            </span>
          </div>

          <div
            style={{
              pointerEvents: 'auto',
              padding: '4px 8px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 6,
              fontSize: 10,
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🛰️ NavIC Constellation</span>
            <span>·</span>
            <span>⚡ Backend: {backendOnline ? 'FastAPI Connected' : 'Local Fallback'}</span>
          </div>
        </div>

        {/* ── SELECTED HAZARD MODAL CARD ── */}
        <AnimatePresence>
          {selectedHazard && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                maxWidth: 460,
                zIndex: 40,
                background: 'rgba(15, 23, 42, 0.94)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 14,
                padding: '16px 18px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6), 0 0 20px rgba(239,68,68,0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: selectedHazard.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)',
                      border: `1px solid ${selectedHazard.severity === 'CRITICAL' ? 'rgba(239,68,68,0.5)' : 'rgba(249,115,22,0.5)'}`,
                      color: selectedHazard.severity === 'CRITICAL' ? '#EF4444' : '#F97316',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {selectedHazard.severity} HAZARD
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{selectedHazard.updatedAt}</span>
                </div>
                <button
                  onClick={() => setSelectedHazard(null)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', padding: 2, display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: '#FFFFFF' }}>
                {selectedHazard.name}
              </h4>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 10 }}>
                {selectedHazard.highway} · {selectedHazard.state} ({((hazard: NEHazard) => (hazard.lat ?? 26.2).toFixed(2))(selectedHazard)}°N, {((hazard: NEHazard) => (hazard.lon ?? 92.8).toFixed(2))(selectedHazard)}°E)
              </div>

              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                {selectedHazard.description}
              </p>

              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  marginBottom: 10,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', letterSpacing: '0.05em', marginBottom: 2 }}>
                  AUTONOMOUS REROUTE ADVISORY
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>
                  {selectedHazard.detour}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
                <span>Evacuees Affected: <strong style={{ color: '#FFFFFF' }}>{selectedHazard.evacuees.toLocaleString()}</strong></span>
                <span>Buffer Radius: <strong style={{ color: '#FFFFFF' }}>{selectedHazard.radiusKm ?? 15} km</strong></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SELECTED SHELTER MODAL CARD ── */}
        <AnimatePresence>
          {selectedShelter && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                maxWidth: 440,
                zIndex: 40,
                background: 'rgba(15, 23, 42, 0.94)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                borderRadius: 14,
                padding: '16px 18px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(236, 72, 153, 0.15)',
                      border: '1px solid rgba(236, 72, 153, 0.4)',
                      color: '#EC4899',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    EMERGENCY SHELTER / HUB
                  </span>
                  {selectedShelter.accessible && (
                    <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 700 }}>♿ Verified Accessible</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedShelter(null)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', padding: 2, display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: '#FFFFFF' }}>
                {selectedShelter.name}
              </h4>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                {selectedShelter.state} · Capacity: <strong>{selectedShelter.capacity} evacuees</strong>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {selectedShelter.features.map(f => (
                  <span
                    key={f}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 10,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    ✓ {f}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Emergency Dispatch: <strong>{selectedShelter.contact}</strong></span>
                <button
                  onClick={() => alert(`Connecting directly to ${selectedShelter.name} Dispatch at ${selectedShelter.contact}`)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    background: 'var(--color-accent-blue)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <PhoneCall size={12} /> Contact Hub
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SELECTED ROUTE MODAL CARD ── */}
        <AnimatePresence>
          {selectedRoute && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                maxWidth: 440,
                zIndex: 40,
                background: 'rgba(15, 23, 42, 0.94)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: 14,
                padding: '16px 18px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: selectedRoute.status === 'SAFE' ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)',
                    border: `1px solid ${selectedRoute.status === 'SAFE' ? 'rgba(34,197,94,0.4)' : 'rgba(249,115,22,0.4)'}`,
                    color: selectedRoute.status === 'SAFE' ? '#22C55E' : '#F97316',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {selectedRoute.highway} · {selectedRoute.status} CORRIDOR
                </span>
                <button
                  onClick={() => setSelectedRoute(null)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', padding: 2, display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px 0', color: '#FFFFFF' }}>
                {selectedRoute.name}
              </h4>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                {selectedRoute.from} → {selectedRoute.to}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{selectedRoute.distanceKm} km</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Distance</div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{selectedRoute.etaMin} min</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>ETA</div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#22C55E' }}>{selectedRoute.inclineGrade}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Max Slope</div>
                </div>
              </div>

              {selectedRoute.detourWaypoints && (
                <div style={{ fontSize: 11, color: '#22C55E', background: 'rgba(34,197,94,0.08)', padding: '6px 10px', borderRadius: 6 }}>
                  ✓ Dynamic detour bypassing Jatinga Landslide active via Umrangso.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SELECTED FLEET UNIT MODAL CARD ── */}
        <AnimatePresence>
          {selectedFleet && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                maxWidth: 420,
                zIndex: 40,
                background: 'rgba(15, 23, 42, 0.94)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 14,
                padding: '16px 18px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38BDF8',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  🚑 {selectedFleet.type}
                </span>
                <button
                  onClick={() => setSelectedFleet(null)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', padding: 2, display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: '#FFFFFF' }}>
                {selectedFleet.callsign}
              </h4>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                Current Sector: <strong>{selectedFleet.location}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8' }}>{selectedFleet.speed}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Telemetry</div>
                </div>
                <div style={{ padding: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#22C55E' }}>{selectedFleet.batteryOrFuel}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Reserve</div>
                </div>
                <div style={{ padding: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: selectedFleet.patientAboard ? '#EF4444' : '#22C55E' }}>
                    {selectedFleet.patientAboard ? 'Critical Pt' : 'Transit'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Status</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                Target Hub: <strong>{selectedFleet.destination}</strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM MAP LEGEND & STATUS BAR ── */}
      <div
        style={{
          padding: '10px 18px',
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <MapLegend />
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>Active Units: <strong style={{ color: 'var(--color-text-primary)' }}>14</strong></span>
          <span>Corridors Mapped: <strong style={{ color: 'var(--color-text-primary)' }}>4 NH Links</strong></span>
        </div>
      </div>
    </div>
  )
}
