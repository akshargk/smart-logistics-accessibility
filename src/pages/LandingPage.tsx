import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, ArrowRight, Mountain, CloudRain, AlertTriangle,
  Route as RouteIcon, Accessibility, WifiOff, Globe, Truck, MapPin,
  Eye, Users, Wifi, ChevronDown, Zap, Brain, Bell, Navigation,
  Smartphone, Compass, Sparkles, Heart, Check, RotateCcw,
  AlertOctagon, Activity, Radio, Volume2, Layers, CheckCircle2,
  ExternalLink, Moon, Sun, ArrowUpRight, Lock, Database, RefreshCw
} from 'lucide-react'
import { useLanguage, LANGUAGES, type LanguageCode } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { useBackend } from '../context/BackendContext'
import DriftWall from '../components/react-bits/DriftWall'
import RiskMap from '../components/dashboard/RiskMap'

// ─── 0. SEAMLESS HERO VIDEO DUAL-BUFFER LOOP ───────────────────
function HeroVideoBackground({ isDark }: { isDark: boolean }) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const videoRef1 = useRef<HTMLVideoElement>(null)
  const videoRef2 = useRef<HTMLVideoElement>(null)
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1)
  const isTransitioning = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const v1 = videoRef1.current
    const v2 = videoRef2.current
    if (!v1 || !v2) return

    v1.play().catch(() => {})

    const checkCrossfade1 = () => {
      if (!v1.duration || isTransitioning.current) return
      if (v1.currentTime >= v1.duration - 1.0) {
        isTransitioning.current = true
        v2.currentTime = 0
        v2.play().then(() => {
          setActiveVideo(2)
          setTimeout(() => {
            v1.pause()
            v1.currentTime = 0
            isTransitioning.current = false
          }, 800)
        }).catch(() => {
          isTransitioning.current = false
        })
      }
    }

    const checkCrossfade2 = () => {
      if (!v2.duration || isTransitioning.current) return
      if (v2.currentTime >= v2.duration - 1.0) {
        isTransitioning.current = true
        v1.currentTime = 0
        v1.play().then(() => {
          setActiveVideo(1)
          setTimeout(() => {
            v2.pause()
            v2.currentTime = 0
            isTransitioning.current = false
          }, 800)
        }).catch(() => {
          isTransitioning.current = false
        })
      }
    }

    v1.addEventListener('timeupdate', checkCrossfade1)
    v2.addEventListener('timeupdate', checkCrossfade2)

    return () => {
      v1.removeEventListener('timeupdate', checkCrossfade1)
      v2.removeEventListener('timeupdate', checkCrossfade2)
    }
  }, [reducedMotion])

  if (reducedMotion) {
    return (
      <img
        src="/images/smartlogix-clean-hero.jpg"
        alt="Northeast India Mountain Highway with Emergency Response Unit"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          filter: isDark ? 'brightness(0.9) contrast(1.08)' : 'brightness(0.98) contrast(1.1) saturate(1.15)',
        }}
      />
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <video
        ref={videoRef1}
        src="/videos/northeast-hero.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          opacity: activeVideo === 1 ? 1 : 0,
          transition: 'opacity 800ms ease-in-out',
          filter: isDark ? 'brightness(0.85) contrast(1.08)' : 'brightness(0.98) contrast(1.1) saturate(1.15)',
        }}
      />
      <video
        ref={videoRef2}
        src="/videos/northeast-hero.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          opacity: activeVideo === 2 ? 1 : 0,
          transition: 'opacity 800ms ease-in-out',
          filter: isDark ? 'brightness(0.85) contrast(1.08)' : 'brightness(0.98) contrast(1.1) saturate(1.15)',
        }}
      />
    </div>
  )
}

// ─── 1. CINEMATIC NORTHEAST INDIA HERO ─────────────────────────
function HeroSection() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.07])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.15])

  const statPills = [
    { label: '8 States', icon: Mountain },
    { label: 'Real-time Alerts', icon: Bell },
    { label: 'Accessible Routes', icon: Accessibility },
    { label: 'Stronger Communities', icon: Users },
  ]

  return (
    <section
      id="hero-section"
      ref={heroRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '110px 40px 48px',
        overflow: 'hidden',
        background: isDark ? '#070B11' : '#F8FAFC',
        transition: 'background 300ms ease',
      }}
    >
      {/* ── BACKGROUND VIDEO WITH CINEMATIC PARALLAX & ADAPTIVE READABILITY OVERLAYS ── */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          scale: bgScale,
          zIndex: 0,
        }}
      >
        <HeroVideoBackground isDark={isDark} />

        {/* Cinematic gradient overlays - Non-destructive light readability layers */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--hero-overlay-vert)',
            transition: 'background 300ms ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--hero-overlay-horiz)',
            transition: 'background 300ms ease',
          }}
        />
        {/* Subtle Light Mode Vignette (none in dark mode) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--hero-vignette)',
            pointerEvents: 'none',
            transition: 'background 300ms ease',
          }}
        />
      </motion.div>

      {/* ── TOP LIVE TELEMETRY BADGES ── */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 30,
            background: 'var(--hero-surface)',
            backdropFilter: 'blur(14px)',
            border: '1px solid var(--hero-border)',
            boxShadow: 'var(--hero-shadow-sm)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--hero-text)',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
          CONNECTING NORTHEAST INDIA
        </div>

        {/* Live Weather Widget */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 14px',
            borderRadius: 30,
            background: 'var(--hero-surface)',
            backdropFilter: 'blur(14px)',
            border: '1px solid var(--hero-border)',
            boxShadow: 'var(--hero-shadow-sm)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--hero-text-muted)',
          }}
        >
          <CloudRain size={14} color="#0284C7" />
          <span>Tawang, Arunachal Pradesh · 12°C · Roads: Wet | Visibility: Moderate</span>
        </div>
      </motion.div>

      {/* ── HERO MAIN CONTENT & CALLS TO ACTION ── */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 760,
          margin: '36px 0 24px',
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 20,
            background: 'var(--hero-badge-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--hero-badge-border)',
            boxShadow: 'var(--hero-shadow-sm)',
            color: 'var(--hero-badge-text)',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.06em',
            marginBottom: 18,
          }}
        >
          DISASTER-AWARE · ACCESSIBLE · RESILIENT · LOGISTICS
        </div>

        <h1
          style={{
            fontSize: 'clamp(38px, 5.4vw, 70px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: 'var(--hero-text)',
            margin: '0 0 20px 0',
            textShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.8)'
              : '0 1px 2px rgba(255,255,255,0.85)',
          }}
        >
          Smarter Logistics <br />
          for a <span style={{ color: 'var(--hero-accent)', textShadow: isDark ? '0 0 32px rgba(34,197,94,0.5)' : 'none' }}>Safer</span> Tomorrow
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 1.4vw, 19px)',
            color: 'var(--hero-text-muted)',
            fontWeight: 600,
            lineHeight: 1.55,
            maxWidth: 600,
            marginBottom: 28,
            textShadow: isDark ? '0 2px 12px rgba(0,0,0,0.6)' : '0 1px 2px rgba(255,255,255,0.7)',
          }}
        >
          AI-powered route planning, real-time hazard alerts, and accessible logistics for a more connected Northeast India.
        </p>

        {/* Action Button — Single Primary CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
          <button
            onClick={() => {
              const el = document.getElementById('problem-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
              else navigate('/dashboard')
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              borderRadius: 30,
              background: '#22C55E',
              color: '#052E16',
              fontSize: 14,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(34,197,94,0.4), 0 0 0 1px rgba(255,255,255,0.2)',
              transition: 'all 200ms ease',
            }}
          >
            <span>Explore the Journey</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* 4 Feature Stat Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {statPills.map(p => {
            const Icon = p.icon
            return (
              <div
                key={p.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: 20,
                  background: 'var(--hero-pill-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--hero-pill-border)',
                  boxShadow: 'var(--hero-shadow-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--hero-pill-text)',
                }}
              >
                <Icon size={14} color={isDark ? '#22C55E' : '#16A34A'} />
                <span>{p.label}</span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── FLOATING ROUTE ADAPTATION TOAST ── */}
      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{
          position: 'absolute',
          top: '32%',
          right: '5%',
          maxWidth: 360,
          padding: '14px 18px',
          borderRadius: 14,
          background: 'var(--hero-surface)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: 'var(--hero-shadow-md)',
          zIndex: 3,
        }}
        className="hidden md:block"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#EF4444', letterSpacing: '0.05em' }}>
            LANDSLIDE DETECTED · NH-13
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--hero-text-muted)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
          Sela Pass corridor blocked at KM 45. SmartLogix calculated detour:
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            borderRadius: 8,
            background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 163, 74, 0.10)',
            border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(22, 163, 74, 0.22)',
            fontSize: 11,
            color: 'var(--hero-badge-text)',
            fontWeight: 700,
          }}
        >
          <span>Safe Bypass: +18 min</span>
          <span>♿ Low Gradient (3.8°)</span>
        </div>
      </motion.div>
    </section>
  )
}

// ─── 2. THE PROBLEM SECTION (EXACT REFERENCE: media_1789147212412.png) ─
function ProblemSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const metrics = [
    {
      value: '70%',
      title: 'Mountainous Terrain',
      desc: 'Young Himalayan geology & unstable rock slopes',
      color: isDark ? '#2DD4BF' : '#0D9488',
    },
    {
      value: '4–7 mo',
      title: 'Annual Monsoon Window',
      desc: 'Torrential cloudbursts & catastrophic flash floods',
      color: isDark ? '#2DD4BF' : '#0D9488',
    },
    {
      value: '22 km',
      title: 'Siliguri Corridor',
      desc: '"Chicken\'s Neck" single supply bottleneck for 8 states',
      color: isDark ? '#2DD4BF' : '#0D9488',
    },
    {
      value: '3.2x',
      title: 'Delay Multiplier',
      desc: 'Emergency medical transit times without AI rerouting',
      color: isDark ? '#2DD4BF' : '#0D9488',
    },
  ]

  const problemCards = [
    {
      id: 'bottlenecks',
      icon: RouteIcon,
      tag: 'SINGLE-POINT LIFELINES',
      tagColor: '#EF4444',
      accentColor: '#EF4444',
      title: 'Critical Infrastructure Bottlenecks',
      desc: 'The entire Northeast relies on the narrow 22km Siliguri Corridor and single-artery mountain roads. When a single bridge culvert washes out, all 8 states face immediate supply cutoffs.',
    },
    {
      id: 'extremes',
      icon: Mountain,
      tag: 'EXTREME WEATHER',
      tagColor: '#F97316',
      accentColor: '#F97316',
      title: 'Severe Terrain & Climate Extremes',
      desc: 'Cherrapunji and Mawsynram receive over 11,000mm of annual rainfall. Young, fragile Himalayan geology triggers sudden mudslides, washing out NH-13, NH-102, and NH-6 annually.',
    },
    {
      id: 'accessibility',
      icon: Accessibility,
      tag: 'VULNERABLE POPULATIONS',
      tagColor: '#A855F7',
      accentColor: '#A855F7',
      title: 'Accessibility Exclusion & Rough Detours',
      desc: 'Emergency bypass routes often feature steep gradients exceeding 14°, unpaved boulder beds, and destroyed footbridges, making evacuation impossible for wheelchair users, elderly, and medical transport.',
    },
  ]

  return (
    <section
      id="problem-section"
      style={{
        position: 'relative',
        padding: '90px 36px 85px',
        background: isDark ? '#070B11' : '#F8FAFC',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'background 300ms ease',
      }}
    >
      {/* Caution Diagonal Warning Stripe at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'repeating-linear-gradient(45deg, #EF4444, #EF4444 14px, #18181B 14px, #18181B 28px)',
          opacity: isDark ? 0.8 : 0.65,
        }}
      />

      {/* Background Mountainous Imagery with Dark/Light Opacity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: isDark ? 0.12 : 0.12,
          pointerEvents: 'none',
        }}
      >
        <img
          src="/images/nh13-landslide.jpg"
          alt="Northeast Landslide Environment"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isDark ? 'grayscale(60%) contrast(1.2)' : 'grayscale(35%) contrast(1.15) brightness(1.02)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'radial-gradient(ellipse at center, rgba(7,11,17,0.4) 0%, rgba(7,11,17,0.95) 85%)'
              : 'radial-gradient(ellipse at center, rgba(248,250,252,0.15) 0%, rgba(248,250,252,0.7) 85%)',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
        {/* Top Centered Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 24,
              background: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.1)',
              border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(239, 68, 68, 0.25)',
              color: isDark ? '#F87171' : '#DC2626',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: 16,
            }}
          >
            <AlertTriangle size={13} color="#EF4444" />
            <span>GROUND REALITY · NORTHEAST LOGISTICS CHALLENGE</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 3.8vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: isDark ? '#FFFFFF' : '#0F172A',
              margin: '0 0 16px 0',
              lineHeight: 1.15,
            }}
          >
            Northeast India's Unique Logistics Reality
          </h2>

          <p
            style={{
              fontSize: 'clamp(14px, 1.25vw, 17px)',
              color: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Geographic isolation, severe monsoon downpours, and unmonitored road grades turn logistical delays into life-threatening emergencies.
          </p>
        </div>

        {/* 4 Metric Cards Row (70%, 4-7 mo, 22 km, 3.2x) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 16,
            marginBottom: 36,
          }}
        >
          {metrics.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{
                padding: '22px 20px',
                borderRadius: 16,
                background: isDark ? 'rgba(13, 21, 32, 0.75)' : '#FFFFFF',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.09)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.35)' : '0 8px 20px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(28px, 3vw, 36px)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: m.color,
                  marginBottom: 6,
                  letterSpacing: '-0.02em',
                }}
              >
                {m.value}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', marginBottom: 4 }}>
                {m.title}
              </div>
              <div style={{ fontSize: 12, color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#64748B', lineHeight: 1.45 }}>
                {m.desc}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3 Major Problem Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {problemCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                whileHover={{ y: -4, borderColor: card.accentColor }}
                style={{
                  position: 'relative',
                  padding: '28px 24px',
                  borderRadius: 18,
                  background: isDark ? 'rgba(13, 21, 32, 0.85)' : '#FFFFFF',
                  backdropFilter: 'blur(14px)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.09)' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderTop: `3px solid ${card.accentColor}`,
                  boxShadow: isDark ? `0 12px 32px rgba(0, 0, 0, 0.45)` : '0 10px 24px rgba(0, 0, 0, 0.05)',
                  transition: 'all 200ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Top Row: Icon + Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${card.accentColor}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${card.accentColor}30`,
                      }}
                    >
                      <Icon size={22} color={card.accentColor} />
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: `${card.accentColor}15`,
                        border: `1px solid ${card.accentColor}35`,
                        color: card.accentColor,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>

                  {/* Title & Body */}
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', margin: '0 0 10px 0' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: 13, color: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569', lineHeight: 1.6, margin: 0 }}>
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── 3. SMARTLOGIX PIPELINE (COMPACT 4-STAGE INTELLIGENCE) ─────
function PipelineSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const steps = [
    {
      num: '01',
      title: '01 — INGEST & DETECT',
      subTag: 'SATELLITE & SENSOR INGESTION',
      subColor: isDark ? '#06B6D4' : '#0891B2',
      badge: 'Refresh rate: 3s · Coverage: 100% NE Grid',
      desc: 'Real-time satellite SAR radar, IoT slope displacement inclinometers, and verified crowdsourced hazard reports instantly flag rockfalls, cloudbursts, and flooded embankment breaches across the 8 states.',
      icon: Eye,
    },
    {
      num: '02',
      title: '02 — PREDICT & ANALYZE',
      subTag: 'MACHINE LEARNING SCORING',
      subColor: isDark ? '#F59E0B' : '#D97706',
      badge: 'Model Accuracy: 94.2% · Latency: <40ms',
      desc: 'Trained on 10,000+ historical Northeast weather and elevation vectors, our scikit-learn Random Forest model computes dynamic segment risk scores, evaluating slope stability, rainfall saturation, and bridge load tolerances.',
      icon: Brain,
    },
    {
      num: '03',
      title: '03 — OPTIMIZE & REROUTE',
      subTag: 'DYNAMIC GRAPH OPTIMIZATION',
      subColor: isDark ? '#10B981' : '#059669',
      badge: 'Detour Time Delta: -42 min avg savings',
      desc: 'OSRM routing graph autonomously computes Pareto-optimal alternative paths, strictly enforcing wheelchair incline gradients (<1:12), heavy ambulance clearance heights, and avoiding active mudslide corridors.',
      icon: Compass,
    },
    {
      num: '04',
      title: '04 — DELIVER & RESILIENCE',
      subTag: 'OFFLINE VECTOR BUFFERING',
      subColor: isDark ? '#14B8A6' : '#0D9488',
      badge: 'Offline Reliability: 100% Local DB sync',
      desc: 'Turn-by-turn navigation broadcasts to relief convoys with offline SQLite vector caching and audio guidance in 10 Northeast languages, guaranteeing zero data loss even during complete cellular blackouts.',
      icon: RouteIcon,
    },
  ]

  return (
    <section
      id="pipeline-section"
      style={{
        padding: '90px 36px',
        background: isDark ? '#090E16' : '#FFFFFF',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'background 300ms ease',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 14px',
              borderRadius: 20,
              background: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(22, 163, 74, 0.1)',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(22, 163, 74, 0.25)',
              color: isDark ? '#10B981' : '#15803D',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.07em',
              marginBottom: 14,
            }}
          >
            4-STAGE INTELLIGENCE PIPELINE
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.8vw, 44px)',
              fontWeight: 800,
              color: isDark ? '#FFFFFF' : '#0F172A',
              letterSpacing: '-0.025em',
              margin: '0 0 14px 0',
            }}
          >
            SmartLogix Response Pipeline
          </h2>
          <p style={{ fontSize: 15, color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', margin: 0, lineHeight: 1.6 }}>
            From raw satellite radar feeds to verified, accessible mountain lifelines in milliseconds.
          </p>
        </div>

        {/* 4 Wide Stacked Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
                whileHover={{ y: -2, borderColor: step.subColor }}
                style={{
                  padding: '24px 28px',
                  borderRadius: 16,
                  background: isDark ? 'rgba(13, 21, 32, 0.82)' : '#F8FAFC',
                  backdropFilter: 'blur(14px)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.09)' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.35)' : '0 6px 18px rgba(0, 0, 0, 0.04)',
                  transition: 'all 200ms ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${step.subColor}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${step.subColor}35`,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color={step.subColor} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: step.subColor,
                          letterSpacing: '0.07em',
                          marginBottom: 2,
                        }}
                      >
                        {step.subTag}
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Telemetry Badge on Right */}
                  <div
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#334155',
                    }}
                  >
                    {step.badge}
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569', lineHeight: 1.6, margin: '10px 0 0 58px' }}>
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── 4. LIVE TACTICAL ROUTE & MAP (EXISTING REAL SMARTLOGIX MAP) ──
function RouteMapSection() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedCorridor, setSelectedCorridor] = useState<string>('NH-13 Sela Pass')

  const corridors = [
    { name: 'NH-13 Sela Pass', state: 'Arunachal Pradesh', status: 'REROUTED', delta: '+18 min' },
    { name: 'NH-6 Guwahati-Silchar', state: 'Assam / Meghalaya', status: 'ACTIVE', delta: 'Clear' },
    { name: 'NH-29 Kohima Ridge', state: 'Nagaland', status: 'MONITORED', delta: 'High Rain' },
    { name: 'NH-306 Barak Valley', state: 'Mizoram', status: 'SAFE', delta: 'Low Gradient' },
  ]

  return (
    <section
      id="route-section"
      style={{
        padding: '85px 36px',
        background: isDark ? '#070B11' : '#F8FAFC',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        position: 'relative',
        zIndex: 1,
        transition: 'background 300ms ease',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                borderRadius: 20,
                background: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                border: isDark ? '1px solid rgba(14, 165, 233, 0.35)' : '1px solid rgba(2, 132, 199, 0.25)',
                color: isDark ? '#38BDF8' : '#0284C7',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
                marginBottom: 10,
              }}
            >
              <Navigation size={13} />
              REAL-TIME NORTHEAST GIS CORRIDOR MONITOR
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Live Route Navigation &amp; Hazard Overlay
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/map')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 10,
                background: '#22C55E',
                color: '#052E16',
                fontSize: 13,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
              }}
            >
              <span>Full Tactical GIS</span>
              <ArrowUpRight size={14} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.12)',
                color: isDark ? '#FFFFFF' : '#0F172A',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <span>Command Dashboard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Corridor Selection Bar */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 12,
            marginBottom: 20,
          }}
        >
          {corridors.map(c => {
            const isSelected = selectedCorridor === c.name
            return (
              <button
                key={c.name}
                onClick={() => setSelectedCorridor(c.name)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: isSelected
                    ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(22,163,74,0.12)')
                    : (isDark ? 'rgba(13,21,32,0.8)' : '#FFFFFF'),
                  border: isSelected
                    ? `1px solid ${isDark ? '#22C55E' : '#16A34A'}`
                    : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'),
                  color: isSelected
                    ? (isDark ? '#22C55E' : '#15803D')
                    : (isDark ? 'rgba(255,255,255,0.85)' : '#334155'),
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 150ms ease',
                }}
              >
                <span>{c.name}</span>
                <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 500 }}>({c.state})</span>
                <span
                  style={{
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: c.status === 'REROUTED'
                      ? (isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)')
                      : (isDark ? 'rgba(34,197,94,0.2)' : 'rgba(22,163,74,0.15)'),
                    color: c.status === 'REROUTED' ? '#EF4444' : (isDark ? '#22C55E' : '#15803D'),
                    fontWeight: 800,
                  }}
                >
                  {c.delta}
                </span>
              </button>
            )
          })}
        </div>

        {/* Real Working Leaflet RiskMap embedded with Stacking Context Isolation */}
        <div
          style={{
            position: 'relative',
            borderRadius: 18,
            overflow: 'hidden',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 16px 40px rgba(0,0,0,0.08)',
            isolation: 'isolate',
            zIndex: 1,
          }}
        >
          <RiskMap fullHeight={false} initialFilter="all" highlightCorridor={selectedCorridor} />
        </div>
      </div>
    </section>
  )
}

// ─── 5. ACCESSIBILITY SECTION (EXACT REFERENCE: media_1789147220591.png)
function AccessibilitySection() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const personas = [
    {
      title: 'Wheelchair Users',
      desc: 'Incline gradients strictly audited under 1:12; alerts on washed-out ramps, unpaved debris, and slippery slopes.',
      icon: Accessibility,
      color: isDark ? '#3B82F6' : '#2563EB',
    },
    {
      title: 'Visually Impaired',
      desc: 'High-contrast topographic displays, full ARIA screen-reader semantics, and turn-by-turn voice guidance.',
      icon: Eye,
      color: isDark ? '#A855F7' : '#9333EA',
    },
    {
      title: 'Elderly & Evacuees',
      desc: 'Elevation-buffered routing avoids steep mountain climbs during emergency community flood evacuations.',
      icon: Heart,
      color: isDark ? '#EAB308' : '#D97706',
    },
    {
      title: 'Relief Logistics Operators',
      desc: 'Live bridge load limits, mountain hairpin turn warnings, low overhead clearances, and roadbed stability ratings.',
      icon: Truck,
      color: isDark ? '#10B981' : '#059669',
    },
    {
      title: 'Remote Hamlets',
      desc: 'Last-mile foot suspension bridge status, river water levels, and rural ferry operational schedules.',
      icon: MapPin,
      color: isDark ? '#F97316' : '#EA580C',
    },
  ]

  return (
    <section
      id="a11y-section"
      style={{
        position: 'relative',
        padding: '90px 36px',
        background: isDark ? '#090E16' : '#FFFFFF',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'background 300ms ease',
      }}
    >
      {/* Subtle DriftWall terrain layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isDark ? 0.12 : 0.10,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <DriftWall columns={4} tileWidth={220} tileHeight={140} speed={22} overlayColor="transparent" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: 20,
              background: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(22, 163, 74, 0.1)',
              border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(22, 163, 74, 0.25)',
              color: isDark ? '#22C55E' : '#15803D',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: 16,
            }}
          >
            <Accessibility size={13} />
            <span>UNIVERSAL INCLUSION CHARTER</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 3.8vw, 46px)',
              fontWeight: 800,
              color: isDark ? '#FFFFFF' : '#0F172A',
              letterSpacing: '-0.025em',
              margin: '0 0 14px 0',
            }}
          >
            Accessibility for Everyone
          </h2>

          <p style={{ fontSize: 15, color: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569', lineHeight: 1.6, margin: 0 }}>
            Emergency routes should move people forward — not leave anyone behind. Audited slope grades, wheelchair verification, and voice assistance.
          </p>
        </div>

        {/* 5 Persona Cards in a Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {personas.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                whileHover={{ y: -4, borderColor: p.color }}
                style={{
                  padding: '24px 20px',
                  borderRadius: 16,
                  background: isDark ? 'rgba(13, 21, 32, 0.85)' : '#F8FAFC',
                  backdropFilter: 'blur(14px)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.09)' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.35)' : '0 6px 18px rgba(0, 0, 0, 0.04)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 200ms ease',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: `${p.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${p.color}35`,
                    marginBottom: 16,
                  }}
                >
                  <Icon size={22} color={p.color} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', margin: '0 0 8px 0' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 12, color: isDark ? 'rgba(255, 255, 255, 0.68)' : '#64748B', lineHeight: 1.5, margin: 0 }}>
                  {p.desc}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Accessibility Charter Quote Banner */}
        <div
          style={{
            padding: '28px 32px',
            borderRadius: 16,
            background: isDark ? 'rgba(6, 26, 18, 0.85)' : 'rgba(240, 253, 244, 0.95)',
            border: isDark ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(22, 163, 74, 0.3)',
            boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(34, 197, 94, 0.1)' : '0 8px 24px rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(17px, 2vw, 22px)',
              fontWeight: 800,
              fontStyle: 'italic',
              color: isDark ? '#FFFFFF' : '#064E3B',
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}
          >
            “Routes should move people forward — not leave anyone behind.”
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: isDark ? '#22C55E' : '#15803D',
              letterSpacing: '0.1em',
            }}
          >
            SMARTLOGIX ACCESSIBILITY CHARTER · SMART INDIA HACKATHON 2026
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 6. OFFLINE RESILIENCE ARCHITECTURE (EXACT REFERENCE: media_1789147224845.png) ─
function OfflineResilienceSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTier, setActiveTier] = useState<number>(0)

  const tiers = [
    {
      tabLabel: '1. ONLINE',
      dotColor: '#22C55E',
      header: 'ACTIVE PROTOCOL STACK · 1. ONLINE',
      badgeText: '4G/5G ACTIVE',
      badgeColor: '#22C55E',
      title: 'Real-Time Multi-Cloud WebSocket Dispatch',
      desc: 'High-bandwidth active operational state. Pushes instant telemetry, sensor readings, and satellite imagery updates every 3 seconds across the 8-state grid.',
      protocol: 'Full-Duplex WSS + TLS 1.3',
      stream: 'Full Bandwidth (>10 Mbps)',
      storage: 'MongoDB Atlas + Distributed Edge Nodes',
      integrity: 'Continuous Verification · 3s Heartbeat',
      phoneStatus: 'LIVE NETWORK CONNECTED',
      phoneSub: 'Full Mesh Active · 8 States Streaming',
      phoneDetail: 'WebSocket Connected · 28ms latency · Auto-syncs via CRDT on reconnect',
    },
    {
      tabLabel: '2. LIMITED 2G',
      dotColor: '#F59E0B',
      header: 'ACTIVE PROTOCOL STACK · 2. LIMITED 2G',
      badgeText: '2G/EDGE ACTIVE',
      badgeColor: '#F59E0B',
      title: 'Compressed Vector Differential Broadcast',
      desc: 'Low-bandwidth hill transmitter mode. Compresses routing vectors into 12kbps JSON payloads, prioritizing vital turn-by-turn road gradient updates and emergency SMS.',
      protocol: 'HTTP/2 Compact Brotli + SMS fallback',
      stream: '12 kbps Throttled Packet Stream',
      storage: 'IndexedDB Local Cache + Edge Buffer',
      integrity: 'Differential Checksums (CRC32)',
      phoneStatus: 'LOW-BANDWIDTH 2G MESH',
      phoneSub: 'Vector Geometry Compression Active',
      phoneDetail: 'Packet Latency 340ms · Priority Relief Escort Stream Engaged',
    },
    {
      tabLabel: '3. OFFLINE',
      dotColor: '#EF4444',
      header: 'ACTIVE PROTOCOL STACK · 3. OFFLINE',
      badgeText: 'OFFLINE MODE',
      badgeColor: '#EF4444',
      title: 'Zero-Signal Autonomous Topology Engine',
      desc: 'Complete cell blackout operational protocol. Client-side Dijkstra and A* pathfinding executes purely in browser memory using pre-downloaded Northeast corridor topological graphs.',
      protocol: 'Local PWA Service Worker + WebAssembly',
      stream: '0 kbps Needed (Full Isolation)',
      storage: 'Local SQLite WebAssembly + IndexedDB',
      integrity: 'SHA-256 Ledger Cryptographic Hash',
      phoneStatus: 'AUTONOMOUS LOCAL RUNTIME',
      phoneSub: 'Zero Cellular Signal Required',
      phoneDetail: 'Running on local browser graph · 0 kbps internet dependency',
    },
    {
      tabLabel: '4. CACHED ROUTES',
      dotColor: '#38BDF8',
      header: 'ACTIVE PROTOCOL STACK · 4. CACHED ROUTES',
      badgeText: 'CACHED BUFFER',
      badgeColor: '#38BDF8',
      title: 'Pre-Buffered High-Risk Mountain Corridors',
      desc: 'Proactively indexes all 52 high-risk mountain highway passes (NH-13, NH-6, NH-29, NH-102) with high-density contour maps and shelter coordinates consuming <15 MB total disk space.',
      protocol: 'Pre-cached Vector Tiles + Protobuf',
      stream: 'Instant RAM Fetch (<1ms)',
      storage: 'Persistent Cache Storage API',
      integrity: 'Pre-verified Government GIS Vectors',
      phoneStatus: '52 CORRIDORS PERSISTED',
      phoneSub: 'High-Altitude Pass Vectors Cached',
      phoneDetail: '14.2 MB total footprint · Complete Northeast Offline Cartography',
    },
    {
      tabLabel: '5. NETWORK RESTORED',
      dotColor: '#22C55E',
      header: 'ACTIVE PROTOCOL STACK · 5. NETWORK RESTORED',
      badgeText: 'SYNC RECONNECTED',
      badgeColor: '#22C55E',
      title: 'Conflict-Free Replicated Event Synchronization',
      desc: 'When an emergency convoy exits a valley blackout, all queued hazard observations, road blockage marks, and survivor medical logs replay via CRDT without overwriting concurrent dispatch signals.',
      protocol: 'CRDT JSON Delta Sync + TLS 1.3',
      stream: 'Burst Synchronization Stream',
      storage: 'Bi-directional Cloud Reconciliation',
      integrity: 'Zero Data Loss Guarantee Verified',
      phoneStatus: 'CLOUD MESH RECONCILED',
      phoneSub: 'All Field Telemetry Replayed',
      phoneDetail: '100% Data Preserved · Re-synchronized in 820ms',
    },
  ]

  const currentTier = tiers[activeTier]

  const guarantees = [
    {
      title: 'Zero Data Loss Guarantee',
      desc: 'Local SQLite queue preserves every driver event',
      icon: Check,
    },
    {
      title: 'Automatic Reconciliation',
      desc: 'CRDT-based synchronization on reconnect',
      icon: RefreshCw,
    },
    {
      title: 'Cryptographic Ledger',
      desc: 'SHA-256 integrity hash on local store',
      icon: Shield,
    },
    {
      title: 'Pre-Cached Corridors',
      desc: 'High-risk mountain passes cached in <15 MB',
      icon: CheckCircle2,
    },
  ]

  return (
    <section
      id="resilience-section"
      style={{
        padding: '56px 24px',
        background: isDark ? '#060A0E' : '#F8FAFC',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
        transition: 'background-color 200ms ease',
      }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Section Header (Exact Match to Reference: media_1789150193523.png) */}
        <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 18px' }}>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.6vw, 42px)',
              fontWeight: 800,
              color: isDark ? '#FFFFFF' : '#0F172A',
              letterSpacing: '-0.025em',
              margin: '0 0 8px 0',
            }}
          >
            Built for When the Network Fails
          </h2>
          <p style={{ fontSize: 14.5, color: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569', lineHeight: 1.55, margin: 0 }}>
            In rugged mountain ravines, cell towers wash out during monsoon storms. SmartLogix guarantees continuity from full cloud mesh to zero cellular connectivity.
          </p>
        </div>

        {/* 5 Interactive Pill Tabs (Exact Match to Reference: media_1789150193523.png) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 22,
          }}
        >
          {tiers.map((t, idx) => {
            const isSelected = activeTier === idx
            return (
              <button
                key={t.tabLabel}
                onClick={() => setActiveTier(idx)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 16px',
                  borderRadius: 20,
                  background: isSelected
                    ? isDark ? 'rgba(34, 197, 94, 0.08)' : '#DCFCE7'
                    : isDark ? 'rgba(12, 18, 26, 0.85)' : '#FFFFFF',
                  border: isSelected
                    ? '1.5px solid #22C55E'
                    : isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #CBD5E1',
                  color: isSelected
                    ? isDark ? '#FFFFFF' : '#14532D'
                    : isDark ? 'rgba(255, 255, 255, 0.75)' : '#475569',
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                  boxShadow: isSelected
                    ? isDark ? '0 0 14px rgba(34, 197, 94, 0.25)' : '0 2px 6px rgba(34, 197, 94, 0.15)'
                    : 'none',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: t.dotColor,
                    display: 'inline-block',
                  }}
                />
                <span>{t.tabLabel}</span>
              </button>
            )
          })}
        </div>

        {/* Main Side-by-Side Cards (Exact Match to Reference: 75-80% Main Card, 20-25% Phone) */}
        <div className="resilience-main-cards" style={{ marginBottom: 16 }}>
          {/* Left Standalone Card */}
          <div
            style={{
              borderRadius: 18,
              background: isDark ? '#0C131D' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
              boxShadow: isDark ? '0 12px 36px rgba(0, 0, 0, 0.45)' : '0 10px 30px rgba(0, 0, 0, 0.05)',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Header inside Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#22C55E' : '#16A34A', letterSpacing: '0.06em' }}>
                  {currentTier.header}
                </span>
                <span
                  style={{
                    padding: '3px 9px',
                    borderRadius: 6,
                    background: `${currentTier.badgeColor}18`,
                    border: `1px solid ${currentTier.badgeColor}40`,
                    color: currentTier.badgeColor,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                  }}
                >
                  {currentTier.badgeText}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.015em' }}>
                {currentTier.title}
              </h3>
              <p style={{ fontSize: 13.5, color: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569', lineHeight: 1.55, margin: 0 }}>
                {currentTier.desc}
              </p>
            </div>

            {/* 4-Grid Protocol Specs (Bottom Row of Left Card) */}
            <div className="resilience-specs-row" style={{ marginTop: 24 }}>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B', letterSpacing: '0.04em' }}>
                  PROTOCOL
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', marginTop: 4 }}>
                  {currentTier.protocol}
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B', letterSpacing: '0.04em' }}>
                  PAYLOAD STREAM
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#22C55E' : '#16A34A', marginTop: 4 }}>
                  {currentTier.stream}
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B', letterSpacing: '0.04em' }}>
                  STORAGE ENGINE
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', marginTop: 4 }}>
                  {currentTier.storage}
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B', letterSpacing: '0.04em' }}>
                  DATA INTEGRITY
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#38BDF8' : '#0284C7', marginTop: 4 }}>
                  {currentTier.integrity}
                </div>
              </div>
            </div>
          </div>

          {/* Right Standalone Phone Mockup Card */}
          <div
            style={{
              borderRadius: 22,
              background: isDark ? '#0A1017' : '#FFFFFF',
              border: isDark ? '1.5px solid rgba(255, 255, 255, 0.14)' : '1.5px solid #CBD5E1',
              boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.5)' : '0 12px 30px rgba(0, 0, 0, 0.08)',
              padding: '14px 14px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: 300,
              margin: '0 auto',
            }}
          >
            <div>
              {/* Phone Speaker Slit */}
              <div
                style={{
                  width: 38,
                  height: 3.5,
                  borderRadius: 3,
                  background: isDark ? 'rgba(255, 255, 255, 0.18)' : '#CBD5E1',
                  margin: '0 auto 8px',
                }}
              />

              {/* Status Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 9.5,
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#64748B',
                  marginBottom: 8,
                }}
              >
                <span>09:41</span>
                <span>• 4G/5G LTE</span>
              </div>

              {/* App Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    border: '1.5px solid #22C55E',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 11.5, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  SmartLogix Pocket
                </span>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: '7px 10px',
                  borderRadius: 7,
                  background: isDark ? 'rgba(34, 197, 94, 0.12)' : '#DCFCE7',
                  border: isDark ? '1px solid rgba(34, 197, 94, 0.28)' : '1px solid #86EFAC',
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: 9.5, fontWeight: 800, color: isDark ? '#22C55E' : '#15803D', letterSpacing: '0.04em' }}>
                  {currentTier.phoneStatus}
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: isDark ? '#FFFFFF' : '#0F172A', marginTop: 2, lineHeight: 1.25 }}>
                  {currentTier.phoneSub}
                </div>
              </div>

              {/* Route Curve Screen (Matching Exact Curve in media_1789150193523.png) */}
              <div
                style={{
                  height: 78,
                  position: 'relative',
                  background: isDark ? '#060A0F' : '#F8FAFC',
                  borderRadius: 8,
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
                  padding: '6px 8px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                <svg width="100%" height="48" viewBox="0 0 200 48" fill="none">
                  <path
                    d="M 12 38 C 65 40, 135 44, 188 10"
                    stroke="#22C55E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="38" r="3.5" fill="#38BDF8" />
                  <circle cx="188" cy="10" r="3.5" fill="#22C55E" />
                </svg>
                <div style={{ fontSize: 8.5, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B' }}>
                  NH-13 Corridor · Phase 1/5
                </div>
              </div>
            </div>

            {/* Footer Telemetry below Chart */}
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 9.5, color: isDark ? 'rgba(255,255,255,0.65)' : '#64748B', lineHeight: 1.35 }}>
                WebSocket Connected · 28ms latency
              </div>
              <div style={{ fontSize: 8.5, color: isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8', marginTop: 2 }}>
                Auto-syncs via CRDT on reconnect
              </div>
            </div>
          </div>
        </div>

        {/* 4 Resilience Guarantee Cards (Bottom Row: Exact Match to Reference) */}
        <div className="resilience-bottom-row">
          {guarantees.map(g => {
            const Icon = g.icon
            return (
              <div
                key={g.title}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: isDark ? 'rgba(12, 19, 29, 0.85)' : '#FFFFFF',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <Icon size={16} color="#22C55E" />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', marginBottom: 2 }}>
                    {g.title}
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B', lineHeight: 1.35 }}>
                    {g.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── 8. MILESTONES & IMPACT (EXACT REFERENCE: media_1789147248900.png) ──
function ImpactSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const milestones = [
    {
      metric: '52+',
      color: '#22C55E', // emerald
      icon: Shield,
      iconColor: '#14B8A6',
      label: 'Safe Corridors',
      desc: 'Real-time verified routes',
    },
    {
      metric: '38',
      color: '#06B6D4', // cyan
      icon: Accessibility,
      iconColor: '#06B6D4',
      label: 'Accessible Routes',
      desc: 'Incline audited paths',
    },
    {
      metric: '8',
      color: '#F97316', // orange
      icon: Users,
      iconColor: '#F97316',
      label: 'States Protected',
      desc: 'Northeast India coverage',
    },
    {
      metric: '< 5m',
      color: '#EF4444', // red
      icon: Zap,
      iconColor: '#EF4444',
      label: 'Alert Broadcast',
      desc: 'Early disaster response',
    },
    {
      metric: '148',
      color: '#F59E0B', // amber
      icon: Truck,
      iconColor: '#F59E0B',
      label: 'Fleet Monitored',
      desc: 'Emergency response units',
    },
  ]

  return (
    <section
      id="impact-section"
      style={{
        position: 'relative',
        padding: '95px 36px 85px',
        background: isDark ? '#070B11' : '#F8FAFC',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
        overflow: 'hidden',
        transition: 'background-color 200ms ease',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Section Header (Matching Screenshot 5) */}
        <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 20,
              background: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.15)',
              border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.4)',
              color: isDark ? '#22C55E' : '#16A34A',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: 14,
            }}
          >
            PROJECT MILESTONES
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.8vw, 44px)',
              fontWeight: 800,
              color: isDark ? '#FFFFFF' : '#0F172A',
              letterSpacing: '-0.025em',
              margin: '0 0 14px 0',
            }}
          >
            A Safer, Stronger Tomorrow
          </h2>
          <p style={{ fontSize: 15, color: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569', margin: 0, lineHeight: 1.5 }}>
            Measurable disaster resilience and accessible logistics for the 8 states of Northeast India.
          </p>
        </div>

        {/* 5 Impact Cards in a Row (Matching Screenshot 5) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {milestones.map((m, i) => {
            const Icon = m.icon
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: '28px 20px',
                  borderRadius: 18,
                  background: isDark ? 'rgba(13, 21, 32, 0.85)' : '#FFFFFF',
                  backdropFilter: 'blur(14px)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.09)' : '1px solid #E2E8F0',
                  textAlign: 'center',
                  boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 200ms ease',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: `${m.iconColor}18`,
                    border: `1px solid ${m.iconColor}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Icon size={20} color={m.iconColor} />
                </div>

                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: m.color,
                    marginBottom: 6,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {m.metric}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 12, color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#64748B', lineHeight: 1.4 }}>
                  {m.desc}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Horizon Glow Bar at the Bottom Edge (Matching Screenshot 5) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, transparent 0%, #10B981 50%, transparent 100%)',
          boxShadow: isDark ? '0 0 24px #10B981' : '0 0 16px rgba(16, 185, 129, 0.4)',
        }}
      />
    </section>
  )
}

// ─── 9. SPEAK YOUR LANGUAGE (10 NE LANGUAGES) ───────────────────
function MultilingualSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { language, setLanguage } = useLanguage()

  const languagesList: { code: LanguageCode; native: string; english: string; region: string }[] = [
    { code: 'en', native: 'English', english: 'English', region: 'All States' },
    { code: 'as', native: 'অসমীয়া', english: 'Assamese', region: 'Assam' },
    { code: 'bn', native: 'বাংলা', english: 'Bengali', region: 'Assam / Tripura' },
    { code: 'mni', native: 'মৈতৈলোন', english: 'Manipuri', region: 'Manipur' },
    { code: 'lus', native: 'Mizo ṭawng', english: 'Mizo', region: 'Mizoram' },
    { code: 'kha', native: 'Ka Ktien Khasi', english: 'Khasi', region: 'Meghalaya' },
    { code: 'grt', native: 'A·chik', english: 'Garo', region: 'Meghalaya' },
    { code: 'trp', native: 'Kokborok', english: 'Kokborok', region: 'Tripura' },
    { code: 'ne', native: 'नेपाली', english: 'Nepali', region: 'Sikkim' },
    { code: 'hi', native: 'हिन्दी', english: 'Hindi', region: 'Pan-India' },
  ]

  return (
    <section
      id="languages-section"
      style={{
        padding: '80px 36px',
        background: isDark ? '#090E16' : '#FFFFFF',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
        transition: 'background-color 200ms ease',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 30px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 20,
              background: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.15)',
              border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.4)',
              color: isDark ? '#22C55E' : '#16A34A',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.06em',
              marginBottom: 10,
            }}
          >
            NATIVE LINGUISTIC INCLUSION
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)', fontWeight: 800, margin: '6px 0 10px', color: isDark ? '#FFFFFF' : '#0F172A' }}>
            Speak Your Language
          </h2>
          <p style={{ fontSize: 15, color: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569', margin: 0 }}>
            Northeast India, in your language. Switch below to instantly translate the entire platform.
          </p>
        </div>

        {/* 10 Language Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
            maxWidth: 920,
            margin: '0 auto',
          }}
        >
          {languagesList.map(lang => {
            const isSelected = language === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 30,
                  background: isSelected
                    ? '#22C55E'
                    : isDark ? 'rgba(13, 21, 32, 0.8)' : '#F1F5F9',
                  color: isSelected
                    ? '#052E16'
                    : isDark ? '#FFFFFF' : '#1E293B',
                  border: isSelected
                    ? '1px solid #22C55E'
                    : isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #CBD5E1',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: isSelected ? '0 4px 16px rgba(34,197,94,0.35)' : 'none',
                  transition: 'all 160ms ease',
                }}
              >
                <span>{lang.native}</span>
                <span
                  style={{
                    fontSize: 11,
                    opacity: isSelected ? 0.85 : 0.6,
                    fontWeight: 500,
                  }}
                >
                  ({lang.english})
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── 10. FINAL LAUNCH CTA & UNIFIED COMMAND FOOTER ──────────────
function FinalLaunchSection() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section
      id="launch-section"
      style={{
        position: 'relative',
        padding: '96px 24px',
        overflow: 'hidden',
        background: isDark ? '#060A11' : '#F8FAFC',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'background-color 300ms ease, border-color 300ms ease',
      }}
    >
      {/* Sophisticated ambient depth glow (radial gradient) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(900px, 92vw)',
          height: '420px',
          background: isDark
            ? 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.04) 45%, transparent 75%)'
            : 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.14) 0%, rgba(16, 185, 129, 0.04) 48%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Subtle modern tech dot-grid texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
            : 'radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.7,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Centered enterprise glass card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
          padding: '48px 32px',
          borderRadius: 24,
          background: isDark
            ? 'linear-gradient(180deg, rgba(13, 21, 32, 0.8) 0%, rgba(9, 14, 22, 0.9) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.92) 100%)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: isDark
            ? '0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02), inset 0 1px 0 #FFFFFF',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 20,
            background: isDark ? 'rgba(34, 197, 94, 0.14)' : 'rgba(34, 197, 94, 0.10)',
            border: isDark ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(34, 197, 94, 0.35)',
            color: isDark ? '#22C55E' : '#15803D',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: 20,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
          READY FOR ACTIVE DEPLOYMENT
        </div>

        {/* Heading */}
        <h2
          style={{
            fontSize: 'clamp(28px, 4.2vw, 44px)',
            fontWeight: 800,
            color: isDark ? '#FFFFFF' : '#0B1320',
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
            margin: '0 0 16px 0',
          }}
        >
          Let’s Build a More Inclusive, <br />
          <span style={{ color: isDark ? '#34D399' : '#16A34A' }}>Resilient Northeast India</span>
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 'clamp(15px, 1.2vw, 17px)',
            color: isDark ? 'rgba(255, 255, 255, 0.8)' : '#475569',
            maxWidth: 580,
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Explore the live command center, test terrain routing algorithms, and experience real-time disaster resilience.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 30,
              background: '#22C55E',
              color: '#052E16',
              fontSize: 14,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,197,94,0.55)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.4)'
            }}
          >
            <span>Launch Command Platform</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => navigate('/map')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 24px',
              borderRadius: 30,
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid #CBD5E1',
              color: isDark ? '#FFFFFF' : '#0F172A',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'transform 180ms ease, background 180ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              if (isDark) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              if (isDark) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
            }}
          >
            <span>Open Live GIS Map</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const { language } = useLanguage()

  return (
    <footer
      style={{
        padding: '60px 36px 30px',
        background: isDark ? '#070B11' : '#FFFFFF',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569',
        transition: 'background-color 200ms ease',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 36,
            marginBottom: 48,
          }}
        >
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
                  <path d="M2 20L8 8L14 20H2Z" fill="#16A34A" />
                  <path d="M10 20L15.5 9.5L21 20H10Z" fill="#22C55E" />
                  <path d="M17 20L21.5 11.5L26 20H17Z" fill="#4ADE80" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  SmartLogix
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#22C55E' : '#16A34A', letterSpacing: '0.06em' }}>
                  NORTHEAST COMMAND
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.5, color: isDark ? 'rgba(255, 255, 255, 0.55)' : '#64748B', margin: '0 0 16px 0' }}>
              Autonomous disaster logistics and barrier-free routing for the 8 states of Northeast India.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid #CBD5E1',
                  fontSize: 11,
                  fontWeight: 600,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
                <span>{theme === 'dark' ? 'Forest Light' : 'Tactical Dark'}</span>
              </button>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '0.06em', marginBottom: 14 }}>
              PLATFORM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.75)' : '#475569' }}>Command Dashboard</span>
              <span onClick={() => navigate('/map')} style={{ cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.75)' : '#475569' }}>Live Tactical GIS</span>
              <span onClick={() => navigate('/alerts')} style={{ cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.75)' : '#475569' }}>Disaster Alerts</span>
              <span onClick={() => navigate('/routes')} style={{ cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.75)' : '#475569' }}>Autonomous Reroutes</span>
              <span onClick={() => navigate('/accessibility')} style={{ cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.75)' : '#475569' }}>Accessibility Hub</span>
            </div>
          </div>

          {/* Col 3: Northeast Corridors */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '0.06em', marginBottom: 14 }}>
              8 STATES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: isDark ? 'rgba(255,255,255,0.75)' : '#475569' }}>
              <span>Arunachal Pradesh · Sela Pass</span>
              <span>Assam · Brahmaputra Basin</span>
              <span>Meghalaya · Khasi-Garo Slopes</span>
              <span>Manipur · Imphal Artery</span>
              <span>Mizoram · Nagaland · Sikkim · Tripura</span>
            </div>
          </div>

          {/* Col 4: Systems & Standards */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '0.06em', marginBottom: 14 }}>
              SYSTEMS &amp; TELEMETRY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: isDark ? 'rgba(255,255,255,0.75)' : '#475569' }}>
              <span>NavIC Satellite Constellation</span>
              <span>OSRM Terrain Routing Engine</span>
              <span>FastAPI Async Python Microservice</span>
              <span>WCAG 2.1 AAA Accessibility</span>
              <span>Active Language: <strong style={{ color: isDark ? '#22C55E' : '#16A34A' }}>{language.toUpperCase()}</strong></span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 11,
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#94A3B8',
          }}
        >
          <div>
            © 2026 SmartLogix · Northeast India Disaster Logistics &amp; Mobility Initiative.
          </div>
          <div style={{ fontStyle: 'italic' }}>
            “Mountains Move People · Made for a Safer Tomorrow”
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── MAIN LANDING PAGE EXPORT ──────────────────────────────────
export default function LandingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden', background: isDark ? '#070B11' : '#F8FAFC', transition: 'background-color 200ms ease' }}>
      {/* 1. Hero with Authentic Northeast Photography & Telemetry */}
      <HeroSection />

      {/* 2. Problem Section (Exact Match to Screenshot 1) */}
      <ProblemSection />

      {/* 3. Pipeline Section (Exact Match to Screenshot 2) */}
      <PipelineSection />

      {/* 4. Live Tactical Route & Real Working Map */}
      <RouteMapSection />

      {/* 5. Accessibility for Everyone (Exact Match to Screenshot 3) */}
      <AccessibilitySection />

      {/* 6. Built for When the Network Fails (Exact Match to Screenshot 4) */}
      <OfflineResilienceSection />

      {/* 7. A Safer, Stronger Tomorrow Impact Milestones (Exact Match to Screenshot 5) */}
      <ImpactSection />

      {/* 8. Speak Your Language (10 Native Northeast Languages) */}
      <MultilingualSection />

      {/* 9. Final Call to Action */}
      <FinalLaunchSection />

      {/* 10. Unified Command Center Footer */}
      <Footer />
    </div>
  )
}
