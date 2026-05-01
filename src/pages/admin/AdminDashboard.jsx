// src/pages/admin/AdminDashboard.jsx
// Admin home — quick stats, event list with management actions

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../../hooks/useEvents'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { formatDateTime } from '../../utils/formatters'
import toast from 'react-hot-toast'
import NotificationBell from '../../components/NotificationBell'
import { useAuth } from '../../hooks/useAuth'
import {
  PlusIcon,
  UsersIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  EyeIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

import christLogo from '../../assets/Christ complete logo.png'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { events, loading } = useEvents()
  const [adminRequests, setAdminRequests] = useState([])
  const [reviewingId, setReviewingId] = useState(null)

  const activeEvents = events.filter(e => e.status === 'active')
  const totalParticipants = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0)

  useEffect(() => {
    const requestsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'pending_admin'),
      where('adminStatus', '==', 'pending')
    )

    const unsub = onSnapshot(requestsQuery, (snap) => {
      setAdminRequests(snap.docs.map(requestDoc => ({
        id: requestDoc.id,
        ...requestDoc.data(),
      })))
    }, (err) => {
      console.error('Admin requests listener error:', err)
    })

    return unsub
  }, [])

  async function toggleEventStatus(event) {
    const newStatus = event.status === 'active' ? 'cancelled' : 'active'
    try {
      await updateDoc(doc(db, 'events', event.id), { status: newStatus })
      toast.success(`Event ${newStatus === 'active' ? 'activated' : 'cancelled'}`)
    } catch {
      toast.error('Failed to update event status')
    }
  }

  async function reviewAdminRequest(request, approved) {
    if (!user) return

    setReviewingId(request.id)
    try {
      await updateDoc(doc(db, 'users', request.id), {
        role: approved ? 'admin' : 'pending_admin',
        adminStatus: approved ? 'approved' : 'rejected',
        approvedBy: approved ? user.uid : null,
        rejectedBy: approved ? null : user.uid,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await addDoc(collection(db, 'users', request.id, 'notifications'), {
        type: approved ? 'admin_access_approved' : 'admin_access_rejected',
        title: approved ? 'Admin access approved' : 'Admin access rejected',
        message: approved
          ? 'Your admin access request was approved. You can now open the admin dashboard.'
          : 'Your admin access request was rejected.',
        actorUid: user.uid,
        actorName: user.displayName || 'Admin',
        recipientUid: request.id,
        link: approved ? '/admin' : '/admin-onboarding',
        read: false,
        createdAt: serverTimestamp(),
      })

      toast.success(approved ? 'Admin request approved' : 'Admin request rejected')
    } catch (err) {
      console.error(err)
      toast.error('Failed to review admin request')
    } finally {
      setReviewingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 text-xs font-medium text-accent mb-3 pressable hover:text-accent-light"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to App
          </button>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-lg font-bold text-text-primary leading-tight">Admin Panel</h1>
              <p className="text-xs text-text-muted mt-0.5">Create & manage events</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <img src={christLogo} alt="Christ Logo" className="h-9 object-contain" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 stagger-list">
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 text-center">
            <CalendarDaysIcon className="w-5 h-5 mx-auto text-accent mb-1.5" />
            <p className="text-lg font-bold text-text-primary">{events.length}</p>
            <p className="text-[10px] text-text-muted uppercase font-medium">Total Events</p>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 text-center">
            <ChartBarIcon className="w-5 h-5 mx-auto text-green-500 mb-1.5" />
            <p className="text-lg font-bold text-text-primary">{activeEvents.length}</p>
            <p className="text-[10px] text-text-muted uppercase font-medium">Active</p>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-3 text-center">
            <UsersIcon className="w-5 h-5 mx-auto text-purple-400 mb-1.5" />
            <p className="text-lg font-bold text-text-primary">{totalParticipants}</p>
            <p className="text-[10px] text-text-muted uppercase font-medium">Registered</p>
          </div>
        </div>

        {/* Create Event CTA */}
        <button
          onClick={() => navigate('/admin/create-event')}
          className="w-full h-12 flex items-center justify-center gap-2 bg-accent text-white rounded-xl text-sm font-semibold shadow-glow-sm hover:shadow-glow hover:bg-accent-light pressable"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Event
        </button>

        {adminRequests.length > 0 && (
          <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden animate-fade-up">
            <div className="px-4 py-3 border-b border-bg-border">
              <h2 className="text-sm font-bold text-text-primary">Admin Access Requests</h2>
              <p className="text-xs text-text-muted mt-0.5">Review pending administrator requests.</p>
            </div>
            <div className="divide-y divide-bg-border">
              {adminRequests.map(request => (
                <div key={request.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary truncate">{request.name}</h3>
                      <p className="text-xs text-text-muted truncate">{request.email}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {request.designation} · {request.organization}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-warning/10 text-warning shrink-0">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-3 line-clamp-2">
                    {request.adminRequestReason}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => reviewAdminRequest(request, false)}
                      disabled={reviewingId === request.id}
                      className="h-10 rounded-xl border border-danger/20 bg-danger/10 text-danger text-xs font-semibold pressable disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => reviewAdminRequest(request, true)}
                      disabled={reviewingId === request.id}
                      className="h-10 rounded-xl bg-success text-white text-xs font-semibold pressable disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events List */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Manage Events
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-bg-card border border-bg-border rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-bg-elevated rounded w-3/4 mb-2" />
                  <div className="h-3 bg-bg-elevated rounded w-1/2 mb-3" />
                  <div className="h-8 bg-bg-elevated rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted text-sm">No events created yet.</p>
              <p className="text-text-muted text-xs mt-1">Create your first event above!</p>
            </div>
          ) : (
            <div className="space-y-3 stagger-list">
              {events.map(event => (
                <div key={event.id} className="bg-bg-card border border-bg-border rounded-xl overflow-hidden interactive-card">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-text-primary flex-1 mr-2 truncate">
                        {event.name}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        event.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : event.status === 'cancelled'
                            ? 'bg-red-500/10 text-danger'
                            : 'bg-text-muted/10 text-text-muted'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-1">
                      {formatDateTime(event.dateTime)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {event.isTeamEvent ? (event.registeredTeamsCount || 0) : (event.registeredCount || 0)} / {event.isTeamEvent ? event.maxTeams : event.maxParticipants} {event.isTeamEvent ? 'teams' : 'registered'}
                    </p>
                  </div>

                  {/* Action bar */}
                  <div className="flex border-t border-bg-border divide-x divide-bg-border">
                    <button
                      onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-secondary hover:text-accent hover:bg-accent/5 pressable"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => navigate(`/admin/events/${event.id}/participants`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-secondary hover:text-accent hover:bg-accent/5 pressable"
                    >
                      <EyeIcon className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => toggleEventStatus(event)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium pressable ${
                        event.status === 'active'
                          ? 'text-danger hover:bg-red-500/5'
                          : 'text-green-500 hover:bg-green-500/5'
                      }`}
                    >
                      {event.status === 'active' ? (
                        <><XCircleIcon className="w-3.5 h-3.5" /> Cancel</>
                      ) : (
                        <><CheckBadgeIcon className="w-3.5 h-3.5" /> Activate</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
