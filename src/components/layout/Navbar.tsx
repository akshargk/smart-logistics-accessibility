import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Map, Bell, Route, Accessibility, Settings,
  Shield, Menu, X, ChevronDown, Activity
} from 'lucide-react'
import { systemStatus, kpiData } from '../../data/mockData'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/map', label: 'Live Map', icon: Map },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/routes', label: 'Routes', icon: Route },
  { to: '/accessibility', label: 'Accessibility', icon: Accessibility },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header
      style={{
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: '0 20px',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-blue-light) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              SmartLogix
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
              COMMAND CENTER
            </div>
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flex: 1,
          }}
          className="hidden md:flex"
          role="navigation"
          aria-label="Main navigation"
        >
          {navItems.map((item, i) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
            return (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                style={{ position: 'relative' }}
              >
                <NavLink
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    textDecoration: 'none',
                    transition: 'color 150ms ease, background 150ms ease',
                    position: 'relative',
                    background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                  }}
                >
                  <Icon size={14} strokeWidth={2} />
                  {item.label}
                  {item.to === '/alerts' && kpiData.activeAlerts.value > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        background: 'var(--color-accent-red)',
                        color: '#fff',
                        borderRadius: 9,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 5px',
                        lineHeight: 1.4,
                        minWidth: 18,
                        textAlign: 'center',
                      }}
                    >
                      {kpiData.activeAlerts.value}
                    </motion.span>
                  )}
                </NavLink>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: 8,
                      right: 8,
                      height: 2,
                      borderRadius: 2,
                      background: 'var(--color-accent-blue)',
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </nav>

        {/* Right side */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto', flexShrink: 0 }}
        >
          {/* System status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 10px',
              borderRadius: 20,
              background: 'var(--color-accent-green-dim)',
              border: '1px solid var(--color-accent-green-border)',
            }}
            className="hidden sm:flex"
            title="System operational"
          >
            <motion.div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-accent-green)',
                flexShrink: 0,
              }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-accent-green)',
                letterSpacing: '0.05em',
              }}
            >
              SYSTEM OPERATIONAL
            </span>
          </div>

          {/* Region */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
            className="hidden lg:flex"
          >
            <Activity size={13} />
            <span>Southern India</span>
            <ChevronDown size={11} />
          </div>

          {/* Alert bell */}
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            style={{
              position: 'relative',
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="View notifications"
          >
            <Bell size={15} />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-accent-red)',
                border: '1.5px solid var(--color-bg-surface)',
              }}
            />
          </motion.button>

          {/* User avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Operator: Admin"
          >
            OP
          </motion.div>

          {/* Mobile menu toggle */}
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setMobileOpen(v => !v)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
            className="md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </motion.button>
        </motion.div>
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
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg-elevated)',
            }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {navItems.map((item, i) => {
                const Icon = item.icon
                const isActive = location.pathname === item.to
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 9,
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                        background: isActive ? 'var(--color-accent-blue-dim)' : 'transparent',
                        textDecoration: 'none',
                      }}
                    >
                      <Icon size={16} strokeWidth={2} />
                      {item.label}
                    </NavLink>
                  </motion.div>
                )
              })}
              {/* Mobile status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  marginTop: 4,
                }}
              >
                <motion.div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--color-accent-green)',
                    flexShrink: 0,
                  }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  System Operational — {systemStatus.activeRegion}
                </span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
