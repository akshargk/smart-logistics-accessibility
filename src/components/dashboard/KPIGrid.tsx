import { Bell, ShieldCheck, Truck, AlertTriangle } from 'lucide-react'
import { BklitMetricCard } from '../ui/bklit-metric'
import { useLanguage } from '../../context/LanguageContext'

export default function KPIGrid() {
  const { t } = useLanguage()

  const cards = [
    {
      icon: <Bell size={18} strokeWidth={2} />,
      label: t('kpi.activeAlerts') || 'Active Alerts',
      value: 14,
      delta: 4,
      deltaLabel: t('kpi.inLastHour') || 'in last hour',
      trend: 'up' as const,
      accentColor: 'var(--color-accent-red)',
      accentDim: 'var(--color-accent-red-dim)',
    },
    {
      icon: <ShieldCheck size={18} strokeWidth={2} />,
      label: t('kpi.safeShelters') || 'Safe Shelters',
      value: 52,
      delta: 8,
      deltaLabel: t('kpi.activeInGrid') || 'active in grid',
      trend: 'up' as const,
      accentColor: 'var(--color-accent-green)',
      accentDim: 'var(--color-accent-green-dim)',
    },
    {
      icon: <Truck size={18} strokeWidth={2} />,
      label: t('kpi.evacueesAssisted') || 'Evacuees Assisted',
      value: 148,
      delta: 8.2,
      deltaLabel: t('kpi.liveTriageLogs') || 'live triage logs',
      trend: 'up' as const,
      accentColor: 'var(--color-accent-blue)',
      accentDim: 'var(--color-accent-blue-dim)',
    },
    {
      icon: <AlertTriangle size={18} strokeWidth={2} />,
      label: t('kpi.highRiskZones') || 'High-Risk Zones',
      value: 9,
      delta: 3,
      deltaLabel: t('kpi.activeHazards') || 'active hazards',
      trend: 'up' as const,
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
        <BklitMetricCard key={card.label} {...card} index={i} />
      ))}
    </div>
  )
}
