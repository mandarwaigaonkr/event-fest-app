// src/components/AdminRoute.jsx
// Restricts access to admin-only pages
// Checks role in real time — if admin is demoted, they are redirected immediately

import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function AdminRoute({ children }) {
  const { user, profile, loading, isAdmin, isOnboarded } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'pending_admin' || profile?.adminStatus === 'pending' || profile?.adminStatus === 'rejected') {
    return <Navigate to="/admin-onboarding" replace />
  }
  if (!isOnboarded) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return children
}
