import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { BackendProvider } from './context/BackendContext'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/layout/ScrollToTop'
import Dashboard from './pages/Dashboard'
import TestDashboard from './pages/TestDashboard'
import LandingPage from './pages/LandingPage'
import LiveMapPage from './pages/LiveMapPage'
import AlertsPage from './pages/AlertsPage'
import RoutesPage from './pages/RoutesPage'
import AccessibilityPage from './pages/AccessibilityPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <BackendProvider>
        <LanguageProvider>
          <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 280, damping: 26 }}>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="test-dashboard" element={<TestDashboard />} />
                  <Route path="test" element={<TestDashboard />} />
                  <Route path="map" element={<LiveMapPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="routes" element={<RoutesPage />} />
                  <Route path="accessibility" element={<AccessibilityPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </MotionConfig>
        </LanguageProvider>
      </BackendProvider>
    </ThemeProvider>
  )
}
