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
    <div className="min-h-screen bg-bg-base pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-accent/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {firstName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-text-primary">
                  Hello, {firstName}
                </h1>
                <p className="text-xs text-text-muted">
                  Explore upcoming events
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-bg-elevated border border-bg-border text-text-secondary hover:text-accent hover:border-accent/50 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-bg-elevated border border-bg-border text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex bg-bg-elevated p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-bg-card text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('attended')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'attended'
                  ? 'bg-bg-card text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Attended
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-bg-elevated" />
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                {activeTab === 'upcoming' ? 'Upcoming Events' : 'Attended Events'}
              </h2>
              <span className="text-xs text-text-muted">
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
