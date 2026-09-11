// ============================================================
// SMART LOGISTICS ACCESSIBILITY — NORTHEAST INDIA MOCK DATA
// Realistic disaster management data for Northeast India (Assam, Meghalaya,
// Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Sikkim)
// ============================================================

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type DisasterType = "FLOOD" | "LANDSLIDE" | "CYCLONE" | "STORM" | "DROUGHT" | "EARTHQUAKE";
export type AlertStatus = "ACTIVE" | "MONITORING" | "RESOLVED";
export type RouteStatus = "SAFE" | "BLOCKED" | "CAUTION";

// ─── SYSTEM STATUS ──────────────────────────────────────────
export const systemStatus = {
  operational: true,
  lastSync: "2026-09-03T00:30:00+05:30",
  activeRegion: "Northeast India",
  centerHub: "Guwahati, Assam",
  totalZonesMonitored: 52,
};

// ─── KPI METRICS ────────────────────────────────────────────
export const kpiData = {
  activeAlerts: { value: 14, delta: +3, deltaLabel: "in last hour", trend: "up" as const },
  safeRoutes: { value: 42, delta: 5, deltaLabel: "routes verified", trend: "stable" as const },
  vehiclesMonitored: { value: 138, delta: +6, deltaLabel: "deployed units", trend: "up" as const },
  highRiskZones: { value: 8, delta: +2, deltaLabel: "slope & river zones", trend: "up" as const },
};

// ─── ACTIVE DISASTERS (Northeast India) ───────────────────────
export interface Disaster {
  id: string;
  type: DisasterType;
  name: string;
  severity: RiskLevel;
  status: AlertStatus;
  region: string;
  coordinates: { lat: number; lng: number };
  radiusKm: number;
  affectedArea: string;
  updatedAt: string;
  description: string;
  evacuees?: number;
}

export const disasters: Disaster[] = [
  {
    id: "d1",
    type: "FLOOD",
    name: "Brahmaputra Basin Flood",
    severity: "HIGH",
    status: "ACTIVE",
    region: "Guwahati / Kamrup Metro, Assam",
    coordinates: { lat: 26.1850, lng: 91.7450 },
    radiusKm: 12.0,
    affectedArea: "68 km²",
    updatedAt: "2026-09-03T00:15:00+05:30",
    description: "Brahmaputra flowing 1.2m above danger level; inundation in Pandu & Bharalu basin",
    evacuees: 14200,
  },
  {
    id: "d2",
    type: "LANDSLIDE",
    name: "Shillong Bypass Slope Failure",
    severity: "HIGH",
    status: "ACTIVE",
    region: "East Khasi Hills, Meghalaya",
    coordinates: { lat: 25.6100, lng: 91.9200 },
    radiusKm: 8.5,
    affectedArea: "22 km²",
    updatedAt: "2026-09-03T00:10:00+05:30",
    description: "Saturated clay soil landslide blocking NH-6 corridor connecting Guwahati-Shillong-Silchar",
    evacuees: 2450,
  },
  {
    id: "d3",
    type: "LANDSLIDE",
    name: "Dima Hasao Hill Debris Flow",
    severity: "CRITICAL",
    status: "ACTIVE",
    region: "Haflong, Dima Hasao, Assam",
    coordinates: { lat: 25.1700, lng: 93.0200 },
    radiusKm: 15.0,
    affectedArea: "95 km²",
    updatedAt: "2026-09-02T23:50:00+05:30",
    description: "Massive mudslide cutting off railway alignment and mountain highway links",
    evacuees: 5800,
  },
  {
    id: "d4",
    type: "FLOOD",
    name: "Papum Pare Flash Inundation",
    severity: "MODERATE",
    status: "MONITORING",
    region: "Itanagar / Naharlagun, Arunachal Pradesh",
    coordinates: { lat: 27.0844, lng: 93.6053 },
    radiusKm: 10.0,
    affectedArea: "35 km²",
    updatedAt: "2026-09-02T23:35:00+05:30",
    description: "Dikrong river water surge overflowing temporary bridges and drainage channels",
    evacuees: 920,
  },
  {
    id: "d5",
    type: "FLOOD",
    name: "Barak River Level Warning",
    severity: "LOW",
    status: "MONITORING",
    region: "Silchar, Cachar, Assam",
    coordinates: { lat: 24.8333, lng: 92.7789 },
    radiusKm: 18.0,
    affectedArea: "50 km²",
    updatedAt: "2026-09-02T23:10:00+05:30",
    description: "Barak river monitoring station at Annapurna Ghat nearing warning mark",
    evacuees: 0,
  },
];

// ─── REAL GEOGRAPHIC MAP MARKERS (Northeast India) ───────────
export interface MapMarker {
  id: string;
  type: "disaster" | "shelter" | "vehicle" | "checkpoint";
  label: string;
  risk: RiskLevel;
  lat: number;  // Real geographic Latitude
  lng: number;  // Real geographic Longitude
  details?: string;
  capacity?: number;
  isAccessible?: boolean;
}

export const mapMarkers: MapMarker[] = [
  // Disasters
  { id: "m1", type: "disaster", label: "Brahmaputra Flood", risk: "HIGH", lat: 26.1850, lng: 91.7450, details: "Active flood zone (12 km radius)" },
  { id: "m2", type: "disaster", label: "Shillong Slide", risk: "HIGH", lat: 25.6100, lng: 91.9200, details: "NH-6 slope failure active" },
  { id: "m3", type: "disaster", label: "Dima Hasao Slide", risk: "CRITICAL", lat: 25.1700, lng: 93.0200, details: "Debris flow on railway alignment" },
  { id: "m4", type: "disaster", label: "Itanagar Flash Flood", risk: "MODERATE", lat: 27.0844, lng: 93.6053, details: "Dikrong river surge watch" },
  { id: "m5", type: "disaster", label: "Silchar Barak Watch", risk: "LOW", lat: 24.8333, lng: 92.7789, details: "River level 82% of danger" },

  // Safe Shelters (All real Northeast relief centers)
  {
    id: "m6",
    type: "shelter",
    label: "Sarusajai Stadium Relief Hub",
    risk: "LOW",
    lat: 26.1210,
    lng: 91.7640,
    details: "Guwahati South • Cap: 1500 • Wheelchair Accessible",
    capacity: 1500,
    isAccessible: true,
  },
  {
    id: "m7",
    type: "shelter",
    label: "Gauhati Medical College Evac Wing",
    risk: "LOW",
    lat: 26.1550,
    lng: 91.7720,
    details: "Bhangagarh, Guwahati • Hospital Support • Cap: 600",
    capacity: 600,
    isAccessible: true,
  },
  {
    id: "m8",
    type: "shelter",
    label: "Shillong Polo Ground Camp",
    risk: "LOW",
    lat: 25.5890,
    lng: 91.8980,
    details: "East Khasi Hills • Cap: 1200 • Wheelchair Accessible",
    capacity: 1200,
    isAccessible: true,
  },
  {
    id: "m9",
    type: "shelter",
    label: "Tezpur Collegiate School Camp",
    risk: "LOW",
    lat: 26.6340,
    lng: 92.7980,
    details: "Sonitpur, Assam • Cap: 850 • Accessible",
    capacity: 850,
    isAccessible: true,
  },
  {
    id: "m10",
    type: "shelter",
    label: "Dimapur Municipal Shelter",
    risk: "LOW",
    lat: 25.9120,
    lng: 93.7310,
    details: "Dimapur, Nagaland • Cap: 1000",
    capacity: 1000,
    isAccessible: true,
  },

  // Emergency Response Vehicles
  { id: "m11", type: "vehicle", label: "NDRF 1st Bn (Patgaon)", risk: "LOW", lat: 26.1400, lng: 91.6800, details: "Fast rescue boat convoy deployed" },
  { id: "m12", type: "vehicle", label: "SDRF Assam Unit 4", risk: "LOW", lat: 26.1600, lng: 91.7300, details: "Pumping & embankment protection unit" },
  { id: "m13", type: "vehicle", label: "Mobile Medical Unit 3", risk: "LOW", lat: 25.5950, lng: 91.9050, details: "Shillong relief team on standby" },
];

// ─── EVACUATION ROUTES (Northeast India) ──────────────────────
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
  waypoints: Array<{ lat: number; lng: number }>;
}

export const routes: Route[] = [
  {
    id: "r1",
    from: "Guwahati Riverfront / Fancy Bazar",
    to: "Sarusajai Indoor Stadium Shelter",
    status: "SAFE",
    eta: 22,
    distance: 9.8,
    risk: "LOW",
    blockedRoadsAvoided: 3,
    lastUpdated: "30 sec ago",
    waypoints: [
      { lat: 26.1818, lng: 91.7420 },
      { lat: 26.1831, lng: 91.7454 },
      { lat: 26.1806, lng: 91.7458 },
      { lat: 26.1809, lng: 91.7509 },
      { lat: 26.1784, lng: 91.7506 },
      { lat: 26.1747, lng: 91.7497 },
      { lat: 26.1718, lng: 91.7483 },
      { lat: 26.1683, lng: 91.7465 },
      { lat: 26.1646, lng: 91.7466 },
      { lat: 26.1637, lng: 91.7466 },
      { lat: 26.1634, lng: 91.7462 },
      { lat: 26.1604, lng: 91.7427 },
      { lat: 26.1578, lng: 91.7406 },
      { lat: 26.1554, lng: 91.7395 },
      { lat: 26.1537, lng: 91.7399 },
      { lat: 26.1519, lng: 91.7407 },
      { lat: 26.1485, lng: 91.7409 },
      { lat: 26.1455, lng: 91.7409 },
      { lat: 26.1428, lng: 91.7420 },
      { lat: 26.1409, lng: 91.7415 },
      { lat: 26.1388, lng: 91.7402 },
      { lat: 26.1353, lng: 91.7367 },
      { lat: 26.1333, lng: 91.7364 },
      { lat: 26.1306, lng: 91.7366 },
      { lat: 26.1277, lng: 91.7395 },
      { lat: 26.1266, lng: 91.7432 },
      { lat: 26.1246, lng: 91.7485 },
      { lat: 26.1227, lng: 91.7494 },
      { lat: 26.1232, lng: 91.7509 },
      { lat: 26.1241, lng: 91.7523 },
      { lat: 26.1249, lng: 91.7539 },
      { lat: 26.1260, lng: 91.7551 },
      { lat: 26.1262, lng: 91.7572 },
      { lat: 26.1266, lng: 91.7590 },
      { lat: 26.1264, lng: 91.7598 },
      { lat: 26.1255, lng: 91.7596 },
      { lat: 26.1239, lng: 91.7611 },
      { lat: 26.1237, lng: 91.7623 },
      { lat: 26.1230, lng: 91.7634 },
      { lat: 26.1211, lng: 91.7637 },
    ],
  },
  {
    id: "r2",
    from: "Shillong Police Bazar",
    to: "Polo Ground Evacuation Hub",
    status: "CAUTION",
    eta: 16,
    distance: 3.8,
    risk: "MODERATE",
    blockedRoadsAvoided: 2,
    lastUpdated: "2 min ago",
    waypoints: [
      { lat: 25.5788, lng: 91.8833 },
      { lat: 25.5840, lng: 91.8900 },
      { lat: 25.5890, lng: 91.8980 },
    ],
  },
  {
    id: "r3",
    from: "NH-6 Sonapur Segment",
    to: "Jowai District Relief Camp",
    status: "BLOCKED",
    eta: 0,
    distance: 0,
    risk: "HIGH",
    blockedRoadsAvoided: 0,
    lastUpdated: "5 min ago",
    waypoints: [],
  },
];

// ─── WEATHER DATA (Northeast Monsoon Trend) ───────────────────
export interface WeatherReading {
  time: string;
  rainfall: number;    // mm/hr
  windSpeed: number;   // km/h
  temperature: number; // °C
  riskScore: number;   // 0-100
}

export const weatherTrend: WeatherReading[] = [
  { time: "14:00", rainfall: 14, windSpeed: 24, temperature: 27, riskScore: 40 },
  { time: "15:00", rainfall: 28, windSpeed: 38, temperature: 26, riskScore: 58 },
  { time: "16:00", rainfall: 52, windSpeed: 50, temperature: 25, riskScore: 76 },
  { time: "17:00", rainfall: 46, windSpeed: 45, temperature: 24, riskScore: 70 },
  { time: "18:00", rainfall: 68, windSpeed: 62, temperature: 23, riskScore: 88 },
  { time: "19:00", rainfall: 58, windSpeed: 55, temperature: 23, riskScore: 82 },
  { time: "20:00", rainfall: 38, windSpeed: 48, temperature: 24, riskScore: 68 },
  { time: "21:00", rainfall: 24, windSpeed: 36, temperature: 25, riskScore: 52 },
  { time: "22:00", rainfall: 16, windSpeed: 28, temperature: 25, riskScore: 42 },
];

// ─── RECENT ALERTS (Northeast India) ──────────────────────────
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
    title: "Brahmaputra Inundation Warning Issued",
    location: "Guwahati Ghats & Pandu Port",
    severity: "HIGH",
    timestamp: "2026-09-03T00:15:00+05:30",
    timeAgo: "2 min ago",
    isNew: true,
  },
  {
    id: "a2",
    title: "Landslide Risk Escalation on NH-6",
    location: "Shillong Bypass Corridor",
    severity: "HIGH",
    timestamp: "2026-09-03T00:08:00+05:30",
    timeAgo: "8 min ago",
    isNew: true,
  },
  {
    id: "a3",
    title: "Route NH-27 Jalukbari Waterlogging",
    location: "Guwahati West Entry",
    severity: "MODERATE",
    timestamp: "2026-09-02T23:55:00+05:30",
    timeAgo: "15 min ago",
  },
  {
    id: "a4",
    title: "Evacuation Alert — Low-Lying Riverine Areas",
    location: "Majuli & Upper Assam Floodplains",
    severity: "CRITICAL",
    timestamp: "2026-09-02T23:40:00+05:30",
    timeAgo: "28 min ago",
  },
  {
    id: "a5",
    title: "Shelter Capacity Alert",
    location: "Sarusajai Indoor Stadium Hub",
    severity: "MODERATE",
    timestamp: "2026-09-02T23:30:00+05:30",
    timeAgo: "38 min ago",
  },
  {
    id: "a6",
    title: "Heavy Rainfall Advisory",
    location: "Cherrapunji / East Khasi Ridge",
    severity: "LOW",
    timestamp: "2026-09-02T23:20:00+05:30",
    timeAgo: "48 min ago",
  },
];

// ─── ACCESSIBILITY ───────────────────────────────────────────
export const accessibilityData = {
  accessibleRoutes: { count: 35, change: -1, note: "3 under active assessment" },
  accessibleShelters: { count: 22, change: +2, note: "All primary hubs operational" },
  assistanceRequired: { count: 9, change: +2, note: "Elderly transport requests" },
  accessibleTransport: { count: 18, change: +3, note: "Wheelchair vans active" },
  features: [
    { label: "Wheelchair-accessible safe routes", active: true, count: 28 },
    { label: "Accessible evacuation shelters", active: true, count: 22 },
    { label: "Elderly & vulnerable assistance units", active: true, count: 9 },
    { label: "Regional language audio guides (Assamese/Khasi)", active: true, count: 6 },
    { label: "Blocked accessibility corridors", active: false, count: 2 },
  ],
};

// ─── VEHICLES & LOGISTICS (Northeast Emergency Response) ─────
export interface Vehicle {
  id: string;
  type: "NDRF" | "MEDICAL" | "SUPPLY" | "RESCUE";
  name: string;
  status: "DEPLOYED" | "STANDBY" | "RETURNING";
  location: string;
  mission: string;
}

export const vehicles: Vehicle[] = [
  { id: "v1", type: "NDRF", name: "1st Bn NDRF Team A", status: "DEPLOYED", location: "Guwahati Riverfront", mission: "Water Rescue & Evacuation" },
  { id: "v2", type: "MEDICAL", name: "SDRF Med Unit 4", status: "DEPLOYED", location: "Shillong Bypass", mission: "Slope Debris Trauma Care" },
  { id: "v3", type: "SUPPLY", name: "Assam Relief Convoy 3", status: "DEPLOYED", location: "NH-27 Khanapara", mission: "Drinking Water & Rations" },
  { id: "v4", type: "RESCUE", name: "Inflatable Boat Team 8", status: "STANDBY", location: "Pandu Port Ghat", mission: "Riverine Standby" },
  { id: "v5", type: "NDRF", name: "1st Bn Team C", status: "RETURNING", location: "Tezpur Base", mission: "Embankment Survey Completed" },
];
