// src/components/ProtectedRoute.jsx
// Redirects unauthenticated users to /login
// Redirects authenticated but not onboarded users to /onboarding

import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading, isOnboarded } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'pending_admin' || profile?.adminStatus === 'pending' || profile?.adminStatus === 'rejected') {
    return <Navigate to="/admin-onboarding" replace />
  }
  if (!isOnboarded) return <Navigate to="/onboarding" replace />

  return children
}
