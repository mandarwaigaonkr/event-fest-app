// src/pages/user/MyEvents.jsx
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
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-indigo-600',
]

function AttendanceBadge({ status }) {
  switch (status) {
    case 'present':
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-success">
          <CheckCircleIcon className="w-3.5 h-3.5" /> Present
        </span>
      )
    case 'absent':
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-danger">
          <XCircleIcon className="w-3.5 h-3.5" /> Absent
        </span>
      )
    default:
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
          <ClockIcon className="w-3.5 h-3.5" /> Pending
        </span>
      )
  }
}

export default function MyEvents() {
  const { registrations, loading } = useUserRegistrations()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-base pb-20 transition-colors duration-200">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/95 backdrop-blur-md border-b border-bg-border">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-3">
          <h1 className="text-lg font-semibold text-text-primary">My Events</h1>
          <p className="text-xs text-text-muted mt-0.5">Events you've registered for</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-bg-card border border-bg-border rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-bg-elevated shrink-0" />
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
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
            <div className="text-3xl mb-3">📋</div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">No registrations yet</h2>
            <p className="text-xs text-text-muted max-w-[240px] mb-4">
              Browse the dashboard to find events
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              {registrations.length} event{registrations.length !== 1 ? 's' : ''}
            </span>

            {registrations.map((reg) => {
              const event = reg.eventData
              const gradient = GRADIENT_FALLBACKS[
                (event?.id || '').charCodeAt(0) % GRADIENT_FALLBACKS.length
              ]

              return (
                <div
                  key={reg.eventId}
                  onClick={() => navigate(`/event/${reg.eventId}`)}
                  className="bg-bg-card border border-bg-border rounded-2xl p-3 flex gap-3 items-start cursor-pointer hover:border-text-muted/20 transition-all group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    {event?.posterURL ? (
                      <img src={event.posterURL} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <span className="text-white/60 text-lg font-bold">{event?.name?.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate">{event?.name}</h3>
                    <div className="flex items-center gap-1.5 text-text-muted text-[11px] mt-1">
                      <CalendarIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{formatDateTime(event?.dateTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted text-[11px] mt-0.5">
                      <MapPinIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{event?.venue}</span>
                    </div>
                    <div className="mt-1.5">
                      <AttendanceBadge status={reg.attendance} />
                    </div>
                  </div>

                  {reg.status === 'waitlisted' ? (
                    <span className="px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[10px] font-semibold shrink-0">
                      Waitlisted
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-semibold shrink-0">
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
