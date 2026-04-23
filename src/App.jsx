// src/App.jsx — Root component with React Router v6 routing

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthProvider from './context/AuthContext'

// Route guards
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Auth pages
import Login from './pages/auth/Login'
import Onboarding from './pages/auth/Onboarding'

// User pages
import Dashboard from './pages/user/Dashboard'
import MyEvents from './pages/user/MyEvents'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import CreateEvent from './pages/admin/CreateEvent'
import EditEvent from './pages/admin/EditEvent'
import EventParticipants from './pages/admin/EventParticipants'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global toast notifications */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Onboarding — needs auth but not onboarded yet */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected user routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/my-events" element={
            <ProtectedRoute><MyEvents /></ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/create-event" element={
            <AdminRoute><CreateEvent /></AdminRoute>
          } />
          <Route path="/admin/edit-event/:eventId" element={
            <AdminRoute><EditEvent /></AdminRoute>
          } />
          <Route path="/admin/events/:eventId/participants" element={
            <AdminRoute><EventParticipants /></AdminRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
