// src/context/EventsContext.jsx
// Shared events cache — prevents skeleton flashes when switching tabs
// Data is loaded once and stays in memory across page navigations

import { createContext, useContext, useState, useEffect } from 'react'
import {
  collection,
  collectionGroup,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'

const EventsContext = createContext(null)

export function useEventsContext() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEventsContext must be used inside EventsProvider')
  return ctx
}

export default function EventsProvider({ children }) {
  const { user } = useAuth()

  // ── Events (shared across Dashboard, MyEvents, EventDetails) ──
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('dateTime', 'desc'))

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, eventId: d.id, ...d.data() }))
      setEvents(list)
      setEventsLoading(false)
    }, (err) => {
      console.error('Events listener error:', err)
      setEventsLoading(false)
    })

    return unsub
  }, [])

  // ── User registrations (shared across Dashboard, MyEvents) ──
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set())
  const [waitlistedEventIds, setWaitlistedEventIds] = useState(new Set())
  const [registrations, setRegistrations] = useState([])
  const [regsLoading, setRegsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRegisteredEventIds(new Set())
      setWaitlistedEventIds(new Set())
      setRegistrations([])
      setRegsLoading(false)
      return
    }

    if (eventsLoading) return

    const q = query(
      collectionGroup(db, 'registrations'),
      where('uid', '==', user.uid)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const regIds = new Set()
      const waitIds = new Set()
      const regList = []

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data()
        if (data.banned) return

        const eventId = docSnap.ref.parent.parent.id

        if (data.status === 'waitlisted') waitIds.add(eventId)
        else regIds.add(eventId)

        const eventData = events.find(e => e.id === eventId) || { id: eventId, eventId }
        regList.push({ ...data, eventId, eventData })
      })

      regList.sort((a, b) => {
        const dateA = a.eventData?.dateTime?.toDate?.() || new Date(0)
        const dateB = b.eventData?.dateTime?.toDate?.() || new Date(0)
        return dateB - dateA
      })

      setRegisteredEventIds(regIds)
      setWaitlistedEventIds(waitIds)
      setRegistrations(regList)
      setRegsLoading(false)
    }, (err) => {
      console.error('User registrations listener error:', err)
      setRegsLoading(false)
    })

    return unsub
  }, [user, events, eventsLoading])

  // ── Pending team invites (shared — survives tab switches) ──
  const [pendingInvites, setPendingInvites] = useState([])

  useEffect(() => {
    if (!user) {
      setPendingInvites([])
      return
    }

    const q = query(
      collectionGroup(db, 'teams'),
      where('invitedUids', 'array-contains', user.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      const invites = []
      snap.docs.forEach(docSnap => {
        const data = { id: docSnap.id, ...docSnap.data() }
        const myMember = data.members?.find(m => m.uid === user.uid)
        if (myMember?.status === 'pending' && data.status !== 'cancelled') {
          const eventId = docSnap.ref.parent.parent.id
          invites.push({ ...data, eventId })
        }
      })
      setPendingInvites(invites)
    })

    return unsub
  }, [user])

  return (
    <EventsContext.Provider value={{
      events,
      eventsLoading,
      registeredEventIds,
      waitlistedEventIds,
      registrations,
      regsLoading,
      pendingInvites,
    }}>
      {children}
    </EventsContext.Provider>
  )
}
