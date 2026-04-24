// src/pages/user/MyEvents.jsx
// Shows events the current user has registered for

import { useNavigate } from 'react-router-dom'
import { useUserRegistrations } from '../../hooks/useEvents'
import Navbar from '../../components/Navbar'
import { formatDateTime } from '../../utils/formatters'
import {
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

const GRADIENT_FALLBACKS = [
  'from-indigo-500 to-purple-600',
  'from-rose-500 to-orange-500',
  'from-teal-500 to-cyan-500',
  'from-violet-600 to-fuchsia-500',
  'from-blue-600 to-cyan-500',
]

function AttendanceBadge({ status }) {
  switch (status) {
    case 'present':
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-500">
          <CheckCircleIcon className="w-3.5 h-3.5" /> Present
        </span>
      )
    case 'absent':
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-danger">
          <XCircleIcon className="w-3.5 h-3.5" /> Absent
        </span>
      )
    default:
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-text-muted">
          <ClockIcon className="w-3.5 h-3.5" /> Pending
        </span>
      )
  }
}

export default function MyEvents() {
  const { registrations, loading } = useUserRegistrations()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-base pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <h1 className="text-xl font-bold text-text-primary">My Events</h1>
          <p className="text-xs text-text-muted mt-0.5">Events you've registered for</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-bg-card border border-bg-border rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl bg-bg-elevated shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-bg-elevated rounded w-3/4" />
                    <div className="h-3 bg-bg-elevated rounded w-1/2" />
                    <div className="h-3 bg-bg-elevated rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h2 className="text-base font-semibold text-text-primary mb-1">No registrations yet</h2>
            <p className="text-sm text-text-muted max-w-xs mb-4">
              You haven't registered for any events. Browse the dashboard to find exciting events!
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-light transition-colors"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
              {registrations.length} event{registrations.length !== 1 ? 's' : ''}
            </p>

            {registrations.map((reg) => {
              const event = reg.eventData
              const gradient = GRADIENT_FALLBACKS[
                (event?.id || '').charCodeAt(0) % GRADIENT_FALLBACKS.length
              ]

              return (
                <div
                  key={reg.eventId}
                  onClick={() => navigate(`/event/${reg.eventId}`)}
                  className="bg-bg-card border border-bg-border rounded-2xl p-4 flex gap-3 items-start cursor-pointer hover:border-accent/20 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    {event?.posterURL ? (
                      <img
                        src={event.posterURL}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <span className="text-white/70 text-xl font-bold">
                          {event?.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {event?.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-text-muted text-xs mt-1">
                      <CalendarIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{formatDateTime(event?.dateTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted text-xs mt-0.5">
                      <MapPinIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{event?.venue}</span>
                    </div>
                    <div className="mt-2">
                      <AttendanceBadge status={reg.attendance} />
                    </div>
                  </div>

                  {/* Status badge */}
                  {reg.status === 'waitlisted' ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold shrink-0">
                      Waitlisted
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-semibold shrink-0">
                      Registered
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}
