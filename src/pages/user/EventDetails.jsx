// src/pages/user/EventDetails.jsx
// Full event details page — poster, description, venue, register button

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { registerForEvent, unregisterFromEvent, respondToTeamInvite } from '../../hooks/useEvents'
import { formatDateTime } from '../../utils/formatters'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import TeamRegistrationModal from '../../components/TeamRegistrationModal'
import TeamInfoPanel from '../../components/TeamInfoPanel'
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
  const [isWaitlisted, setIsWaitlisted] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [modalState, setModalState] = useState(null) // 'register' | 'unregister' | null
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [pendingInvite, setPendingInvite] = useState(null)

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

    const regRef = doc(db, 'events', eventId, 'registrations', user.uid)
    const unsub = onSnapshot(regRef, (snap) => {
      if (snap.exists() && !snap.data().banned) {
        if (snap.data().status === 'waitlisted') {
          setIsRegistered(false)
          setIsWaitlisted(true)
        } else {
          setIsRegistered(true)
          setIsWaitlisted(false)
        }
      } else {
        setIsRegistered(false)
        setIsWaitlisted(false)
      }
    })

    return unsub
  }, [eventId, user])

  // Check for pending team invites
  useEffect(() => {
    if (!eventId || !user || !event?.isTeamEvent || isRegistered) return

    const unsub = onSnapshot(
      query(collection(db, 'events', eventId, 'teams'), where('invitedUids', 'array-contains', user.uid)),
      (snap) => {
        if (!snap.empty) {
          // Find the team where user is still 'pending'
          for (const doc of snap.docs) {
            const teamData = { id: doc.id, ...doc.data() }
            const myStatus = teamData.members.find(m => m.uid === user.uid)?.status
            if (myStatus === 'pending') {
              setPendingInvite(teamData)
              return
            }
          }
        }
        setPendingInvite(null)
      }
    )
    return unsub
  }, [eventId, user, event?.isTeamEvent, isRegistered])

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

  const spotsLeft = event.isTeamEvent
    ? event.maxTeams - (event.registeredTeamsCount || 0)
    : event.maxParticipants - (event.registeredCount || 0)
  const isFull = spotsLeft <= 0
  const gradient = GRADIENT_FALLBACKS[eventId.charCodeAt(0) % GRADIENT_FALLBACKS.length]

  async function handleConfirm() {
    if (!profile) return
    setRegistering(true)
    setModalState(null)
    
    if (modalState === 'register') {
      const success = await registerForEvent(eventId, profile)
      if (success) {
        // Will check waitlist condition in the next effect run, but optimistic:
        if (isFull) setIsWaitlisted(true)
        else setIsRegistered(true)
      }
    } else if (modalState === 'unregister') {
      const success = await unregisterFromEvent(eventId, profile.uid)
      if (success) {
        setIsRegistered(false)
        setIsWaitlisted(false)
      }
    }
    
    setRegistering(false)
  }

  async function handleInviteResponse(accept) {
    if (!profile || !pendingInvite) return
    setRegistering(true)
    const success = await respondToTeamInvite(eventId, pendingInvite.id, profile, accept)
    if (success && accept) {
      setIsRegistered(true)
      setPendingInvite(null)
    } else if (success && !accept) {
      setPendingInvite(null)
    }
    setRegistering(false)
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Poster / Banner */}
      <div className="relative h-64 sm:h-80 animate-fade-in">
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
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 pressable"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-8 relative z-10 pb-8 animate-fade-up">

        {/* Pending Invite Banner */}
        {pendingInvite && !isRegistered && (
          <div className="bg-accent text-white rounded-2xl p-4 shadow-xl mb-4 animate-fade-up border border-accent-light">
            <h3 className="font-bold text-base mb-1">Team Invitation</h3>
            <p className="text-sm text-white/90 mb-4">
              <span className="font-semibold">{pendingInvite.members.find(m=>m.uid===pendingInvite.leaderUid)?.name || 'Someone'}</span> invited you to join team <span className="font-bold">&quot;{pendingInvite.name}&quot;</span>.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleInviteResponse(true)}
                disabled={registering}
                className="flex-1 bg-white text-accent py-2 rounded-xl text-sm font-bold hover:bg-white/90 pressable disabled:opacity-50"
              >
                Accept & Register
              </button>
              <button 
                onClick={() => handleInviteResponse(false)}
                disabled={registering}
                className="flex-1 bg-black/20 text-white py-2 rounded-xl text-sm font-bold hover:bg-black/30 pressable disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </div>
        )}

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
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
                  {event.isTeamEvent ? 'Teams' : 'Participants'}
                </p>
                <p className="text-sm text-text-primary font-medium">
                  {event.isTeamEvent ? (event.registeredTeamsCount || 0) : (event.registeredCount || 0)} / {event.isTeamEvent ? event.maxTeams : event.maxParticipants}
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
          {!pendingInvite && (
            <button
              onClick={() => {
                if (isRegistered || isWaitlisted) {
                  setModalState('unregister')
                } else {
                  if (event.isTeamEvent) {
                    setShowTeamModal(true)
                  } else {
                    setModalState('register')
                  }
                }
              }}
              disabled={registering}
              className={`w-full h-12 rounded-xl text-sm font-semibold pressable flex items-center justify-center gap-2 group/btn
                ${(isRegistered || isWaitlisted)
                  ? 'bg-bg-elevated text-text-primary border border-bg-border hover:bg-red-500/10 hover:text-danger hover:border-danger/20'
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
              ) : isWaitlisted ? (
                <span className="group-hover/btn:hidden">⏳ Waitlisted</span>
              ) : isFull ? (
                'Join Waitlist'
              ) : (
                event.isTeamEvent ? 'Register (Create Team)' : 'Register Now'
              )}
              {(isRegistered || isWaitlisted) && !registering && (
                <span className="hidden group-hover/btn:inline">
                  {isWaitlisted ? 'Leave Waitlist' : 'Cancel Registration'}
                </span>
              )}
            </button>
          )}
        </div>

        {/* My Team Panel */}
        {event.isTeamEvent && (isRegistered || isWaitlisted) && (
          <TeamInfoPanel eventId={eventId} userId={user?.uid} event={event} />
        )}
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
        onCancel={() => setModalState(null)}
      />

      <TeamRegistrationModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        event={event}
        currentUser={user}
        profile={profile}
        onSuccess={() => setIsRegistered(true)}
      />
    </div>
  )
}
