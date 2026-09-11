import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, {
  HealthResponse,
  DashboardSummary,
  BackendDisasterEvent,
  BackendAlert,
  BackendSafeLocation,
  SafeRouteResponse,
  MongoStatsResponse,
  DemoScenarioResponse,
} from '../services/api'
import {
  disasters as fallbackDisasters,
  alerts as fallbackAlerts,
  routes as fallbackRoutes,
  kpiData as fallbackKpi,
} from '../data/mockData'

interface BackendContextType {
  backendOnline: boolean
  backendInfo: HealthResponse | null
  mongoStats: MongoStatsResponse | null
  dashboardData: DashboardSummary | null
  activeEvents: BackendDisasterEvent[]
  recentAlerts: BackendAlert[]
  safeLocations: BackendSafeLocation[]
  safeRoute: SafeRouteResponse | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  acknowledgeAlert: (alertId: string) => Promise<boolean>
  runDemoScenario: (scenario: 'safe' | 'flood' | 'landslide' | 'multi_hazard') => Promise<DemoScenarioResponse | null>
  calculateRoute: (latitude: number, longitude: number, preferAccessible?: boolean) => Promise<SafeRouteResponse | null>
  seedMongo: () => Promise<boolean>
}

const BackendContext = createContext<BackendContextType | null>(null)

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendOnline, setBackendOnline] = useState<boolean>(false)
  const [backendInfo, setBackendInfo] = useState<HealthResponse | null>(null)
  const [mongoStats, setMongoStats] = useState<MongoStatsResponse | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [activeEvents, setActiveEvents] = useState<BackendDisasterEvent[]>([])
  const [recentAlerts, setRecentAlerts] = useState<BackendAlert[]>([])
  const [safeLocations, setSafeLocations] = useState<BackendSafeLocation[]>([])
  const [safeRoute, setSafeRoute] = useState<SafeRouteResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      // Check health
      const health = await api.getHealth()
      setBackendOnline(true)
      setBackendInfo(health)

      // Concurrently query dashboard summary, locations, and mongo stats
      const [dash, locs, mStats] = await Promise.allSettled([
        api.getDashboard(),
        api.getSafeLocations(),
        api.getMongoStats(),
      ])

      if (dash.status === 'fulfilled') {
        setDashboardData(dash.value)
        setActiveEvents(dash.value.active_events || [])
        setRecentAlerts(dash.value.recent_alerts || [])
      }

      if (locs.status === 'fulfilled') {
        setSafeLocations(locs.value)
      }

      if (mStats.status === 'fulfilled') {
        setMongoStats(mStats.value)
      }

      setError(null)
    } catch (err: any) {
      console.warn('SmartLogix Backend: Operating in resilient local/cached mode', err)
      setBackendOnline(false)
      setError(err?.message || 'Backend connection offline')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    // Poll backend health and dashboard every 15s to keep UI updated
    const interval = setInterval(() => {
      refresh()
    }, 15000)
    return () => clearInterval(interval)
  }, [refresh])

  const acknowledgeAlert = async (alertId: string): Promise<boolean> => {
    try {
      const updated = await api.acknowledgeAlert(alertId)
      setRecentAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', acknowledged_at: updated.acknowledged_at } : a))
      )
      return true
    } catch (err) {
      console.error('Failed to acknowledge alert on backend', err)
      return false
    }
  }

  const runDemoScenario = async (
    scenario: 'safe' | 'flood' | 'landslide' | 'multi_hazard'
  ): Promise<DemoScenarioResponse | null> => {
    try {
      setLoading(true)
      const res = await api.runScenario(scenario)
      if (res.active_events) setActiveEvents(res.active_events)
      if (res.alerts) setRecentAlerts(res.alerts)
      if (res.safe_route) setSafeRoute(res.safe_route)
      return res
    } catch (err) {
      console.error('Failed to run demo scenario', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const calculateRoute = async (
    latitude: number,
    longitude: number,
    preferAccessible: boolean = false
  ): Promise<SafeRouteResponse | null> => {
    try {
      const res = await api.getSafeRoute(latitude, longitude, preferAccessible)
      setSafeRoute(res)
      return res
    } catch (err) {
      console.error('Failed to calculate safe route on backend', err)
      return null
    }
  }

  const seedMongo = async (): Promise<boolean> => {
    try {
      await api.seedMongo()
      await refresh()
      return true
    } catch (err) {
      console.error('Failed to seed MongoDB', err)
      return false
    }
  }

  return (
    <BackendContext.Provider
      value={{
        backendOnline,
        backendInfo,
        mongoStats,
        dashboardData,
        activeEvents,
        recentAlerts,
        safeLocations,
        safeRoute,
        loading,
        error,
        refresh,
        acknowledgeAlert,
        runDemoScenario,
        calculateRoute,
        seedMongo,
      }}
    >
      {children}
    </BackendContext.Provider>
  )
}

export const useBackend = (): BackendContextType => {
  const context = useContext(BackendContext)
  if (!context) {
    throw new Error('useBackend must be used within a BackendProvider')
  }
  return context
}

export default BackendContext
