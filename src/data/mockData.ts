// ============================================================
// SMART LOGISTICS ACCESSIBILITY — MOCK DATA
// Replace this with real API/WebSocket data when backend is ready
// ============================================================

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type DisasterType = "FLOOD" | "LANDSLIDE" | "CYCLONE" | "STORM" | "DROUGHT" | "EARTHQUAKE";
export type AlertStatus = "ACTIVE" | "MONITORING" | "RESOLVED";
export type RouteStatus = "SAFE" | "BLOCKED" | "CAUTION";

// ─── SYSTEM STATUS ──────────────────────────────────────────
export const systemStatus = {
  operational: true,
  lastSync: "2026-09-01T22:48:00+05:30",
  activeRegion: "Southern India",
  totalZonesMonitored: 48,
};

// ─── KPI METRICS ────────────────────────────────────────────
export const kpiData = {
  activeAlerts: { value: 12, delta: +3, deltaLabel: "in last hour", trend: "up" as const },
  safeRoutes: { value: 48, delta: 6, deltaLabel: "routes updated", trend: "stable" as const },
  vehiclesMonitored: { value: 126, delta: +4, deltaLabel: "currently tracked", trend: "up" as const },
  highRiskZones: { value: 7, delta: +2, deltaLabel: "newly detected", trend: "up" as const },
};

// ─── ACTIVE DISASTERS ────────────────────────────────────────
export interface Disaster {
  id: string;
  type: DisasterType;
  name: string;
  severity: RiskLevel;
  status: AlertStatus;
  region: string;
  coordinates: { lat: number; lng: number };
  affectedArea: string;
  updatedAt: string;
  description: string;
  evacuees?: number;
}

export const disasters: Disaster[] = [
  {
    id: "d1",
    type: "FLOOD",
    name: "Kerala Coastal Flood",
    severity: "HIGH",
    status: "ACTIVE",
    region: "Ernakulam, Kerala",
    coordinates: { lat: 9.93, lng: 76.26 },
    affectedArea: "42 km²",
    updatedAt: "2026-09-01T22:46:00+05:30",
    description: "Heavy rainfall causing flash flooding in low-lying coastal areas",
    evacuees: 3200,
  },
  {
    id: "d2",
    type: "LANDSLIDE",
    name: "Wayanad Landslide Risk",
    severity: "HIGH",
    status: "ACTIVE",
    region: "Wayanad, Kerala",
    coordinates: { lat: 11.6, lng: 76.08 },
    affectedArea: "18 km²",
    updatedAt: "2026-09-01T22:39:00+05:30",
    description: "Saturated soil conditions; active debris flows on NH-766",
    evacuees: 870,
  },
  {
    id: "d3",
    type: "CYCLONE",
    name: "Cyclone Vayu Remnants",
    severity: "MODERATE",
    status: "MONITORING",
    region: "Chennai Coast, Tamil Nadu",
    coordinates: { lat: 13.08, lng: 80.27 },
    affectedArea: "120 km²",
    updatedAt: "2026-09-01T22:31:00+05:30",
    description: "Residual storm surge and high winds; situation improving",
    evacuees: 1100,
  },
  {
    id: "d4",
    type: "STORM",
    name: "Bengaluru Urban Flooding",
    severity: "MODERATE",
    status: "MONITORING",
    region: "Outer Ring Road, Bengaluru",
    coordinates: { lat: 12.97, lng: 77.59 },
    affectedArea: "8 km²",
    updatedAt: "2026-09-01T22:24:00+05:30",
    description: "Stormwater drainage overwhelmed; localized flooding",
    evacuees: 0,
  },
  {
    id: "d5",
    type: "FLOOD",
    name: "Godavari Flood Watch",
    severity: "LOW",
    status: "MONITORING",
    region: "Rajahmundry, Andhra Pradesh",
    coordinates: { lat: 17.0, lng: 81.78 },
    affectedArea: "65 km²",
    updatedAt: "2026-09-01T21:55:00+05:30",
    description: "River level at 85% of danger mark; monitoring continues",
    evacuees: 0,
  },
];

// ─── MAP MARKERS ─────────────────────────────────────────────
export interface MapMarker {
  id: string;
  type: "disaster" | "shelter" | "vehicle" | "checkpoint";
  label: string;
  risk: RiskLevel;
  lat: number;  // SVG Y (0-100 normalized)
  lng: number;  // SVG X (0-100 normalized)
  details?: string;
}

export const mapMarkers: MapMarker[] = [
  // Disasters
  { id: "m1", type: "disaster", label: "Kerala Flood", risk: "HIGH", lat: 56, lng: 30, details: "Active flooding" },
  { id: "m2", type: "disaster", label: "Wayanad Slide", risk: "HIGH", lat: 48, lng: 29, details: "Landslide active" },
  { id: "m3", type: "disaster", label: "Chennai Cyclone", risk: "MODERATE", lat: 42, lng: 52, details: "Storm monitoring" },
  { id: "m4", type: "disaster", label: "Bengaluru Flood", risk: "MODERATE", lat: 50, lng: 38, details: "Urban flooding" },
  { id: "m5", type: "disaster", label: "Godavari Watch", risk: "LOW", lat: 38, lng: 52, details: "River watch" },
  // Shelters
  { id: "m6", type: "shelter", label: "Ernakulam School", risk: "LOW", lat: 57, lng: 31, details: "Capacity: 800" },
  { id: "m7", type: "shelter", label: "Chennai Relief Camp", risk: "LOW", lat: 43, lng: 53, details: "Capacity: 1200" },
  { id: "m8", type: "shelter", label: "Kozhikode Center", risk: "LOW", lat: 50, lng: 28, details: "Capacity: 500" },
  // Vehicles
  { id: "m9", type: "vehicle", label: "NDRF Team 3", risk: "LOW", lat: 54, lng: 32, details: "En route to zone" },
  { id: "m10", type: "vehicle", label: "Medical Unit 7", risk: "LOW", lat: 55, lng: 30, details: "On standby" },
];

// ─── ROUTES ─────────────────────────────────────────────────
export interface Route {
  id: string;
  from: string;
  to: string;
  status: RouteStatus;
  eta: number;      // minutes
  distance: number; // km
  risk: RiskLevel;
  blockedRoadsAvoided: number;
  lastUpdated: string;
  waypoints: Array<{ x: number; y: number }>;
}

export const routes: Route[] = [
  {
    id: "r1",
    from: "Bengaluru Central",
    to: "Ernakulam Shelter Hub",
    status: "SAFE",
    eta: 24,
    distance: 11.4,
    risk: "LOW",
    blockedRoadsAvoided: 3,
    lastUpdated: "30 sec ago",
    waypoints: [
      { x: 38, y: 50 }, { x: 35, y: 51 }, { x: 33, y: 53 }, { x: 31, y: 55 }
    ],
  },
  {
    id: "r2",
    from: "Wayanad",
    to: "Kozhikode Relief Camp",
    status: "CAUTION",
    eta: 55,
    distance: 28.7,
    risk: "MODERATE",
    blockedRoadsAvoided: 5,
    lastUpdated: "2 min ago",
    waypoints: [
      { x: 29, y: 48 }, { x: 28, y: 49 }, { x: 28, y: 50 }
    ],
  },
  {
    id: "r3",
    from: "Chennai Port",
    to: "Kancheepuram Shelter",
    status: "BLOCKED",
    eta: 0,
    distance: 0,
    risk: "HIGH",
    blockedRoadsAvoided: 0,
    lastUpdated: "5 min ago",
    waypoints: [],
  },
];

// ─── WEATHER DATA ─────────────────────────────────────────────
export interface WeatherReading {
  time: string;
  rainfall: number;    // mm/hr
  windSpeed: number;   // km/h
  temperature: number; // °C
  riskScore: number;   // 0-100
}

export const weatherTrend: WeatherReading[] = [
  { time: "14:00", rainfall: 8, windSpeed: 28, temperature: 28, riskScore: 35 },
  { time: "15:00", rainfall: 22, windSpeed: 45, temperature: 27, riskScore: 55 },
  { time: "16:00", rainfall: 45, windSpeed: 62, temperature: 26, riskScore: 72 },
  { time: "17:00", rainfall: 38, windSpeed: 55, temperature: 25, riskScore: 65 },
  { time: "18:00", rainfall: 55, windSpeed: 78, temperature: 24, riskScore: 84 },
  { time: "19:00", rainfall: 48, windSpeed: 72, temperature: 24, riskScore: 78 },
  { time: "20:00", rainfall: 30, windSpeed: 60, temperature: 25, riskScore: 62 },
  { time: "21:00", rainfall: 18, windSpeed: 42, temperature: 26, riskScore: 45 },
  { time: "22:00", rainfall: 12, windSpeed: 35, temperature: 27, riskScore: 38 },
];

// ─── ALERTS ─────────────────────────────────────────────────
export interface Alert {
  id: string;
  title: string;
  location: string;
  severity: RiskLevel;
  timestamp: string;
  timeAgo: string;
  isNew?: boolean;
}

export const alerts: Alert[] = [
  {
    id: "a1",
    title: "Flash Flood Warning Issued",
    location: "Zone 4 — Ernakulam District",
    severity: "HIGH",
    timestamp: "2026-09-01T22:46:00+05:30",
    timeAgo: "2 min ago",
    isNew: true,
  },
  {
    id: "a2",
    title: "Landslide Risk Increased",
    location: "NH-766 — Wayanad Segment",
    severity: "HIGH",
    timestamp: "2026-09-01T22:40:00+05:30",
    timeAgo: "8 min ago",
    isNew: true,
  },
  {
    id: "a3",
    title: "Route NH-44 Blocked",
    location: "Chennai — Tiruvallur Section",
    severity: "MODERATE",
    timestamp: "2026-09-01T22:33:00+05:30",
    timeAgo: "15 min ago",
  },
  {
    id: "a4",
    title: "Evacuation Order — Coastal Zones",
    location: "Alappuzha, Kerala",
    severity: "CRITICAL",
    timestamp: "2026-09-01T22:20:00+05:30",
    timeAgo: "28 min ago",
  },
  {
    id: "a5",
    title: "Shelter Capacity Alert",
    location: "Kozhikode Community Center",
    severity: "MODERATE",
    timestamp: "2026-09-01T22:10:00+05:30",
    timeAgo: "38 min ago",
  },
  {
    id: "a6",
    title: "Wind Speed Advisory",
    location: "Chennai Coastal Area",
    severity: "LOW",
    timestamp: "2026-09-01T22:00:00+05:30",
    timeAgo: "48 min ago",
  },
];

// ─── ACCESSIBILITY ───────────────────────────────────────────
export const accessibilityData = {
  accessibleRoutes: { count: 32, change: -2, note: "2 under review" },
  accessibleShelters: { count: 18, change: 0, note: "All operational" },
  assistanceRequired: { count: 7, change: +3, note: "3 new requests" },
  accessibleTransport: { count: 14, change: +1, note: "Vehicles deployed" },
  features: [
    { label: "Wheelchair-accessible routes", active: true, count: 24 },
    { label: "Accessible evacuation shelters", active: true, count: 18 },
    { label: "Elderly/vulnerable assistance", active: true, count: 7 },
    { label: "Sign language interpreters", active: true, count: 4 },
    { label: "Blocked accessibility paths", active: false, count: 3 },
  ],
};

// ─── VEHICLES & LOGISTICS ────────────────────────────────────
export interface Vehicle {
  id: string;
  type: "NDRF" | "MEDICAL" | "SUPPLY" | "RESCUE";
  name: string;
  status: "DEPLOYED" | "STANDBY" | "RETURNING";
  location: string;
  mission: string;
}

export const vehicles: Vehicle[] = [
  { id: "v1", type: "NDRF", name: "Team Alpha-3", status: "DEPLOYED", location: "Ernakulam", mission: "Search & Rescue" },
  { id: "v2", type: "MEDICAL", name: "Med Unit 7", status: "DEPLOYED", location: "Wayanad", mission: "Emergency Medical" },
  { id: "v3", type: "SUPPLY", name: "Logistics Convoy 2", status: "DEPLOYED", location: "NH-544", mission: "Relief Materials" },
  { id: "v4", type: "RESCUE", name: "Boat Unit 12", status: "STANDBY", location: "Alappuzha Dock", mission: "Water Rescue" },
  { id: "v5", type: "NDRF", name: "Team Beta-1", status: "RETURNING", location: "Kozhikode", mission: "Completed" },
];
