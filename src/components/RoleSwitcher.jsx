// src/components/RoleSwitcher.jsx
// Floating button to quickly toggle between user and admin roles during testing

import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'

export default function RoleSwitcher() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)

  // Only render if logged in and profile is loaded
  if (!user || !profile) return null

  // Only show in development mode (Vite uses import.meta.env.DEV)
  if (!import.meta.env.DEV) return null

  async function toggleRole() {
    setLoading(true)
    const newRole = profile.role === 'admin' ? 'user' : 'admin'
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole })
      toast.success(`Switched to ${newRole} mode`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to switch role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleRole}
      disabled={loading}
      className="fixed bottom-20 right-4 z-[100] flex items-center gap-2 px-3 py-2.5 bg-accent text-white rounded-full shadow-glow hover:bg-accent-light transition-all text-xs font-semibold disabled:opacity-50"
      title="Test Mode Role Switcher"
    >
      <ArrowsRightLeftIcon className="w-4 h-4" />
      {loading ? 'Switching...' : `Mode: ${profile.role}`}
    </button>
  )
}
