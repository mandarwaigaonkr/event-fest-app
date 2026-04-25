// src/components/EventCard.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'
import { formatDateTime } from '../utils/formatters'
import ConfirmModal from './ConfirmModal'

const GRADIENT_FALLBACKS = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-indigo-600',
]

function getGradient(eventId) {
  const idx = eventId?.charCodeAt(0) % GRADIENT_FALLBACKS.length || 0
  return GRADIENT_FALLBACKS[idx]
}

export default function EventCard({
  event,
  isRegistered = false,
  isWaitlisted = false,
  onRegister,
  onUnregister,
  registering = false,
}) {
  const navigate = useNavigate()
  const [modalState, setModalState] = useState(null)

  const spotsLeft = event.isTeamEvent
    ? event.maxTeams - (event.registeredTeamsCount || 0)
    : event.maxParticipants - (event.registeredCount || 0)
  const isFull = spotsLeft <= 0
  const almostFull = spotsLeft > 0 && spotsLeft <= 5

  function handleConfirm() {
    if (modalState === 'register' && onRegister) onRegister(event)
    if (modalState === 'unregister' && onUnregister) onUnregister(event)
    setModalState(null)
  }

  return (
    <div
      className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden transition-all duration-150 hover:border-text-muted/20 cursor-pointer group"
      onClick={() => navigate(`/event/${event.eventId || event.id}`)}
    >
      {/* Poster */}
      <div className="relative h-44 overflow-hidden">
        {event.posterURL ? (
          <img
            src={event.posterURL}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(event.eventId || event.id)} flex items-center justify-center`}>
            <span className="text-white/50 text-5xl font-bold">
              {event.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Status Badge */}
        {isRegistered && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-success text-white text-[11px] font-semibold">
            ✓ Registered
          </span>
        )}
        {isWaitlisted && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-warning text-white text-[11px] font-semibold">
            ⏳ Waitlisted
          </span>
        )}
        {isFull && !isRegistered && !isWaitlisted && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-danger text-white text-[11px] font-semibold">
            Full
          </span>
        )}
        {almostFull && !isFull && !isRegistered && !isWaitlisted && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-warning text-white text-[11px] font-semibold">
            {spotsLeft} left
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-[15px] font-semibold text-text-primary line-clamp-1">
          {event.name}
        </h3>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>{formatDateTime(event.dateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <MapPinIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <UsersIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>
              {event.isTeamEvent ? (event.registeredTeamsCount || 0) : (event.registeredCount || 0)} / {event.isTeamEvent ? event.maxTeams : event.maxParticipants} {event.isTeamEvent ? 'teams' : ''}
            </span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (isRegistered || isWaitlisted) {
              if (onUnregister) setModalState('unregister')
            } else {
              if (event.isTeamEvent) {
                // Redirect team events to details page for the modal
                navigate(`/event/${event.eventId || event.id}`)
              } else if (onRegister) {
                setModalState('register')
              }
            }
          }}
          disabled={registering}
          className={`w-full h-10 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]
            ${(isRegistered || isWaitlisted)
              ? 'bg-bg-elevated text-text-primary hover:text-danger'
              : 'bg-accent text-white hover:opacity-90'
            }
            disabled:opacity-60 group/btn`}
        >
          {registering ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : isRegistered ? (
            <span className="group-hover/btn:hidden">✓ Registered</span>
          ) : isWaitlisted ? (
            <span className="group-hover/btn:hidden">⏳ Waitlisted</span>
          ) : isFull ? (
            'Join Waitlist'
          ) : (
            'Register Now'
          )}
          {(isRegistered || isWaitlisted) && !registering && (
            <span className="hidden group-hover/btn:inline">
              {isWaitlisted ? 'Leave Waitlist' : 'Cancel'}
            </span>
          )}
        </button>
      </div>

      <ConfirmModal
        isOpen={modalState !== null}
        title={
          modalState === 'register'
            ? (isFull ? 'Join Waitlist' : 'Confirm Registration')
            : (isWaitlisted ? 'Leave Waitlist' : 'Cancel Registration')
        }
        message={
          modalState === 'register'
            ? (isFull ? `The event is full. Would you like to join the waitlist for ${event.name}?` : `Register for ${event.name}?`)
            : (isWaitlisted ? `Leave the waitlist for ${event.name}?` : `Cancel your registration for ${event.name}?`)
        }
        confirmText={
          modalState === 'register'
            ? (isFull ? 'Join Waitlist' : 'Register')
            : 'Yes, Cancel'
        }
        isDestructive={modalState === 'unregister'}
        onConfirm={handleConfirm}
        onCancel={(e) => {
          if (e) e.stopPropagation()
          setModalState(null)
        }}
      />
    </div>
  )
}
