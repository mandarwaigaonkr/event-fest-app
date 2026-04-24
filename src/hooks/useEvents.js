// src/hooks/useEvents.js
// Real-time event listener + registration logic

import { useState, useEffect } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
  where,
  getDocs,
  limit,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

/**
 * Hook: Listen to all active events in real time
 */
export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      orderBy('dateTime', 'desc')
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, eventId: d.id, ...d.data() }))
      setEvents(list)
      setLoading(false)
    }, (err) => {
      console.error('Events listener error:', err)
      setLoading(false)
    })

    return unsub
  }, [])

  return { events, loading }
}

/**
 * Hook: Check which events the current user has registered for
 */
export function useUserRegistrations() {
  const { user } = useAuth()
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set())
  const [waitlistedEventIds, setWaitlistedEventIds] = useState(new Set())
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRegisteredEventIds(new Set())
      setRegistrations([])
      setLoading(false)
      return
    }

    // Listen to all events, then check subcollections
    // We query each event's registrations subcollection for this user
    const eventsUnsub = onSnapshot(collection(db, 'events'), async (eventsSnap) => {
      const regIds = new Set()
      const waitIds = new Set()
      const regList = []

      for (const eventDoc of eventsSnap.docs) {
        const regRef = doc(db, 'events', eventDoc.id, 'registrations', user.uid)
        const regSnap = await getDoc(regRef)
        if (regSnap.exists() && !regSnap.data().banned) {
          const regData = regSnap.data()
          if (regData.status === 'waitlisted') {
            waitIds.add(eventDoc.id)
          } else {
            regIds.add(eventDoc.id)
          }
          regList.push({
            ...regData,
            eventId: eventDoc.id,
            eventData: { id: eventDoc.id, eventId: eventDoc.id, ...eventDoc.data() },
          })
        }
      }

      setRegisteredEventIds(regIds)
      setWaitlistedEventIds(waitIds)
      setRegistrations(regList)
      setLoading(false)
    })

    return eventsUnsub
  }, [user])

  return { registeredEventIds, waitlistedEventIds, registrations, loading }
}

/**
 * Register user for an event using atomic transaction
 * Prevents race conditions and overbooking
 */
export async function registerForEvent(eventId, userProfile) {
  const eventRef = doc(db, 'events', eventId)
  const regRef = doc(db, 'events', eventId, 'registrations', userProfile.uid)

  try {
    await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef)

      if (!eventDoc.exists()) {
        throw new Error('Event not found')
      }

      const eventData = eventDoc.data()
      const currentCount = eventData.registeredCount || 0
      const maxParticipants = eventData.maxParticipants

      // Check if already registered
      const existingReg = await transaction.get(regRef)
      if (existingReg.exists()) {
        throw new Error('You are already registered for this event')
      }

      const isWaitlisted = currentCount >= maxParticipants

      // Create registration document
      transaction.set(regRef, {
        uid: userProfile.uid,
        name: userProfile.name,
        email: userProfile.email,
        regNumber: userProfile.regNumber || '',
        class: userProfile.class || '',
        department: userProfile.department || '',
        registeredAt: serverTimestamp(),
        attendance: 'not_marked',
        attendanceMarkedAt: null,
        banned: false,
        status: isWaitlisted ? 'waitlisted' : 'registered',
      })

      if (!isWaitlisted) {
        // Increment registered count
        transaction.update(eventRef, {
          registeredCount: currentCount + 1,
        })
      } else {
        // Increment waitlist count
        transaction.update(eventRef, {
          waitlistCount: (eventData.waitlistCount || 0) + 1,
        })
      }
    })

    toast.success('Registration successful! 🎉')
    return true
  } catch (err) {
    console.error('Registration error:', err)
    toast.error(err.message || 'Registration failed. Please try again.')
    return false
  }
}

/**
 * Unregister user from an event using atomic transaction
 */
export async function unregisterFromEvent(eventId, userId) {
  const eventRef = doc(db, 'events', eventId)
  const regRef = doc(db, 'events', eventId, 'registrations', userId)

  try {
    // 1. Fetch next in line (outside of transaction)
    const regsQuery = query(
      collection(db, 'events', eventId, 'registrations'),
      where('status', '==', 'waitlisted'),
      orderBy('registeredAt', 'asc'),
      limit(1)
    )
    const snap = await getDocs(regsQuery)
    const nextInLineDoc = snap.empty ? null : snap.docs[0]

    // 2. Run the atomic transaction
    await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef)
      if (!eventDoc.exists()) {
        throw new Error('Event not found')
      }

      const existingReg = await transaction.get(regRef)
      if (!existingReg.exists()) {
        throw new Error('You are not registered for this event')
      }

      const eventData = eventDoc.data()
      const regData = existingReg.data()
      const isWaitlisted = regData.status === 'waitlisted'

      // Delete registration document
      transaction.delete(regRef)

      if (isWaitlisted) {
        // Just decrement waitlist count
        transaction.update(eventRef, {
          waitlistCount: Math.max(0, (eventData.waitlistCount || 0) - 1),
        })
      } else {
        let newRegisteredCount = Math.max(0, (eventData.registeredCount || 0) - 1)
        let newWaitlistCount = eventData.waitlistCount || 0

        // Check if there are waitlisted users to promote
        if (newWaitlistCount > 0 && nextInLineDoc && nextInLineDoc.id !== userId) {
            const nextRef = doc(db, 'events', eventId, 'registrations', nextInLineDoc.id)
            const nextActualDoc = await transaction.get(nextRef)
            
            // Verify they are still waitlisted
            if (nextActualDoc.exists() && nextActualDoc.data().status === 'waitlisted') {
              transaction.update(nextRef, {
                status: 'registered'
              })

              newRegisteredCount += 1
              newWaitlistCount = Math.max(0, newWaitlistCount - 1)
            }
        }

        // Update event counts
        transaction.update(eventRef, {
          registeredCount: newRegisteredCount,
          waitlistCount: newWaitlistCount,
        })
      }
    })

    toast.success('Registration removed')
    return true
  } catch (err) {
    console.error('Unregistration error:', err)
    toast.error(err.message || 'Failed to remove registration.')
    return false
  }
}
