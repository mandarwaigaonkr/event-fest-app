// src/pages/user/Dashboard.jsx
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
  const [activeTab, setActiveTab] = useState('upcoming')
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
    <div className="min-h-screen bg-bg-base pb-20 transition-colors duration-200">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/95 backdrop-blur-md border-b border-bg-border">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
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

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
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
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'upcoming'
                  ? 'bg-bg-card text-text-primary shadow-soft'
                  : 'text-text-muted'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('attended')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'attended'
                  ? 'bg-bg-card text-text-primary shadow-soft'
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
        {loading ? (
          <div className="flex flex-col gap-4">
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
