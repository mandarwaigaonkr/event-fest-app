// src/pages/user/Profile.jsx
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
    } catch {
      toast.error('Failed to log out')
    }
  }

  const firstName = user?.displayName?.split(' ')[0] || 'User'

  return (
    <div className="min-h-screen bg-bg-base pb-20 transition-colors duration-200">
      {/* Header */}
      <div className="bg-bg-base border-b border-bg-border">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-3">
          <h1 className="text-lg font-semibold text-text-primary">Profile</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3 stagger-list">
        {/* Avatar + Name */}
        <div className="bg-bg-card border border-bg-border rounded-2xl p-4 flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white text-xl font-bold">{firstName.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-text-primary truncate">{user?.displayName}</h2>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-semibold rounded-full">
                <ShieldCheckIcon className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-1.5">
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Details</h3>
          </div>
          <div className="divide-y divide-bg-border">
            <ProfileRow icon={<IdentificationIcon className="w-4 h-4" />} label="Reg. Number" value={profile?.regNumber || '—'} />
            <ProfileRow icon={<AcademicCapIcon className="w-4 h-4" />} label="Class" value={profile?.class || '—'} />
            <ProfileRow icon={<BuildingOffice2Icon className="w-4 h-4" />} label="Department" value={profile?.department || '—'} />
            <ProfileRow icon={<EnvelopeIcon className="w-4 h-4" />} label="Email" value={user?.email || '—'} />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-1.5">
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Settings</h3>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated/50 pressable"
          >
            <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted">
              {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-text-primary">Appearance</p>
            </div>
            <div className={`w-10 h-5.5 rounded-full transition-colors relative ${isDark ? 'bg-accent' : 'bg-bg-border'}`}>
              <div className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </div>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-danger/5 pressable border-t border-bg-border"
          >
            <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
            </div>
            <p className="text-sm text-danger">Log out</p>
          </button>
        </div>

        <p className="text-center text-[10px] text-text-muted pt-2 pb-4">Event Manager · v1.0.0</p>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmText="Log out"
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
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="text-sm text-text-primary truncate">{value}</p>
      </div>
    </div>
  )
}
