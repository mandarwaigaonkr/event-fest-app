// src/pages/admin/EventParticipants.jsx
// Admin view of registered participants — attendance marking, ban/remove, search

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../../firebase'
import Navbar from '../../components/Navbar'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'

export default function EventParticipants() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | present | absent | not_marked
  const [actionModal, setActionModal] = useState(null)
  const [teams, setTeams] = useState([])
  const [activeTab, setActiveTab] = useState('individuals') // 'individuals' | 'teams'

  // Load event
  useEffect(() => {
    if (!eventId) return
    const unsub = onSnapshot(doc(db, 'events', eventId), (snap) => {
      if (snap.exists()) setEvent({ id: snap.id, ...snap.data() })
      else setEvent(null)
    })
    return unsub
  }, [eventId])

  // Load registrations
  useEffect(() => {
    if (!eventId) return

    async function loadParticipants() {
      const regsSnap = await getDocs(collection(db, 'events', eventId, 'registrations'))
      const list = regsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort by registration time
      list.sort((a, b) => {
        const aTime = a.registeredAt?.toDate?.() || new Date(0)
        const bTime = b.registeredAt?.toDate?.() || new Date(0)
        return aTime - bTime
      })
      setParticipants(list)
      setLoading(false)
    }

    loadParticipants()

    // Re-fetch when event changes (registeredCount)
    const unsub = onSnapshot(doc(db, 'events', eventId), () => {
      loadParticipants()
    })
    return unsub
  }, [eventId])

  // Load teams
  useEffect(() => {
    if (!event?.isTeamEvent) return
    const unsub = onSnapshot(collection(db, 'events', eventId, 'teams'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
      setTeams(list)
    })
    return unsub
  }, [eventId, event?.isTeamEvent])

  // Filter & search
  const filtered = participants
    .filter(p => !p.banned)
    .filter(p => filter === 'all' || p.attendance === filter)
    .filter(p => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.regNumber?.toLowerCase().includes(q) ||
        p.class?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q)
      )
    })

  const presentCount = participants.filter(p => !p.banned && p.attendance === 'present').length
  const absentCount = participants.filter(p => !p.banned && p.attendance === 'absent').length

  async function handleConfirmAction() {
    if (!actionModal) return
    const { type, participant } = actionModal

    try {
      if (type === 'ban') {
        await updateDoc(
          doc(db, 'events', eventId, 'registrations', participant.id),
          { banned: true }
        )
        setParticipants(prev =>
          prev.map(p => p.id === participant.id ? { ...p, banned: true } : p)
        )
        toast.success(`${participant.name} has been banned`)
      } else if (type === 'remove') {
        await deleteDoc(doc(db, 'events', eventId, 'registrations', participant.id))
        // Decrement event count
        if (event) {
          await updateDoc(doc(db, 'events', eventId), {
            registeredCount: Math.max(0, (event.registeredCount || 0) - 1),
          })
        }
        setParticipants(prev => prev.filter(p => p.id !== participant.id))
        toast.success(`${participant.name} has been removed`)
      } else if (type === 'delete_team') {
        const { team } = actionModal
        // Note: Realistically we should also delete the registrations, but here we just delete the team document.
        await deleteDoc(doc(db, 'events', eventId, 'teams', team.id))
        toast.success(`Team "${team.name}" has been deleted`)
      }
    } catch {
      toast.error('Action failed')
    }
    setActionModal(null)
  }

  // Export participants as CSV based on current filter/search
  function exportCSV() {
    if (filtered.length === 0) {
      toast.error('No participants to export')
      return
    }

    const headers = ['#', 'Name', 'Email', 'Reg Number', 'Class', 'Department', 'Attendance']
    const rows = filtered.map((p, i) => [
      i + 1,
      p.name || '',
      p.email || '',
      p.regNumber || '',
      p.class || '',
      p.department || '',
      p.attendance || 'not_marked',
    ])

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    
    // Create a descriptive filename based on the current filter
    const filterName = filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)
    a.download = `${event?.name || 'Event'}_${filterName}_Participants.csv`
    
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filterName} list downloaded!`)
  }

  if (loading) return <LoadingSpinner />

  if (!event) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary font-semibold mb-2">Event not found</p>
          <button onClick={() => navigate('/admin')} className="text-sm text-accent hover:underline">
            Back to Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-bg-elevated pressable"
            >
              <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-text-primary truncate">{event.name}</h1>
              <p className="text-xs text-text-muted">Participant Management</p>
            </div>
            <button
              onClick={exportCSV}
              className="p-2 rounded-xl bg-bg-elevated border border-bg-border text-text-secondary hover:text-accent hover:border-accent/50 pressable"
              title="Export CSV"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>

          {event?.isTeamEvent && (
            <div className="flex bg-bg-elevated p-1 rounded-xl mb-4">
              <button 
                onClick={() => setActiveTab('individuals')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg pressable ${activeTab === 'individuals' ? 'bg-bg-card shadow text-text-primary animate-scale-in' : 'text-text-muted hover:text-text-primary'}`}
              >
                Individuals
              </button>
              <button 
                onClick={() => setActiveTab('teams')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg pressable ${activeTab === 'teams' ? 'bg-bg-card shadow text-text-primary animate-scale-in' : 'text-text-muted hover:text-text-primary'}`}
              >
                Teams ({teams.length})
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg py-2 text-center pressable text-xs font-medium ${
                filter === 'all' ? 'bg-accent text-white' : 'bg-bg-elevated text-text-secondary border border-bg-border'
              }`}
            >
              All ({participants.filter(p => !p.banned).length})
            </button>
            <button
              onClick={() => setFilter('present')}
              className={`rounded-lg py-2 text-center pressable text-xs font-medium ${
                filter === 'present' ? 'bg-green-500 text-white' : 'bg-bg-elevated text-text-secondary border border-bg-border'
              }`}
            >
              Present ({presentCount})
            </button>
            <button
              onClick={() => setFilter('absent')}
              className={`rounded-lg py-2 text-center pressable text-xs font-medium ${
                filter === 'absent' ? 'bg-red-500 text-white' : 'bg-bg-elevated text-text-secondary border border-bg-border'
              }`}
            >
              Absent ({absentCount})
            </button>
            <button
              onClick={() => setFilter('not_marked')}
              className={`rounded-lg py-2 text-center pressable text-xs font-medium ${
                filter === 'not_marked' ? 'bg-amber-500 text-white' : 'bg-bg-elevated text-text-secondary border border-bg-border'
              }`}
            >
              Pending
            </button>
          </div>

          {/* Take Attendance Button */}
          <button
            onClick={() => navigate(`/admin/events/${eventId}/attendance`)}
            className="w-full mb-3 flex items-center justify-center gap-2 py-3 bg-accent/10 border border-accent/30 text-accent rounded-xl text-sm font-semibold hover:bg-accent/20 pressable"
          >
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
            Take Attendance Mode
          </button>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={activeTab === 'teams' ? "Search teams..." : "Search by name, email, reg no..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-bg-elevated border border-bg-border text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-lg mx-auto px-4 pt-3">
        {activeTab === 'teams' ? (
          <div className="space-y-3 stagger-list">
            {teams.length === 0 ? (
              <div className="text-center py-16 text-sm text-text-muted">No teams created yet</div>
            ) : teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map(team => (
              <div key={team.id} className="bg-bg-card border border-bg-border rounded-xl p-4 interactive-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{team.name}</h3>
                    <p className="text-[10px] text-text-muted uppercase tracking-wide mt-0.5">
                      Status: <span className={team.status === 'valid' ? 'text-success' : 'text-warning'}>{team.status}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setActionModal({ type: 'delete_team', team })}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-red-500/10 pressable"
                    title="Delete Team"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {team.members.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-bg-elevated rounded-lg px-3 py-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-semibold text-text-primary truncate">{m.name} {m.status === 'leader' && '👑'}</p>
                        <p className="text-[10px] text-text-muted">{m.regNumber}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                        m.status === 'accepted' || m.status === 'leader' ? 'bg-success/10 text-success' :
                        m.status === 'rejected' ? 'bg-danger/10 text-danger' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-muted text-sm">
                {search ? 'No matching participants' : 'No participants yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 stagger-list">
            {filtered.map((p, index) => (
              <div
                key={p.id}
                className="bg-bg-card border border-bg-border rounded-xl p-3.5 flex items-start gap-3 interactive-card"
              >
                {/* Index */}
                <div className="w-7 h-7 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-text-muted">{index + 1}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{p.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{p.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {p.regNumber && (
                      <span className="px-1.5 py-0.5 bg-bg-elevated rounded text-[10px] font-medium text-text-secondary">
                        {p.regNumber}
                      </span>
                    )}
                    {p.class && (
                      <span className="px-1.5 py-0.5 bg-bg-elevated rounded text-[10px] font-medium text-text-secondary">
                        {p.class}
                      </span>
                    )}
                    {p.department && (
                      <span className="px-1.5 py-0.5 bg-accent/10 rounded text-[10px] font-medium text-accent">
                        {p.department}
                      </span>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-bg-border">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-muted uppercase tracking-wide font-semibold">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        p.attendance === 'present' ? 'bg-green-500/10 text-green-500' :
                        p.attendance === 'absent' ? 'bg-red-500/10 text-danger' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {p.attendance === 'not_marked' ? 'Pending' : p.attendance}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setActionModal({ type: 'ban', participant: p })}
                        className="p-1.5 rounded-lg text-text-muted hover:text-amber-500 hover:bg-amber-500/10 pressable"
                        title="Ban participant"
                      >
                        <NoSymbolIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActionModal({ type: 'remove', participant: p })}
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-red-500/10 pressable"
                        title="Remove participant"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )
        )}
      </div>

      {/* Action Confirmation Modal */}
      <ConfirmModal
        isOpen={actionModal !== null}
        title={actionModal?.type === 'ban' ? 'Ban Participant' : actionModal?.type === 'remove' ? 'Remove Participant' : 'Delete Team'}
        message={
          actionModal?.type === 'ban'
            ? `Ban ${actionModal?.participant?.name} from this event? They will no longer appear in the participant list.`
            : actionModal?.type === 'remove'
            ? `Remove ${actionModal?.participant?.name} and free up their spot? This cannot be undone.`
            : `Are you sure you want to delete team "${actionModal?.team?.name}"?`
        }
        confirmText={actionModal?.type === 'ban' ? 'Yes, Ban' : actionModal?.type === 'remove' ? 'Yes, Remove' : 'Yes, Delete'}
        isDestructive={true}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionModal(null)}
      />

      <Navbar />
    </div>
  )
}
