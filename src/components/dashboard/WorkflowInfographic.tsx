import { motion } from 'motion/react'
import { Database, ShieldAlert, Accessibility, Navigation, Award, CheckCircle2, ChevronRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function WorkflowInfographic() {
  const { t } = useLanguage()

  const steps = [
    {
      num: '01',
      title: t('stepData'),
      sub: t('stepDataSub'),
      icon: Database,
      color: 'var(--color-accent-blue)',
      dim: 'var(--color-accent-blue-dim)',
      border: 'var(--color-accent-blue-border)',
    },
    {
      num: '02',
      title: t('stepRisk'),
      sub: t('stepRiskSub'),
      icon: ShieldAlert,
      color: 'var(--color-accent-red)',
      dim: 'var(--color-accent-red-dim)',
      border: 'var(--color-accent-red-border)',
    },
    {
      num: '03',
      title: t('stepA11y'),
      sub: t('stepA11ySub'),
      icon: Accessibility,
      color: 'var(--color-accent-pink)',
      dim: 'var(--color-accent-pink-dim)',
      border: 'var(--color-accent-pink-border)',
    },
    {
      num: '04',
      title: t('stepRouteGen'),
      sub: t('stepRouteGenSub'),
      icon: Navigation,
      color: 'var(--color-accent-orange)',
      dim: 'var(--color-accent-orange-dim)',
      border: 'var(--color-accent-orange-border)',
    },
    {
      num: '05',
      title: t('stepScoring'),
      sub: t('stepScoringSub'),
      icon: Award,
      color: 'var(--color-accent-yellow)',
      dim: 'var(--color-accent-yellow-dim)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    {
      num: '06',
      title: t('stepRec'),
      sub: t('stepRecSub'),
      icon: CheckCircle2,
      color: 'var(--color-accent-green)',
      dim: 'var(--color-accent-green-dim)',
      border: 'var(--color-accent-green-border)',
    },
  ]

  return (
    <div
      style={{
        padding: '14px 18px',
        borderRadius: 12,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top multi-color Indian accent strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #E67E22 0%, #C9A227 50%, #123C2A 100%)',
        }}
      />

      {/* Header pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '2px 7px',
              borderRadius: 4,
              background: 'rgba(230, 126, 34, 0.15)',
              color: '#D35400',
              border: '1px solid rgba(230, 126, 34, 0.35)',
            }}
          >
            PIPELINE
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {t('workflowTitle')}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-accent-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-green)', display: 'inline-block' }} />
          Public Service Autonomous Logistics
        </span>
      </div>

      {/* Pipeline steps grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isLast = idx === steps.length - 1
          return (
            <motion.div
              key={step.num}
              whileHover={{ y: -2, scale: 1.015 }}
              transition={{ duration: 0.15 }}
              style={{
                padding: '9px 10px',
                borderRadius: 8,
                background: step.dim,
                border: `1px solid ${step.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: 'var(--color-bg-surface)',
                      border: `1px solid ${step.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.color,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Icon size={12} strokeWidth={2.4} />
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {step.num}
                  </span>
                </div>
                {!isLast && (
                  <ChevronRight size={13} color="var(--color-text-muted)" style={{ opacity: 0.8 }} />
                )}
              </div>

              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2, marginTop: 2 }}>
                {step.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>
                {step.sub}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

}
