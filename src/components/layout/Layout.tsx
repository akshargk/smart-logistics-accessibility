import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import Navbar from './Navbar'

export default function Layout() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isLanding ? '#060d17' : 'var(--color-bg-base)',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: isLanding ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isLanding ? 0 : -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            flex: 1,
            maxWidth: isLanding ? '100%' : 1600,
            width: '100%',
            margin: isLanding ? 0 : '0 auto',
            padding: isLanding ? 0 : '76px 20px 32px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
