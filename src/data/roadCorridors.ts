/**
 * SmartLogix SIH — Northeast India Physical Road Corridors
 * 
 * Sourced directly from Open Source Routing Machine (OSRM) with high-density road geometry.
 * Every polyline strictly follows the physical road network visible on OpenStreetMap tiles.
 */

import roadData from './roadCorridors.json'

export interface RoadCorridorDefinition {
  name: string
  distanceKm: number
  etaMin: number
  points: [number, number][]
}

export const roadCorridors = roadData as unknown as Record<string, RoadCorridorDefinition>

// In-memory cache for live OSRM queries to avoid redundant network traffic
const osrmGeometryCache = new Map<string, [number, number][]>()

/**
 * Dynamically queries OSRM to get true road-following coordinates between any locations.
 * Falls back to null if unreachable, letting the caller handle caching/fallback.
 */
export async function fetchOsmRoadGeometry(
  origin: [number, number],
  dest: [number, number],
  intermediates?: [number, number][]
): Promise<[number, number][] | null> {
  const allPts = [origin, ...(intermediates || []), dest]
  const cacheKey = allPts.map(([lat, lon]) => `${lat.toFixed(4)},${lon.toFixed(4)}`).join(';')

  if (osrmGeometryCache.has(cacheKey)) {
    return osrmGeometryCache.get(cacheKey)!
  }

  try {
    const coordString = allPts.map(([lat, lon]) => `${lon.toFixed(5)},${lat.toFixed(5)}`).join(';')
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(url, {
      headers: { 'User-Agent': 'SmartLogix-Disaster-GIS/1.0' },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) return null
    const data = await res.json()
    if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
      const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
        (pt: [number, number]) => [Number(pt[1].toFixed(5)), Number(pt[0].toFixed(5))]
      )
      if (coords.length > 0) {
        osrmGeometryCache.set(cacheKey, coords)
        return coords
      }
    }
  } catch (err) {
    console.warn('Live OSRM query failed or timed out:', err)
  }
  return null
}
