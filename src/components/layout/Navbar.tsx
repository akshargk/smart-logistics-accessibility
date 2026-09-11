import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Map, Bell, Route, Accessibility, Settings,
  Shield, Menu, X, ChevronDown, Globe, Sun, Moon, ArrowRight
} from 'lucide-react'
import { kpiData } from '../../data/mockData'
import { useLanguage, LANGUAGES, type LanguageCode } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { useBackend } from '../../context/BackendContext'

const platformNavItems = [
  { to: '/dashboard', labelKey: 'nav.dashboard' as const, icon: LayoutDashboard },
  { to: '/map', labelKey: 'nav.liveMap' as const, icon: Map },
  { to: '/alerts', labelKey: 'nav.alerts' as const, icon: Bell },
  { to: '/routes', labelKey: 'nav.routes' as const, icon: Route },
  { to: '/accessibility', labelKey: 'nav.accessibility' as const, icon: Accessibility },
]

const landingNavItems = [
  { hash: '#hero-section', label: 'Home' },
  { hash: '#route-section', label: 'Route' },
  { hash: '#problem-section', label: 'Problem' },
  { hash: '#pipeline-section', label: 'Pipeline' },
  { hash: '#a11y-section', label: 'Accessibility' },
  { hash: '#resilience-section', label: 'Mode' },
  { hash: '#impact-section', label: 'Impact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { backendOnline, recentAlerts } = useBackend()

  const isLanding = location.pathname === '/'
  const isPlatform = !isLanding

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => { setLangOpen(false) }
    if (langOpen) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [langOpen])

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 9999,
        background: isPlatform
          ? (theme === 'dark' ? 'rgba(14, 20, 18, 0.98)' : 'rgba(254, 252, 243, 0.98)')
          : (theme === 'light'
              ? (scrolled ? 'rgba(254, 252, 243, 0.96)' : 'rgba(254, 252, 243, 0.85)')
              : (scrolled ? 'rgba(7, 11, 17, 0.96)' : 'rgba(7, 11, 17, 0.7)')),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isPlatform
          ? '1px solid var(--color-border)'
          : (theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : (scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent')),
        boxShadow: isPlatform || scrolled
          ? (theme === 'light' ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.4)')
          : 'none',
        transition: 'all 300ms ease',
      }}
    >
      {/* NE India accent line */}
      {isPlatform && <div className="ne-gradient-bar" />}

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 20px',
          height: isPlatform ? 54 : 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          width: '100%',
        }}
      >
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' }}>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
              <path d="M2 20L8 8L14 20H2Z" fill="#16A34A" />
              <path d="M10 20L15.5 9.5L21 20H10Z" fill="#22C55E" />
              <path d="M17 20L21.5 11.5L26 20H17Z" fill="#4ADE80" />
            </svg>
          </motion.div>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 800,
              color: isLanding ? (theme === 'light' ? '#0F172A' : '#FFFFFF') : 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              SmartLogix
            </div>
            <div style={{ fontSize: 9, color: isLanding ? '#16A34A' : 'var(--color-accent-green)', letterSpacing: '0.04em', fontWeight: 600 }}>
              {t('footer.tagline')}
            </div>
          </div>
        </NavLink>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 8px', flexShrink: 0 }} className="hidden md:block" />

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex"
          style={{ alignItems: 'center', gap: 4, flex: 1 }}
          role="navigation"
          aria-label="Main navigation"
        >
          {isPlatform ? (
            platformNavItems.map((item, i) => {
              const Icon = item.icon
              const label = t(item.labelKey)
              const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
              return (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  style={{ position: 'relative' }}
                >
                  <NavLink
                    to={item.to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 10px', borderRadius: 7,
                      fontSize: 13, fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-accent-green)' : 'var(--color-text-muted)',
                      textDecoration: 'none',
                      transition: 'color 150ms, background 150ms',
                      background: isActive ? 'var(--color-accent-green-dim)' : 'transparent',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon size={14} strokeWidth={2} />
                    {label}
                    {item.to === '/alerts' && (recentAlerts.filter(a => a.status === 'ACTIVE').length > 0 || kpiData.activeAlerts.value > 0) && (
                      <span style={{
                        background: 'var(--color-accent-red)', color: '#fff',
                        borderRadius: 9, fontSize: 9, fontWeight: 700,
                        padding: '1px 5px', lineHeight: '1.4', minWidth: 16, textAlign: 'center',
                      }}>
                        {recentAlerts.length > 0 ? recentAlerts.filter(a => a.status === 'ACTIVE').length : kpiData.activeAlerts.value}
                      </span>
                    )}
                  </NavLink>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      style={{
                        position: 'absolute', bottom: -2, left: 8, right: 8,
                        height: 2, borderRadius: 2, background: 'var(--color-accent-green)',
                      }}
                    />
                  )}
                </motion.div>
              )
            })
          ) : (
            landingNavItems.map((item) => {
              const defaultColor = isLanding
                ? (theme === 'light' ? '#334155' : 'rgba(255, 255, 255, 0.85)')
                : 'var(--color-text-secondary)'
              return (
                <a
                  key={item.label}
                  href={item.hash}
                  style={{
                    padding: '5px 12px', fontSize: 13, fontWeight: 600,
                    color: defaultColor,
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22C55E'}
                  onMouseLeave={e => e.currentTarget.style.color = defaultColor}
                >
                  {item.label}
                </a>
              )
            })
          )}
        </nav>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
          {/* Backend Live Status Pill */}
          <div
            title={backendOnline ? 'Connected to FastAPI Backend (SQLite + MongoDB Atlas)' : 'Operating in offline local cached mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              borderRadius: 6,
              background: backendOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${backendOnline ? 'rgba(34, 197, 94, 0.28)' : 'rgba(245, 158, 11, 0.28)'}`,
              fontSize: 11,
              fontWeight: 700,
              color: backendOnline ? 'var(--color-accent-green)' : '#F59E0B',
              cursor: 'default',
            }}
            className="hidden sm:flex"
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: backendOnline ? 'var(--color-accent-green)' : '#F59E0B',
                boxShadow: backendOnline ? '0 0 6px rgba(34, 197, 94, 0.8)' : 'none',
              }}
            />
            <span>{backendOnline ? 'FASTAPI LIVE' : 'LOCAL CACHE'}</span>
          </div>

          {/* Language selector */}
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLangOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 6,
                background: langOpen ? 'var(--color-bg-elevated)' : 'transparent',
                border: '1px solid var(--color-border)',
                cursor: 'pointer', color: 'var(--color-text-secondary)',
                fontSize: 12, fontWeight: 600,
              }}
              aria-label="Select language"
            >
              <Globe size={13} />
              <span className="hidden sm:inline">{LANGUAGES[language].native}</span>
              <ChevronDown size={10} style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 4,
                    background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-strong)',
                    borderRadius: 10, padding: 6, minWidth: 170,
                    boxShadow: 'var(--shadow-elevated)', zIndex: 100,
                  }}
                >
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => { setLanguage(code as LanguageCode); setLangOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '6px 8px', borderRadius: 6, border: 'none',
                        background: language === code ? 'var(--color-accent-green-dim)' : 'transparent',
                        color: language === code ? 'var(--color-accent-green)' : 'var(--color-text-secondary)',
                        fontSize: 12, fontWeight: language === code ? 600 : 400,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span>{lang.native}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            onClick={toggleTheme}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-text-secondary)',
            }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </motion.button>

          {/* Launch Platform / Dashboard button */}
          {isLanding && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: 'var(--color-ne-primary)', color: '#fff',
                border: 'none', cursor: 'pointer',
              }}
            >
              {t('nav.launchPlatform')} <ArrowRight size={14} />
            </motion.button>
          )}

          {isPlatform && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="hidden sm:flex"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)', cursor: 'pointer',
              }}
            >
              ← Overview
            </motion.button>
          )}

          {/* Mobile menu toggle */}
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setMobileOpen(v => !v)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-text-secondary)',
            }}
            className="md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            style={{
              overflow: 'hidden',
              borderTop: isPlatform
                ? '1px solid var(--color-border)'
                : (theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)'),
              background: isPlatform
                ? 'var(--color-bg-surface)'
                : (theme === 'light' ? '#FFFFFF' : '#0B111B'),
            }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {isPlatform ? (
                platformNavItems.map((item, i) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.to
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <NavLink
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', borderRadius: 8, fontSize: 14,
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? 'var(--color-accent-green)' : 'var(--color-text-secondary)',
                          background: isActive ? 'var(--color-accent-green-dim)' : 'transparent',
                          textDecoration: 'none',
                        }}
                      >
                        <Icon size={16} /> {t(item.labelKey)}
                      </NavLink>
                    </motion.div>
                  )
                })
              ) : (
                <>
                  {landingNavItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.hash}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', padding: '10px 14px',
                        borderRadius: 8, fontSize: 14, fontWeight: 600,
                        color: isLanding
                          ? (theme === 'light' ? '#0F172A' : 'rgba(255, 255, 255, 0.9)')
                          : 'var(--color-text-secondary)',
                        textDecoration: 'none',
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                  <button
                    onClick={() => { navigate('/dashboard'); setMobileOpen(false) }}
                    className="btn-primary"
                    style={{ margin: '8px 12px', justifyContent: 'center' }}
                  >
                    {t('nav.launchPlatform')} <ArrowRight size={14} />
                  </button>
                </>
              )}

              {/* Settings (platform only) */}
              {isPlatform && (
                <NavLink
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8, fontSize: 14,
                    color: location.pathname === '/settings' ? 'var(--color-accent-green)' : 'var(--color-text-secondary)',
                    textDecoration: 'none',
                  }}
                >
                  <Settings size={16} /> {t('nav.settings')}
                </NavLink>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
