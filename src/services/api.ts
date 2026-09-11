/**
 * SmartLogix SIH — Real Backend API Client
 *
 * Connects frontend directly to the FastAPI + SQLite + MongoDB Atlas backend.
 * Backed by deterministic offline fallback to preserve resilient operation.
 */

// Determine base URL: supports proxying in dev or direct localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── TYPES MATCHING BACKEND SCHEMAS ─────────────────────────────

export interface HealthResponse {
  status: string
  app_name: string
  version: string
  environment: string
  demo_mode: boolean
  database: string
  timestamp: string
}

export interface BackendDisasterEvent {
  id: string
  disaster_type: 'FLOOD' | 'LANDSLIDE' | 'CYCLONE' | 'EARTHQUAKE' | 'STORM' | 'DROUGHT'
  name: string
  description?: string
  latitude: float
  longitude: float
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  radius_km: number
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED'
  is_demo: boolean
  evacuees: number
  source: string
  created_at: string
  updated_at?: string
}

export interface BackendAlert {
  id: string
  disaster_event_id?: string
  disaster_type: string
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  user_latitude?: number
  user_longitude?: number
  location_name?: string
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  is_demo: boolean
  created_at: string
  acknowledged_at?: string
}

export interface BackendSafeLocation {
  id: string
  name: string
  location_type: string
  latitude: number
  longitude: number
  capacity: number
  current_occupancy: number
  is_accessible: boolean
  contact?: string
  address?: string
  is_active: boolean
}

export interface RouteWaypoint {
  latitude: number
  longitude: number
  label?: string
}

export interface CandidateRoute {
  route_id: string
  name: string
  destination_name: string
  destination_type: string
  distance_km: number
  estimated_minutes: number
  ml_risk_score: number
  status: 'SAFE' | 'CAUTION' | 'HAZARD_PRONE' | 'BLOCKED'
  is_accessible: boolean
  hazards_avoided: number
  safety_verdict: string
  is_recommended: boolean
  waypoints: RouteWaypoint[]
}

export interface SafeRouteResponse {
  route_id: string
  status: 'SAFE' | 'CAUTION' | 'HAZARD_PRONE' | 'BLOCKED'
  from_location: RouteWaypoint
  to_location: RouteWaypoint
  destination_name: string
  destination_type: string
  distance_km: number
  estimated_minutes: number
  waypoints: RouteWaypoint[]
  hazards_avoided: number
  is_accessible: boolean
  safety_notes: string[]
  is_demo: boolean
  generated_at: string
  recommended_route_id?: string
  selection_reason?: string
  ml_risk_score?: number
  candidate_routes: CandidateRoute[]
  ml_telemetry?: Record<string, any>
}

export interface RiskFactorDetail {
  factor: string
  contribution: number
  description: string
}

export interface NearbyEvent {
  event_id: string
  name: string
  disaster_type: string
  distance_km: number
  severity: string
  zone: 'INSIDE' | 'NEAR' | 'OUTSIDE'
}

export interface RiskAnalysisResponse {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  risk_score: number
  primary_hazard?: string
  reason: string
  factors: RiskFactorDetail[]
  nearby_events: NearbyEvent[]
  recommendation: string
  is_demo: boolean
  analysed_at: string
}

export type RiskAnalysisResult = RiskAnalysisResponse
export type SafeRouteResult = SafeRouteResponse
export type DemoDashboardSummary = DashboardSummary


export interface DashboardSummary {
  backend_status: string
  active_events_count: number
  active_alerts_count: number
  safe_locations_count: number
  demo_mode: boolean
  active_events: BackendDisasterEvent[]
  recent_alerts: BackendAlert[]
  timestamp: string
}

export interface MongoStatsResponse {
  status: string
  database_name: string
  mode: string
  is_mock: boolean
  collections: {
    disaster_events: number
    safe_locations: number
    alerts: number
  }
  sample_event?: any
  sample_shelter?: any
  region: string
  timestamp: string
}

export interface DemoScenarioResponse {
  scenario: string
  description: string
  test_location: { latitude: number; longitude: number }
  active_events: BackendDisasterEvent[]
  risk_analysis: RiskAnalysisResponse
  alerts: BackendAlert[]
  safe_route?: SafeRouteResponse
}

// ── HELPER WITH TIMEOUT & CORS HANDLING ────────────────────────

type float = number

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 7500)

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`)
    }

    return await res.json() as T
  } finally {
    clearTimeout(timeoutId)
  }
}

// ── EXPORTED API ENDPOINTS ─────────────────────────────────────

export const api = {
  // 1. Health & Diagnostics
  getHealth: () => request<HealthResponse>('/health'),
  getApiStatus: () => request<HealthResponse>('/api/v1/status'),
  getMongoStats: () => request<MongoStatsResponse>('/api/v1/mongo/stats'),
  seedMongo: () => request<{ status: string; message: string; counts: any }>('/api/v1/mongo/seed', { method: 'POST' }),

  // 2. Dashboard Summary
  getDashboard: () => request<DashboardSummary>('/api/v1/demo/dashboard'),

  // 3. Disaster Events
  getEvents: (status?: string, disasterType?: string) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (disasterType) params.append('disaster_type', disasterType)
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<BackendDisasterEvent[]>(`/api/v1/events${query}`)
  },
  getActiveEvents: () => request<BackendDisasterEvent[]>('/api/v1/events/active'),
  getEventById: (id: string) => request<BackendDisasterEvent>(`/api/v1/events/${id}`),
  createEvent: (data: Partial<BackendDisasterEvent>) =>
    request<BackendDisasterEvent>('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteEvent: (id: string) =>
    request<void>(`/api/v1/events/${id}`, { method: 'DELETE' }),

  // 4. Risk Analysis & Zones
  analyseRisk: (latitude: number, longitude: number, includeWeather: boolean = false) =>
    request<RiskAnalysisResponse>('/api/v1/risk/analyse', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, include_weather: includeWeather }),
    }),
  getRiskZones: () => request<{ count: number; zones: any[]; is_demo: boolean; fetched_at: string }>('/api/v1/risk/zones'),

  // 5. Alerts
  getAlerts: (status?: string, limit: number = 50) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('limit', limit.toString())
    return request<BackendAlert[]>(`/api/v1/alerts?${params.toString()}`)
  },
  generateAlerts: (latitude: number, longitude: number) =>
    request<BackendAlert[]>('/api/v1/alerts/generate', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    }),
  acknowledgeAlert: (alertId: string) =>
    request<BackendAlert>(`/api/v1/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    }),

  // 6. Safe Routes & Shelters
  getSafeLocations: (accessibleOnly: boolean = false) =>
    request<BackendSafeLocation[]>(`/api/v1/locations?accessible_only=${accessibleOnly}`),
  getSafeRoute: (latitude: number, longitude: number, preferAccessible: boolean = false) =>
    request<SafeRouteResponse>('/api/v1/route', {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
        prefer_accessible: preferAccessible,
      }),
    }),

  // 7. Demo Scenarios
  getScenarios: () => request<{ scenarios: { id: string; description: string; test_latitude: number; test_longitude: number }[] }>('/api/v1/demo/scenarios'),
  runScenario: (scenario: 'safe' | 'flood' | 'landslide' | 'multi_hazard') =>
    request<DemoScenarioResponse>('/api/v1/demo/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    }),
}

export default api
