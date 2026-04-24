// src/components/EventCard.jsx
// Reusable event card — shows poster, name, date, venue, spots, register button

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
  onRegister,
  onUnregister,
  registering = false,
}) {
  const navigate = useNavigate()
  const [modalState, setModalState] = useState(null) // 'register' | 'unregister' | null

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
      className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-accent/20 cursor-pointer group"
      onClick={() => navigate(`/event/${event.eventId || event.id}`)}
    >
      {/* Poster */}
      <div className="relative h-44 overflow-hidden">
        {event.posterURL ? (
          <img
            src={event.posterURL}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(event.eventId || event.id)} flex items-center justify-center`}>
            <span className="text-white/80 text-4xl font-bold">
              {event.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Status Badge */}
        {isRegistered && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold shadow-md">
            ✓ Registered
          </span>
        )}
        {isFull && !isRegistered && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold shadow-md">
            Full
          </span>
        )}
        {almostFull && !isFull && !isRegistered && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold shadow-md">
            {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-base font-semibold text-text-primary line-clamp-1">
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
            if (isRegistered && onUnregister) setModalState('unregister')
            else if (!isRegistered && !isFull && onRegister) setModalState('register')
          }}
          disabled={(!isRegistered && isFull) || registering}
          className={`w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${isRegistered
              ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-red-500/10 hover:text-danger hover:border-danger/20'
              : isFull
                ? 'bg-bg-elevated text-text-muted border border-bg-border cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-light shadow-glow-sm hover:shadow-glow'
            }
            disabled:opacity-70 group/btn`}
        >
          {registering ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : isRegistered ? (
            <span className="group-hover/btn:hidden">✓ Registered</span>
          ) : isFull ? (
            'Registrations Full'
          ) : (
            'Register Now'
          )}
          {isRegistered && !registering && (
            <span className="hidden group-hover/btn:inline">Cancel Registration</span>
          )}
        </button>
      </div>

      <ConfirmModal
        isOpen={modalState !== null}
        title={modalState === 'register' ? 'Confirm Registration' : 'Cancel Registration'}
        message={
          modalState === 'register'
            ? `Are you sure you want to register for ${event.name}?`
            : `Are you sure you want to remove your registration for ${event.name}? This will free up your spot.`
        }
        confirmText={modalState === 'register' ? 'Yes, Register' : 'Yes, Cancel it'}
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
