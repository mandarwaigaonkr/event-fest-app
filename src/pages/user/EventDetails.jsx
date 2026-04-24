// src/pages/user/EventDetails.jsx
// Full event details page — poster, description, venue, register button

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { registerForEvent, unregisterFromEvent } from '../../hooks/useEvents'
import { formatDateTime } from '../../utils/formatters'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

const GRADIENT_FALLBACKS = [
  'from-indigo-500 to-purple-600',
  'from-rose-500 to-orange-500',
  'from-teal-500 to-cyan-500',
  'from-violet-600 to-fuchsia-500',
  'from-blue-600 to-cyan-500',
]

export default function EventDetails() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [modalState, setModalState] = useState(null) // 'register' | 'unregister' | null

  useEffect(() => {
    if (!eventId) return

    const unsub = onSnapshot(doc(db, 'events', eventId), (snap) => {
      if (snap.exists()) {
        setEvent({ id: snap.id, eventId: snap.id, ...snap.data() })
      } else {
        setEvent(null)
      }
      setLoading(false)
    })

    return unsub
  }, [eventId])

  // Check registration status
  useEffect(() => {
    if (!eventId || !user) return

    async function checkReg() {
      const regRef = doc(db, 'events', eventId, 'registrations', user.uid)
      const snap = await getDoc(regRef)
      setIsRegistered(snap.exists() && !snap.data().banned)
    }
    checkReg()
  }, [eventId, user, event?.registeredCount])

  if (loading) return <LoadingSpinner />

  if (!event) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-text-primary font-semibold mb-2">Event not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-accent hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const spotsLeft = event.maxParticipants - (event.registeredCount || 0)
  const isFull = spotsLeft <= 0
  const gradient = GRADIENT_FALLBACKS[eventId.charCodeAt(0) % GRADIENT_FALLBACKS.length]

  async function handleConfirm() {
    if (!profile) return
    setRegistering(true)
    setModalState(null)
    
    if (modalState === 'register') {
      const success = await registerForEvent(eventId, profile)
      if (success) setIsRegistered(true)
    } else if (modalState === 'unregister') {
      const success = await unregisterFromEvent(eventId, profile.uid)
      if (success) setIsRegistered(false)
    }
    
    setRegistering(false)
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Poster / Banner */}
      <div className="relative h-64 sm:h-80">
        {event.posterURL ? (
          <img
            src={event.posterURL}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-white/60 text-6xl font-bold">{event.name?.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-8 relative z-10 pb-8">
        <div className="bg-bg-card border border-bg-border rounded-2xl p-5 shadow-lg">
          {/* Title */}
          <h1 className="text-xl font-bold text-text-primary mb-4">{event.name}</h1>

          {/* Info Grid */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-start gap-3 p-3 bg-bg-elevated rounded-xl">
              <CalendarIcon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Date & Time</p>
                <p className="text-sm text-text-primary font-medium">{formatDateTime(event.dateTime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-elevated rounded-xl">
              <MapPinIcon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Venue</p>
                <p className="text-sm text-text-primary font-medium">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-elevated rounded-xl">
              <UsersIcon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Participants</p>
                <p className="text-sm text-text-primary font-medium">
                  {event.registeredCount || 0} / {event.maxParticipants}
                  {spotsLeft > 0 && spotsLeft <= 5 && (
                    <span className="text-warning ml-2 text-xs">({spotsLeft} left)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">
                About this event
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Instructions (shown after registration) */}
          {isRegistered && event.instructions && (
            <div className="mb-5 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-accent">Instructions</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {event.instructions}
              </p>
            </div>
          )}

          {/* Register / Unregister Button */}
          <button
            onClick={() => {
              if (isRegistered) setModalState('unregister')
              else if (!isFull) setModalState('register')
            }}
            disabled={(!isRegistered && isFull) || registering}
            className={`w-full h-12 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 group/btn
              ${isRegistered
                ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-red-500/10 hover:text-danger hover:border-danger/20'
                : isFull
                  ? 'bg-bg-elevated text-text-muted border border-bg-border cursor-not-allowed'
                  : 'bg-accent text-white hover:bg-accent-light shadow-glow-sm hover:shadow-glow'
              }`}
          >
            {registering ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : isRegistered ? (
              <span className="group-hover/btn:hidden">✓ Already Registered</span>
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
        onCancel={() => setModalState(null)}
      />
    </div>
  )
}
