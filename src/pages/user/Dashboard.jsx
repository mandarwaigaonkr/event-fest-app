// src/pages/user/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collectionGroup, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { useEventsContext } from '../../context/EventsContext'
import { registerForEvent, unregisterFromEvent } from '../../hooks/useEvents'

import EventCard from '../../components/EventCard'
import Navbar from '../../components/Navbar'
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline'

import christLogo from '../../assets/Christ complete logo.png'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { events, eventsLoading, registeredEventIds, waitlistedEventIds, registrations, regsLoading } = useEventsContext()

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming')
  const [registeringId, setRegisteringId] = useState(null)
  const [pendingInvites, setPendingInvites] = useState([])

  // Listen for pending team invites across all events
  useEffect(() => {
    if (!user) return

    const q = query(
      collectionGroup(db, 'teams'),
      where('invitedUids', 'array-contains', user.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      const invites = []
      snap.docs.forEach(doc => {
        const data = { id: doc.id, ...doc.data() }
        // Only show if user's status is still 'pending'
        const myMember = data.members?.find(m => m.uid === user.uid)
        if (myMember?.status === 'pending' && data.status !== 'cancelled') {
          // Extract eventId from the document reference path: events/{eventId}/teams/{teamId}
          const eventId = doc.ref.parent.parent.id
          invites.push({ ...data, eventId })
        }
      })
      setPendingInvites(invites)
    })

    return unsub
  }, [user])

  const loading = eventsLoading || regsLoading
  const activeEvents = events.filter(e => e.status === 'active')

  const upcomingEvents = search.trim()
    ? activeEvents.filter(e =>
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.venue?.toLowerCase().includes(search.toLowerCase())
      )
    : activeEvents

  const attendedEventsList = registrations
    .filter(r => r.attendance === 'present')
    .map(r => r.eventData)

  const attendedEvents = search.trim()
    ? attendedEventsList.filter(e =>
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.venue?.toLowerCase().includes(search.toLowerCase())
      )
    : attendedEventsList

  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : attendedEvents

  async function handleRegister(event) {
    if (!profile) return
    setRegisteringId(event.id)
    await registerForEvent(event.id, profile)
    setRegisteringId(null)
  }

  async function handleUnregister(event) {
    if (!profile) return
    setRegisteringId(event.id)
    await unregisterFromEvent(event.id, profile.uid)
    setRegisteringId(null)
  }

  const firstName = user?.displayName?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-bg-base pb-20 transition-colors duration-200">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/95 backdrop-blur-md border-b border-bg-border">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="flex items-center gap-3 cursor-pointer pressable"
              onClick={() => navigate('/profile')}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{firstName.charAt(0)}</span>
                </div>
              )}
              <div>
                <h1 className="text-base font-semibold text-text-primary leading-tight">
                  Hey, {firstName}
                </h1>
                <p className="text-xs text-text-muted">Find your next event</p>
              </div>
            </div>

            <img 
              src={christLogo} 
              alt="Christ Logo" 
              className="h-10 object-contain"
            />
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-bg-elevated text-sm text-text-primary placeholder-text-muted outline-none border border-transparent focus:border-accent/30 transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-bg-elevated p-0.5 rounded-xl">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg pressable ${
                activeTab === 'upcoming'
                  ? 'bg-bg-card text-text-primary shadow-soft animate-scale-in'
                  : 'text-text-muted'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('attended')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg pressable ${
                activeTab === 'attended'
                  ? 'bg-bg-card text-text-primary shadow-soft animate-scale-in'
                  : 'text-text-muted'
              }`}
            >
              Attended
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Pending Team Invites */}
        {pendingInvites.length > 0 && (
          <div className="flex flex-col gap-3 mb-4 stagger-list">
            {pendingInvites.map(invite => {
              const leaderName = invite.members?.find(m => m.uid === invite.leaderUid)?.name || 'Someone'
              const eventName = events.find(e => e.id === invite.eventId)?.name || 'an event'
              return (
                <div
                  key={invite.id}
                  onClick={() => navigate(`/event/${invite.eventId}`)}
                  className="bg-accent/10 border border-accent/20 rounded-2xl p-4 cursor-pointer hover:bg-accent/15 interactive-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                      <UserGroupIcon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        Team Invite: &quot;{invite.name}&quot;
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        <span className="font-medium">{leaderName}</span> invited you to join for <span className="font-medium">{eventName}</span>
                      </p>
                      <p className="text-[11px] text-accent font-medium mt-1.5">Tap to view & respond →</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {loading ? (
          <div className="flex flex-col gap-4 stagger-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-bg-elevated" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-bg-elevated rounded w-3/4" />
                  <div className="h-3 bg-bg-elevated rounded w-1/2" />
                  <div className="h-3 bg-bg-elevated rounded w-2/3" />
                  <div className="h-10 bg-bg-elevated rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
            <div className="text-4xl mb-3">🎪</div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">
              {search ? 'No events found' : activeTab === 'upcoming' ? 'No upcoming events' : 'No attended events'}
            </h2>
            <p className="text-xs text-text-muted max-w-[240px]">
              {search
                ? `Nothing matched "${search}".`
                : activeTab === 'upcoming'
                ? 'Check back later for new events!'
                : "You haven't attended any events yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                {displayEvents.length} event{displayEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            {displayEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isRegistered={registeredEventIds.has(event.id)}
                isWaitlisted={waitlistedEventIds.has(event.id)}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                registering={registeringId === event.id}
              />
            ))}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}
