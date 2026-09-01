import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import Navbar from './Navbar'

export default function Layout() {
  const location = useLocation()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-base)',
      }}
    >
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            flex: 1,
            maxWidth: 1600,
            width: '100%',
            margin: '0 auto',
            padding: '24px 20px 32px',
          }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
