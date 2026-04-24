// src/components/EventCard.jsx
// Glass event card — clean, minimal, premium

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'
import { formatDateTime } from '../utils/formatters'
import ConfirmModal from './ConfirmModal'

// Gradient fallback when no poster
const GRADIENT_FALLBACKS = [
  'from-indigo-500 to-purple-600',
  'from-rose-500 to-orange-500',
  'from-teal-500 to-cyan-500',
  'from-violet-600 to-fuchsia-500',
  'from-blue-600 to-cyan-500',
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

  const spotsLeft = event.maxParticipants - (event.registeredCount || 0)
  const isFull = spotsLeft <= 0
  const almostFull = spotsLeft > 0 && spotsLeft <= 5

  function handleConfirm() {
    if (modalState === 'register' && onRegister) onRegister(event)
    if (modalState === 'unregister' && onUnregister) onUnregister(event)
    setModalState(null)
  }

  return (
    <div
      className="glass rounded-3xl overflow-hidden transition-all duration-200 hover:shadow-glass-lg cursor-pointer group"
      onClick={() => navigate(`/event/${event.eventId || event.id}`)}
    >
      {/* Poster */}
      <div className="relative h-44 overflow-hidden">
        {event.posterURL ? (
          <img
            src={event.posterURL}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(event.eventId || event.id)} flex items-center justify-center`}>
            <span className="text-white/60 text-5xl font-bold">
              {event.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient overlay at bottom of poster */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Status Badge */}
        {isRegistered && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-success/90 backdrop-blur-sm text-white text-[11px] font-semibold">
            ✓ Registered
          </span>
        )}
        {isWaitlisted && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-warning/90 backdrop-blur-sm text-white text-[11px] font-semibold">
            ⏳ Waitlisted
          </span>
        )}
        {isFull && !isRegistered && !isWaitlisted && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-danger/90 backdrop-blur-sm text-white text-[11px] font-semibold">
            Full
          </span>
        )}
        {almostFull && !isFull && !isRegistered && !isWaitlisted && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-warning/90 backdrop-blur-sm text-white text-[11px] font-semibold">
            {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-[15px] font-semibold text-text-primary line-clamp-1">
          {event.name}
        </h3>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <CalendarIcon className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{formatDateTime(event.dateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <MapPinIcon className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <UsersIcon className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{event.registeredCount || 0} / {event.maxParticipants}</span>
          </div>
        </div>

        {/* Register / Unregister Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (isRegistered || isWaitlisted) {
              if (onUnregister) setModalState('unregister')
            } else {
              if (onRegister) setModalState('register')
            }
          }}
          disabled={registering}
          className={`w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.97]
            ${(isRegistered || isWaitlisted)
              ? 'bg-bg-elevated text-text-primary border border-bg-border hover:bg-danger/10 hover:text-danger hover:border-danger/20'
              : 'bg-accent text-white hover:bg-accent-light shadow-glow-sm'
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
              {isWaitlisted ? 'Leave Waitlist' : 'Cancel Registration'}
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
            ? (isFull ? `The event is full. Would you like to join the waitlist for ${event.name}? If a spot opens up, you will be automatically registered.` : `Are you sure you want to register for ${event.name}?`)
            : (isWaitlisted ? `Are you sure you want to leave the waitlist for ${event.name}?` : `Are you sure you want to remove your registration for ${event.name}? This will free up your spot.`)
        }
        confirmText={
          modalState === 'register'
            ? (isFull ? 'Yes, Join Waitlist' : 'Yes, Register')
            : 'Yes, Cancel it'
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
