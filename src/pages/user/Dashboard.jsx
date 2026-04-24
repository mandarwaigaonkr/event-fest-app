// src/pages/user/Dashboard.jsx
// User home — greeting, search, event listing

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useEvents, useUserRegistrations, registerForEvent, unregisterFromEvent } from '../../hooks/useEvents'
import { useTheme } from '../../context/ThemeContext'
import EventCard from '../../components/EventCard'
import Navbar from '../../components/Navbar'
import { MagnifyingGlassIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { events, loading: eventsLoading } = useEvents()
  const { registeredEventIds, waitlistedEventIds, registrations, loading: regsLoading } = useUserRegistrations()
  const { isDark, toggleTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming' | 'attended'
  const [registeringId, setRegisteringId] = useState(null)

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
    <div className="min-h-screen bg-bg-base pb-32 transition-colors duration-300 relative overflow-hidden">
      
      {/* Neumorphic Diagonal Background Splash */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-30%] w-[150%] h-[70%] bg-neu-diagonal -rotate-12 opacity-80 blur-[2px]" />
      </div>

      {/* Header */}
      <div className="relative z-40 pt-12 pb-4">
        <div className="max-w-lg mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
              Explore Events
            </h1>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-10 h-10 rounded-xl border border-white/10 shadow-neu-out"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center shadow-neu-out border border-white/5">
                <span className="text-white text-sm font-bold">
                  {firstName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-6 shadow-neu-out rounded-2xl">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-bg-elevated/80 backdrop-blur-md border border-white/5 text-sm text-white placeholder-white/40 outline-none focus:border-accent transition-all shadow-inner"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap shadow-neu-out border border-white/5 ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-br from-accent to-accent-light text-white shadow-glow-sm'
                  : 'bg-bg-elevated text-text-secondary hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('attended')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap shadow-neu-out border border-white/5 ${
                activeTab === 'attended'
                  ? 'bg-gradient-to-br from-accent to-accent-light text-white shadow-glow-sm'
                  : 'bg-bg-elevated text-text-secondary hover:text-white'
              }`}
            >
              Attended
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-6 pt-2">
        {loading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-elevated rounded-[32px] overflow-hidden animate-pulse shadow-neu-out">
                <div className="h-48 m-4 rounded-2xl bg-bg-card" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-bg-elevated rounded w-3/4" />
                  <div className="h-3 bg-bg-elevated rounded w-1/2" />
                  <div className="h-3 bg-bg-elevated rounded w-2/3" />
                  <div className="h-11 bg-bg-elevated rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
              <span className="text-3xl">🎪</span>
            </div>
            <h2 className="text-base font-semibold text-text-primary mb-1">
              {search ? 'No events found' : activeTab === 'upcoming' ? 'No upcoming events' : 'No attended events'}
            </h2>
            <p className="text-sm text-text-muted max-w-xs">
              {search
                ? `Nothing matched "${search}". Try a different search.`
                : activeTab === 'upcoming'
                ? 'Check back later for new events. Exciting things are coming soon!'
                : "You haven't attended any events yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">
                {activeTab === 'upcoming' ? 'All Events' : 'Past Events'}
              </h2>
              <span className="text-xs font-bold text-white/30 bg-white/5 px-2 py-1 rounded-md">
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

      <div className="relative z-50">
        <Navbar />
      </div>
    </div>
  )
}
