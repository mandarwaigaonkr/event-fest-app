// src/components/TeamInfoPanel.jsx
// Shows the user's team info inside the EventDetails page

import { useState, useEffect } from 'react'
import { onSnapshot, collection, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { inviteTeamMember } from '../hooks/useEvents'
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'

const STATUS_CONFIG = {
  leader: { label: 'Leader', icon: UserGroupIcon, color: 'text-accent', bg: 'bg-accent/10' },
  accepted: { label: 'Accepted', icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-500/10' },
  pending: { label: 'Pending', icon: ClockIcon, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  rejected: { label: 'Declined', icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-500/10' },
  left: { label: 'Left', icon: ArrowRightEndOnRectangleIcon, color: 'text-text-muted', bg: 'bg-bg-elevated' },
}

export default function TeamInfoPanel({ eventId, userId, event }) {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteRegNumber, setInviteRegNumber] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    if (!eventId || !userId) return

    // Listen for teams where user is a member
    const q = query(
      collection(db, 'events', eventId, 'teams'),
      where('memberUids', 'array-contains', userId)
    )

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        // Pick the first active team (non-cancelled)
        const activeTeam = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .find(t => t.status !== 'cancelled')
        setTeam(activeTeam || null)
      } else {
        setTeam(null)
      }
      setLoading(false)
    })

    return unsub
  }, [eventId, userId])

  if (loading || !team) return null

  const isLeader = team.leaderUid === userId
  const acceptedCount = team.members?.filter(m => m.status === 'accepted' || m.status === 'leader').length || 0
  const pendingCount = team.members?.filter(m => m.status === 'pending').length || 0
  const activeMembers = team.members?.filter(m => !['rejected', 'left'].includes(m.status)) || []
  const maxTeamSize = event?.maxTeamSize || team.members?.length || 0
  const canInviteMore = isLeader && activeMembers.length < maxTeamSize && team.status !== 'cancelled'

  async function handleInviteSubmit(e) {
    e.preventDefault()
    setInviteLoading(true)
    const success = await inviteTeamMember(eventId, team.id, inviteRegNumber, userId)
    if (success) {
      setInviteRegNumber('')
      setShowInviteForm(false)
    }
    setInviteLoading(false)
  }

  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden shadow-lg mt-4 animate-fade-up">
      {/* Header */}
      <div className="p-4 border-b border-bg-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <UserGroupIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">{team.name}</h3>
            <p className="text-[11px] text-text-muted">
              {isLeader ? 'You are the leader' : 'You are a member'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
            team.status === 'valid' 
              ? 'bg-green-500/10 text-green-500' 
              : team.status === 'cancelled' 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-yellow-500/10 text-yellow-500'
          }`}>
            {team.status === 'valid' ? 'Ready' : team.status === 'cancelled' ? 'Cancelled' : 'Incomplete'}
          </span>
          {team.isWaitlisted && (
            <span className="text-[10px] text-warning font-medium">Waitlisted</span>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 divide-x divide-bg-border border-b border-bg-border">
        <div className="py-2.5 text-center">
          <p className="text-base font-bold text-text-primary">{acceptedCount}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Confirmed</p>
        </div>
        <div className="py-2.5 text-center">
          <p className="text-base font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Pending</p>
        </div>
        <div className="py-2.5 text-center">
          <p className="text-base font-bold text-text-primary">{activeMembers.length}/{maxTeamSize}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Team Size</p>
        </div>
      </div>

      {/* Members List */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Team Members</p>
          {canInviteMore && (
            <button
              type="button"
              onClick={() => setShowInviteForm(prev => !prev)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-light pressable"
            >
              <UserPlusIcon className="w-3.5 h-3.5" />
              Invite
            </button>
          )}
        </div>

        {showInviteForm && canInviteMore && (
          <form onSubmit={handleInviteSubmit} className="flex gap-2 mb-3 animate-fade-up">
            <input
              type="text"
              value={inviteRegNumber}
              onChange={(e) => setInviteRegNumber(e.target.value)}
              placeholder="Registration number"
              className="min-w-0 flex-1 h-10 px-3 rounded-xl bg-bg-elevated border border-bg-border text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={inviteLoading}
              className="h-10 px-3 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-light pressable disabled:opacity-50"
            >
              {inviteLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-1.5">
          {team.members?.map((member, idx) => {
            const config = STATUS_CONFIG[member.status] || STATUS_CONFIG.pending
            const Icon = config.icon
            return (
              <div
                key={member.uid || idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-elevated/50"
              >
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                  <span className={`text-xs font-bold ${config.color}`}>
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {member.name || 'Unknown'}
                    {member.uid === userId && (
                      <span className="text-[10px] text-text-muted ml-1.5">(You)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {member.regNumber || 'No reg number'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  <span className={`text-[11px] font-semibold ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
