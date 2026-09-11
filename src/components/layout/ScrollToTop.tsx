import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Global ScrollToTop Component
 *
 * Ensures that whenever the user navigates to a new page or route:
 * - The page automatically resets scroll position to the very top (0, 0).
 * - Works for all client-side navigation (Link, NavLink, navigate()).
 * - Works for browser navigation (Back, Forward, initial load).
 * - Supports hash anchor navigation within a page (e.g. #problem-section).
 * - Preserves normal user scrolling within a page.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  // Prevent browser from automatically restoring stale scroll offsets on Back/Forward
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    // If a hash is provided and corresponds to a specific section (e.g. #problem-section)
    if (hash && hash !== '#hero-section' && hash !== '#top' && hash !== '#') {
      const targetId = hash.replace(/^#/, '')
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }

    // Reset scroll to top immediately across all containers and window
    const resetScroll = () => {
      const html = document.documentElement
      const prevBehavior = html.style.scrollBehavior
      html.style.scrollBehavior = 'auto'
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      } catch {
        window.scrollTo(0, 0)
      }
      html.scrollTop = 0
      document.body.scrollTop = 0
      html.style.scrollBehavior = prevBehavior
    }

    // 1. Instant execution before paint
    resetScroll()

    // 2. Next animation frame to ensure DOM layout settling doesn't preserve old scroll
    const rafId = requestAnimationFrame(resetScroll)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [pathname, hash])

  return null
}
