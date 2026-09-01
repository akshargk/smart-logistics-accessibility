import { Bell, Route, Truck, AlertTriangle } from 'lucide-react'
import KPICard from './KPICard'
import { kpiData } from '../../data/mockData'

export default function KPIGrid() {
  const cards = [
    {
      icon: <Bell size={18} strokeWidth={2} />,
      label: 'Active Alerts',
      value: kpiData.activeAlerts.value,
      delta: kpiData.activeAlerts.delta,
      deltaLabel: kpiData.activeAlerts.deltaLabel,
      trend: kpiData.activeAlerts.trend,
      accentColor: 'var(--color-accent-red)',
      accentDim: 'var(--color-accent-red-dim)',
    },
    {
      icon: <Route size={18} strokeWidth={2} />,
      label: 'Safe Routes',
      value: kpiData.safeRoutes.value,
      delta: kpiData.safeRoutes.delta,
      deltaLabel: kpiData.safeRoutes.deltaLabel,
      trend: kpiData.safeRoutes.trend,
      accentColor: 'var(--color-accent-green)',
      accentDim: 'var(--color-accent-green-dim)',
    },
    {
      icon: <Truck size={18} strokeWidth={2} />,
      label: 'Vehicles / People',
      value: kpiData.vehiclesMonitored.value,
      delta: kpiData.vehiclesMonitored.delta,
      deltaLabel: kpiData.vehiclesMonitored.deltaLabel,
      trend: kpiData.vehiclesMonitored.trend,
      accentColor: 'var(--color-accent-blue)',
      accentDim: 'var(--color-accent-blue-dim)',
    },
    {
      icon: <AlertTriangle size={18} strokeWidth={2} />,
      label: 'High-Risk Zones',
      value: kpiData.highRiskZones.value,
      delta: kpiData.highRiskZones.delta,
      deltaLabel: kpiData.highRiskZones.deltaLabel,
      trend: kpiData.highRiskZones.trend,
      accentColor: 'var(--color-accent-orange)',
      accentDim: 'var(--color-accent-orange-dim)',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}
      className="grid-kpi"
      role="region"
      aria-label="Key performance indicators"
    >
      {cards.map((card, i) => (
        <KPICard key={card.label} {...card} index={i} />
      ))}
    </div>
  )
}
