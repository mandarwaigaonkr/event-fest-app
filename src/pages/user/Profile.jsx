// src/pages/user/Profile.jsx
// User profile — glass design

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
    <div className="min-h-screen bg-bg-base pb-28 transition-colors duration-300">
      {/* Header */}
      <div className="bg-bg-base/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-4">
          <h1 className="text-xl font-semibold text-text-primary">Profile</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-3 space-y-4">
        {/* Avatar + Name Card */}
        <div className="glass rounded-3xl p-5 flex items-center gap-4 animate-fade-up">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl border border-bg-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <span className="text-accent text-2xl font-bold">{firstName.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary truncate">
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
        <div className="glass rounded-3xl overflow-hidden animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
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
        <div className="glass rounded-3xl overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Settings
            </h3>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-bg-elevated/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-text-primary">Appearance</p>
              <p className="text-xs text-text-muted">{isDark ? 'Dark mode' : 'Light mode'}</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${isDark ? 'bg-accent' : 'bg-bg-border'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-danger/5 transition-colors border-t border-bg-border"
          >
            <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
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
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  )
}
