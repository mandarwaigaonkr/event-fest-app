// src/App.jsx — Root component with React Router v6 routing
// Route-level code splitting with React.lazy for smaller initial bundle

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthProvider from './context/AuthContext'
import EventsProvider from './context/EventsContext'
import { ThemeProvider } from './context/ThemeContext'
import AppBackground from './components/AppBackground'

// Route guards (small — kept eager)
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Inline spinner — avoids importing a component for the fallback
function RouteFallback() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="w-9 h-9 border-2 border-bg-border border-t-accent rounded-full animate-spin" />
    </div>
  )
}

// Auth pages (rarely visited after first login)
const Login = lazy(() => import('./pages/auth/Login'))
const Onboarding = lazy(() => import('./pages/auth/Onboarding'))
const AdminOnboarding = lazy(() => import('./pages/auth/AdminOnboarding'))

// User pages
const Dashboard = lazy(() => import('./pages/user/Dashboard'))
const MyEvents = lazy(() => import('./pages/user/MyEvents'))
const EventDetails = lazy(() => import('./pages/user/EventDetails'))
const Profile = lazy(() => import('./pages/user/Profile'))

// Admin pages (only 1-2 users ever access these)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const CreateEvent = lazy(() => import('./pages/admin/CreateEvent'))
const EditEvent = lazy(() => import('./pages/admin/EditEvent'))
const EventParticipants = lazy(() => import('./pages/admin/EventParticipants'))
const TakeAttendance = lazy(() => import('./pages/admin/TakeAttendance'))

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AppBackground />
      <AuthProvider>
        {/* Global toast notifications */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              fontSize: '14px',
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-bg-border)',
            },
          }}
        />

        <EventsProvider>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Onboarding — needs auth but not onboarded yet */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/admin-onboarding" element={<AdminOnboarding />} />

          {/* Protected user routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/my-events" element={
            <ProtectedRoute><MyEvents /></ProtectedRoute>
          } />
          <Route path="/event/:eventId" element={
            <ProtectedRoute><EventDetails /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
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
          <Route path="/admin/events/:eventId/attendance" element={
            <AdminRoute><TakeAttendance /></AdminRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </Suspense>
        </EventsProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  )
}
