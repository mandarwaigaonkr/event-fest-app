// src/pages/user/Profile.jsx
// User profile — display details, theme toggle, logout

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import Navbar from '../../components/Navbar'
import ConfirmModal from '../../components/ConfirmModal'
import toast from 'react-hot-toast'
import {
  SunIcon,
  MoonIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  IdentificationIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

export default function Profile() {
  const { user, profile, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  async function handleLogout() {
    try {
      await signOut(auth)
      navigate('/login', { replace: true })
      toast.success('Logged out')
    } catch (err) {
      toast.error('Failed to log out')
    }
  }

  const firstName = user?.displayName?.split(' ')[0] || 'User'

  return (
    <div className="min-h-screen bg-bg-base pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* Avatar + Name Card */}
        <div className="bg-bg-card border border-bg-border rounded-2xl p-5 flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-accent/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{firstName.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary truncate">
              {user?.displayName}
            </h2>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-semibold rounded-full">
                <ShieldCheckIcon className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Your Details
            </h3>
          </div>

          <div className="divide-y divide-bg-border">
            <ProfileRow
              icon={<IdentificationIcon className="w-5 h-5" />}
              label="Registration Number"
              value={profile?.regNumber || '—'}
            />
            <ProfileRow
              icon={<AcademicCapIcon className="w-5 h-5" />}
              label="Class"
              value={profile?.class || '—'}
            />
            <ProfileRow
              icon={<BuildingOffice2Icon className="w-5 h-5" />}
              label="Department"
              value={profile?.department || '—'}
            />
            <ProfileRow
              icon={<EnvelopeIcon className="w-5 h-5" />}
              label="Email"
              value={user?.email || '—'}
            />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Settings
            </h3>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-bg-elevated transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-accent">
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">Appearance</p>
              <p className="text-xs text-text-muted">{isDark ? 'Dark mode' : 'Light mode'}</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${isDark ? 'bg-accent' : 'bg-bg-border'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-red-500/5 transition-colors border-t border-bg-border"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-danger">
              <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-danger">Log out</p>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs text-text-muted">Foobar 10.0</p>
          <p className="text-[10px] text-text-muted mt-0.5">v1.0.0 — Powered by Firebase</p>
        </div>
      </div>

      {/* Logout Confirmation */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Log out"
        message="Are you sure you want to log out of your account?"
        confirmText="Yes, Log out"
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <Navbar />
    </div>
  )
}

function ProfileRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-accent shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  )
}
