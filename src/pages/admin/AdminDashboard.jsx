// src/pages/admin/AdminDashboard.jsx
// Admin home — quick stats, event list with management actions

import { useNavigate } from 'react-router-dom'
import { useEvents } from '../../hooks/useEvents'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { formatDateTime } from '../../utils/formatters'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  UsersIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  EyeIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

import christLogo from '../../assets/Christ complete logo.png'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { events, loading } = useEvents()

  const activeEvents = events.filter(e => e.status === 'active')
  const totalParticipants = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0)

  async function toggleEventStatus(event) {
    const newStatus = event.status === 'active' ? 'cancelled' : 'active'
    try {
      await updateDoc(doc(db, 'events', event.id), { status: newStatus })
      toast.success(`Event ${newStatus === 'active' ? 'activated' : 'cancelled'}`)
    } catch {
      toast.error('Failed to update event status')
    }
  }

  return (
    <div className="min-h-screen bg-bg-base pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 text-xs font-medium text-accent mb-3 pressable hover:text-accent-light"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to App
          </button>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-lg font-bold text-text-primary leading-tight">Admin Panel</h1>
              <p className="text-xs text-text-muted mt-0.5">Create & manage events</p>
            </div>
            <img src={christLogo} alt="Christ Logo" className="h-9 object-contain" />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 stagger-list">
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 text-center">
            <CalendarDaysIcon className="w-5 h-5 mx-auto text-accent mb-1.5" />
            <p className="text-lg font-bold text-text-primary">{events.length}</p>
            <p className="text-[10px] text-text-muted uppercase font-medium">Total Events</p>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 text-center">
            <ChartBarIcon className="w-5 h-5 mx-auto text-green-500 mb-1.5" />
            <p className="text-lg font-bold text-text-primary">{activeEvents.length}</p>
            <p className="text-[10px] text-text-muted uppercase font-medium">Active</p>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 text-center">
            <UsersIcon className="w-5 h-5 mx-auto text-purple-400 mb-1.5" />
            <p className="text-lg font-bold text-text-primary">{totalParticipants}</p>
            <p className="text-[10px] text-text-muted uppercase font-medium">Registered</p>
          </div>
        </div>

        {/* Create Event CTA */}
        <button
          onClick={() => navigate('/admin/create-event')}
          className="w-full h-12 flex items-center justify-center gap-2 bg-accent text-white rounded-xl text-sm font-semibold shadow-glow-sm hover:shadow-glow hover:bg-accent-light pressable"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Event
        </button>

        {/* Events List */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Manage Events
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-bg-card border border-bg-border rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-bg-elevated rounded w-3/4 mb-2" />
                  <div className="h-3 bg-bg-elevated rounded w-1/2 mb-3" />
                  <div className="h-8 bg-bg-elevated rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm">No events created yet.</p>
              <p className="text-text-muted text-xs mt-1">Create your first event above!</p>
            </div>
          ) : (
            <div className="space-y-3 stagger-list">
              {events.map(event => (
                <div key={event.id} className="bg-bg-card border border-bg-border rounded-xl overflow-hidden interactive-card">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-text-primary flex-1 mr-2 truncate">
                        {event.name}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        event.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : event.status === 'cancelled'
                            ? 'bg-red-500/10 text-danger'
                            : 'bg-text-muted/10 text-text-muted'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-1">
                      {formatDateTime(event.dateTime)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {event.isTeamEvent ? (event.registeredTeamsCount || 0) : (event.registeredCount || 0)} / {event.isTeamEvent ? event.maxTeams : event.maxParticipants} {event.isTeamEvent ? 'teams' : 'registered'}
                    </p>
                  </div>

                  {/* Action bar */}
                  <div className="flex border-t border-bg-border divide-x divide-bg-border">
                    <button
                      onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-secondary hover:text-accent hover:bg-accent/5 pressable"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => navigate(`/admin/events/${event.id}/participants`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-secondary hover:text-accent hover:bg-accent/5 pressable"
                    >
                      <EyeIcon className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => toggleEventStatus(event)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium pressable ${
                        event.status === 'active'
                          ? 'text-danger hover:bg-red-500/5'
                          : 'text-green-500 hover:bg-green-500/5'
                      }`}
                    >
                      {event.status === 'active' ? (
                        <><XCircleIcon className="w-3.5 h-3.5" /> Cancel</>
                      ) : (
                        <><CheckBadgeIcon className="w-3.5 h-3.5" /> Activate</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
