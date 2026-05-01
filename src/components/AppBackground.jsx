// src/components/AppBackground.jsx
// Subtle campus background that persists across all routes (except login).
// Renders behind everything with heavy blur + low opacity so it adds
// texture/identity without competing with UI elements.

import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

import bgLight from '../assets/background image.png'
import bgDark from '../assets/dark theme background.png'

export default function AppBackground() {
  const { isDark } = useTheme()
  const { pathname } = useLocation()

  // Login has its own rich background system — skip this global one
  if (pathname === '/login') return null

  return (
    <div
      className="app-bg"
      aria-hidden="true"
    >
      {/* Campus image — very low opacity, heavy blur */}
      <img
        src={isDark ? bgDark : bgLight}
        alt=""
        className="app-bg__img"
        draggable={false}
      />

      {/* Theme-matched color wash overlay */}
      <div className={`app-bg__wash ${isDark ? 'app-bg__wash--dark' : 'app-bg__wash--light'}`} />
    </div>
  )
}
