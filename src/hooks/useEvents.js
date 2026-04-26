// src/hooks/useEvents.js
// Real-time event listener + registration logic

import { useState, useEffect } from 'react'
import {
  collection,
  collectionGroup,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
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
 * Hook: Check which events the current user has registered for.
 * Uses a single collectionGroup query instead of N per-event listeners.
 * Accepts events list from the caller to avoid creating a duplicate useEvents() listener.
 */
export function useUserRegistrations(events = [], eventsLoading = false) {
  const { user } = useAuth()
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set())
  const [waitlistedEventIds, setWaitlistedEventIds] = useState(new Set())
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRegisteredEventIds(new Set())
      setWaitlistedEventIds(new Set())
      setRegistrations([])
      setLoading(false)
      return
    }

    if (eventsLoading) return

    // Single listener across ALL registrations for this user
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

        // Extract eventId from path: events/{eventId}/registrations/{uid}
        const eventId = docSnap.ref.parent.parent.id

        if (data.status === 'waitlisted') waitIds.add(eventId)
        else regIds.add(eventId)

        const eventData = events.find(e => e.id === eventId) || { id: eventId, eventId }
        regList.push({
          ...data,
          eventId,
          eventData,
        })
      })

      // Sort by event date descending
      regList.sort((a, b) => {
        const dateA = a.eventData?.dateTime?.toDate?.() || new Date(0)
        const dateB = b.eventData?.dateTime?.toDate?.() || new Date(0)
        return dateB - dateA
      })

      setRegisteredEventIds(regIds)
      setWaitlistedEventIds(waitIds)
      setRegistrations(regList)
      setLoading(false)
    }, (err) => {
      console.error('User registrations listener error:', err)
      setLoading(false)
    })

    return unsub
  }, [user, events, eventsLoading])

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

      if (eventData.isTeamEvent && regData.teamId) {
        const teamRef = doc(db, 'events', eventId, 'teams', regData.teamId)
        const teamDoc = await transaction.get(teamRef)
        if (teamDoc.exists()) {
          const teamData = teamDoc.data()
          if (teamData.leaderUid === userId) {
             // Leader unregistering cancels the team
             transaction.update(teamRef, { status: 'cancelled' })
             if (isWaitlisted) {
               transaction.update(eventRef, {
                 waitlistCount: Math.max(0, (eventData.waitlistCount || 0) - 1),
                 waitlistTeamsCount: Math.max(0, (eventData.waitlistTeamsCount || 0) - 1)
               })
             } else {
               transaction.update(eventRef, {
                 registeredCount: Math.max(0, (eventData.registeredCount || 0) - 1),
                 registeredTeamsCount: Math.max(0, (eventData.registeredTeamsCount || 0) - 1)
               })
             }
          } else {
             // Member unregistering leaves the team
             const newMemberUids = (teamData.memberUids || []).filter(uid => uid !== userId)
             const newMembers = (teamData.members || []).map(m => m.uid === userId ? { ...m, status: 'left' } : m)
             transaction.update(teamRef, { memberUids: newMemberUids, members: newMembers, status: 'incomplete' })
             
             if (isWaitlisted) {
               transaction.update(eventRef, { waitlistCount: Math.max(0, (eventData.waitlistCount || 0) - 1) })
             } else {
               transaction.update(eventRef, { registeredCount: Math.max(0, (eventData.registeredCount || 0) - 1) })
             }
          }
        }
      } else {
        // Individual event logic
        if (isWaitlisted) {
          transaction.update(eventRef, {
            waitlistCount: Math.max(0, (eventData.waitlistCount || 0) - 1),
          })
        } else {
          transaction.update(eventRef, {
            registeredCount: Math.max(0, (eventData.registeredCount || 0) - 1),
          })
        }
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

/**
 * Create a team and register the leader
 */
export async function createTeamRegistration(eventId, teamName, membersData, userProfile) {
  const eventRef = doc(db, 'events', eventId)
  const teamRef = doc(collection(db, 'events', eventId, 'teams'))
  const regRef = doc(db, 'events', eventId, 'registrations', userProfile.uid)

  try {
    await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef)
      if (!eventDoc.exists()) throw new Error('Event not found')

      const eventData = eventDoc.data()
      if (!eventData.isTeamEvent) throw new Error('Not a team event')

      const existingReg = await transaction.get(regRef)
      if (existingReg.exists()) throw new Error('You are already registered')

      const invitedMembers = membersData.filter(member => member.uid !== userProfile.uid)
      const invitedRegDocs = await Promise.all(
        invitedMembers.map(member =>
          transaction.get(doc(db, 'events', eventId, 'registrations', member.uid))
        )
      )

      invitedRegDocs.forEach((regDoc, index) => {
        if (!regDoc.exists()) return

        const memberName = invitedMembers[index]?.name || 'This member'
        const regData = regDoc.data()

        if (regData.teamId) {
          throw new Error(`${memberName} is already part of a team for this event`)
        }

        throw new Error(`${memberName} is already registered for this event`)
      })

      const currentTeamsCount = eventData.registeredTeamsCount || 0
      const isWaitlisted = currentTeamsCount >= eventData.maxTeams

      // Create team doc
      transaction.set(teamRef, {
        name: teamName,
        leaderUid: userProfile.uid,
        members: membersData,
        memberUids: [userProfile.uid],
        invitedUids: membersData.filter(m => m.status === 'pending').map(m => m.uid),
        status: 'incomplete', // Will become valid when enough members accept
        isWaitlisted: isWaitlisted,
        createdAt: serverTimestamp()
      })

      // Create leader registration
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
        teamId: teamRef.id
      })

      if (!isWaitlisted) {
        transaction.update(eventRef, {
          registeredCount: (eventData.registeredCount || 0) + 1,
          registeredTeamsCount: currentTeamsCount + 1,
        })
      } else {
        transaction.update(eventRef, {
          waitlistCount: (eventData.waitlistCount || 0) + 1,
          waitlistTeamsCount: (eventData.waitlistTeamsCount || 0) + 1,
        })
      }
    })

    toast.success('Team created! Invites sent. 🎉')
    return true
  } catch (err) {
    console.error('Team creation error:', err)
    toast.error(err.message || 'Failed to create team.')
    return false
  }
}

/**
 * Respond to a team invite (accept/reject)
 */
export async function respondToTeamInvite(eventId, teamId, userProfile, accept) {
  const eventRef = doc(db, 'events', eventId)
  const teamRef = doc(db, 'events', eventId, 'teams', teamId)
  const regRef = doc(db, 'events', eventId, 'registrations', userProfile.uid)

  try {
    await runTransaction(db, async (transaction) => {
      const teamDoc = await transaction.get(teamRef)
      if (!teamDoc.exists()) throw new Error('Team not found')

      const teamData = teamDoc.data()
      const memberIndex = teamData.members.findIndex(m => m.uid === userProfile.uid)
      
      if (memberIndex === -1) throw new Error('You are not invited to this team')
      if (teamData.members[memberIndex].status !== 'pending') throw new Error('Invite already processed')

      if (!accept) {
        // Reject
        teamData.members[memberIndex].status = 'rejected'
        const newInvitedUids = (teamData.invitedUids || []).filter(uid => uid !== userProfile.uid)
        transaction.update(teamRef, { 
          members: teamData.members,
          invitedUids: newInvitedUids
        })
        return
      }

      // Accept
      const eventDoc = await transaction.get(eventRef)
      const eventData = eventDoc.data()

      const existingReg = await transaction.get(regRef)
      if (existingReg.exists()) {
        throw new Error(existingReg.data().teamId
          ? 'You are already part of a team for this event'
          : 'You are already registered for this event'
        )
      }

      const isWaitlisted = teamData.isWaitlisted === true

      // Update team member status
      teamData.members[memberIndex].status = 'accepted'
      
      // Check if team becomes valid
      const acceptedCount = teamData.members.filter(m => m.status === 'accepted' || m.status === 'leader').length
      const teamStatus = acceptedCount >= (eventData.minTeamSize || 1) ? 'valid' : 'incomplete'

      const newInvitedUids = (teamData.invitedUids || []).filter(uid => uid !== userProfile.uid)
      const newMemberUids = [...(teamData.memberUids || []), userProfile.uid]

      transaction.update(teamRef, { 
        members: teamData.members,
        invitedUids: newInvitedUids,
        memberUids: newMemberUids,
        status: teamStatus
      })

      // Create registration
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
        teamId: teamRef.id
      })

      if (!isWaitlisted) {
        transaction.update(eventRef, { registeredCount: (eventData.registeredCount || 0) + 1 })
      } else {
        transaction.update(eventRef, { waitlistCount: (eventData.waitlistCount || 0) + 1 })
      }
    })

    toast.success(accept ? 'Joined team!' : 'Invite rejected')
    return true
  } catch (err) {
    console.error('Invite response error:', err)
    toast.error(err.message || 'Failed to process invite.')
    return false
  }
}

/**
 * Invite one more member to an existing team.
 * Only the team leader can invite, and the invite cannot exceed maxTeamSize.
 */
export async function inviteTeamMember(eventId, teamId, regNumber, leaderUid) {
  const cleanRegNumber = regNumber.trim()

  if (!cleanRegNumber) {
    toast.error('Enter a registration number')
    return false
  }

  try {
    const userQuery = query(collection(db, 'users'), where('regNumber', '==', cleanRegNumber), limit(1))
    const userSnap = await getDocs(userQuery)

    if (userSnap.empty) {
      throw new Error(`Registration number ${cleanRegNumber} is not registered on the platform.`)
    }

    const invitee = userSnap.docs[0].data()
    const eventRef = doc(db, 'events', eventId)
    const teamRef = doc(db, 'events', eventId, 'teams', teamId)
    const inviteeRegRef = doc(db, 'events', eventId, 'registrations', invitee.uid)

    await runTransaction(db, async (transaction) => {
      const [eventDoc, teamDoc, inviteeRegDoc] = await Promise.all([
        transaction.get(eventRef),
        transaction.get(teamRef),
        transaction.get(inviteeRegRef),
      ])

      if (!eventDoc.exists()) throw new Error('Event not found')
      if (!teamDoc.exists()) throw new Error('Team not found')

      const eventData = eventDoc.data()
      const teamData = teamDoc.data()

      if (!eventData.isTeamEvent) throw new Error('Not a team event')
      if (teamData.leaderUid !== leaderUid) throw new Error('Only the team leader can invite members')
      if (teamData.status === 'cancelled') throw new Error('This team has been cancelled')
      if (invitee.uid === leaderUid) throw new Error('You cannot invite yourself')
      if (inviteeRegDoc.exists()) {
        throw new Error(inviteeRegDoc.data().teamId
          ? 'This member is already part of a team for this event'
          : 'This member is already registered for this event'
        )
      }

      const members = teamData.members || []
      const activeMembers = members.filter(m => !['rejected', 'left'].includes(m.status))
      const existingMember = members.find(m => m.uid === invitee.uid)

      if (existingMember && existingMember.status !== 'rejected' && existingMember.status !== 'left') {
        throw new Error('This user is already in your team or has a pending invite')
      }

      if (activeMembers.length >= eventData.maxTeamSize) {
        throw new Error(`Your team already has the maximum ${eventData.maxTeamSize} members`)
      }

      const nextMembers = existingMember
        ? members.map(m => m.uid === invitee.uid ? {
            uid: invitee.uid,
            regNumber: invitee.regNumber || cleanRegNumber,
            name: invitee.name || 'Unknown',
            status: 'pending',
          } : m)
        : [
            ...members,
            {
              uid: invitee.uid,
              regNumber: invitee.regNumber || cleanRegNumber,
              name: invitee.name || 'Unknown',
              status: 'pending',
            },
          ]

      const nextInvitedUids = Array.from(new Set([...(teamData.invitedUids || []), invitee.uid]))
      const acceptedCount = nextMembers.filter(m => m.status === 'accepted' || m.status === 'leader').length

      transaction.update(teamRef, {
        members: nextMembers,
        invitedUids: nextInvitedUids,
        status: acceptedCount >= (eventData.minTeamSize || 1) ? 'valid' : 'incomplete',
      })
    })

    toast.success('Invite sent')
    return true
  } catch (err) {
    console.error('Team invite error:', err)
    toast.error(err.message || 'Failed to send invite')
    return false
  }
}
