import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'

// Placeholder pages for future routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-96" style={{ color: 'var(--color-text-secondary)' }}>
    <div className="text-center">
      <p className="section-label mb-2">Coming Soon</p>
      <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      <p className="mt-2 text-sm">This page will be available in a future build.</p>
    </div>
  </div>
)

export default function App() {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="map" element={<PlaceholderPage title="Live Map" />} />
            <Route path="alerts" element={<PlaceholderPage title="Alerts Center" />} />
            <Route path="routes" element={<PlaceholderPage title="Route Management" />} />
            <Route path="accessibility" element={<PlaceholderPage title="Accessibility Hub" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}
