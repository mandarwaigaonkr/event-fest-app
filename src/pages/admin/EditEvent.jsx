// src/pages/admin/EditEvent.jsx
// Admin form to update an existing event — pre-filled with current data

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import Navbar from '../../components/Navbar'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function EditEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    maxParticipants: '',
    instructions: '',
    isTeamEvent: false,
    minTeamSize: '',
    maxTeamSize: '',
  })
  const [errors, setErrors] = useState({})

  // Load event data
  useEffect(() => {
    if (!eventId) return

    const unsub = onSnapshot(doc(db, 'events', eventId), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setEvent({ id: snap.id, ...data })

        // Pre-fill form — convert Firestore Timestamp to date/time inputs
        let dateStr = ''
        let timeStr = ''
        if (data.dateTime) {
          const dt = data.dateTime.toDate ? data.dateTime.toDate() : new Date(data.dateTime)
          dateStr = dt.toISOString().split('T')[0]
          timeStr = dt.toTimeString().slice(0, 5)
        }

        setForm({
          name: data.name || '',
          description: data.description || '',
          date: dateStr,
          time: timeStr,
          venue: data.venue || '',
          maxParticipants: String(data.isTeamEvent ? (data.maxTeams || '') : (data.maxParticipants || '')),
          instructions: data.instructions || '',
          isTeamEvent: data.isTeamEvent || false,
          minTeamSize: data.isTeamEvent ? String(data.minTeamSize || '') : '',
          maxTeamSize: data.isTeamEvent ? String(data.maxTeamSize || '') : '',
        })
      } else {
        setEvent(null)
      }
      setLoading(false)
    })

    return unsub
  }, [eventId])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Event name is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.time) e.time = 'Time is required'
    if (!form.venue.trim()) e.venue = 'Venue is required'
    if (!form.maxParticipants || parseInt(form.maxParticipants) < 1)
      e.maxParticipants = 'Enter a valid number (min 1)'
    // Don't allow setting max below current registrations
    const currentCount = form.isTeamEvent ? (event?.registeredTeamsCount || 0) : (event?.registeredCount || 0)
    if (event && parseInt(form.maxParticipants) < currentCount)
      e.maxParticipants = `Cannot be less than current registrations (${currentCount})`
      
    if (form.isTeamEvent) {
      if (!form.minTeamSize || parseInt(form.minTeamSize) < 2)
        e.minTeamSize = 'Minimum size must be at least 2'
      if (!form.maxTeamSize || parseInt(form.maxTeamSize) < parseInt(form.minTeamSize))
        e.maxTeamSize = 'Max size must be >= Min size'
    }
    return e
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const dateTime = Timestamp.fromDate(
        new Date(`${form.date}T${form.time}`)
      )

      await updateDoc(doc(db, 'events', eventId), {
        name: form.name.trim(),
        description: form.description.trim(),
        dateTime,
        venue: form.venue.trim(),
        maxTeams: form.isTeamEvent ? parseInt(form.maxParticipants) : null,
        maxParticipants: form.isTeamEvent ? null : parseInt(form.maxParticipants),
        instructions: form.instructions.trim(),
        isTeamEvent: form.isTeamEvent,
        minTeamSize: form.isTeamEvent ? parseInt(form.minTeamSize) : 1,
        maxTeamSize: form.isTeamEvent ? parseInt(form.maxTeamSize) : 1,
        updatedAt: serverTimestamp(),
      })

      toast.success('Event updated successfully!')
      navigate('/admin')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteDoc(doc(db, 'events', eventId))
      toast.success('Event deleted')
      navigate('/admin')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete event')
    }
  }

  if (loading) return <LoadingSpinner />

  if (!event) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-text-primary font-semibold mb-2">Event not found</p>
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-accent hover:underline"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    )
  }

  const inputBase = 'w-full h-12 px-4 rounded-xl bg-bg-elevated border text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200'
  const inputNormal = `${inputBase} border-bg-border focus:border-accent`
  const inputError = `${inputBase} border-danger/60 focus:border-danger`

  return (
    <div className="min-h-screen bg-bg-base pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-bg-elevated pressable"
            >
              <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-lg font-bold text-text-primary">Edit Event</h1>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl text-danger hover:bg-red-500/10 pressable"
            title="Delete event"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        {/* Registration info banner */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <span className="text-accent text-sm font-bold">{event.isTeamEvent ? (event.registeredTeamsCount || 0) : (event.registeredCount || 0)}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">
              {event.isTeamEvent ? (event.registeredTeamsCount || 0) : (event.registeredCount || 0)} / {event.isTeamEvent ? event.maxTeams : event.maxParticipants} {event.isTeamEvent ? 'teams' : 'registered'}
            </p>
            <p className="text-[10px] text-text-muted">
              Changes will reflect for all registered participants
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fade-up">
          {/* Event Name */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Event Name <span className="text-danger">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. CodeFest 2026"
              className={errors.name ? inputError : inputNormal}
            />
            {errors.name && <p className="text-xs text-danger mt-1.5">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the event..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-bg-border text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-all resize-none"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                Date <span className="text-danger">*</span>
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className={errors.date ? inputError : inputNormal}
              />
              {errors.date && <p className="text-xs text-danger mt-1.5">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                Time <span className="text-danger">*</span>
              </label>
              <input
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                className={errors.time ? inputError : inputNormal}
              />
              {errors.time && <p className="text-xs text-danger mt-1.5">{errors.time}</p>}
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Venue <span className="text-danger">*</span>
            </label>
            <input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="e.g. Main Auditorium"
              className={errors.venue ? inputError : inputNormal}
            />
            {errors.venue && <p className="text-xs text-danger mt-1.5">{errors.venue}</p>}
          </div>

          {/* Team Event Toggle */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-elevated border border-bg-border">
            <input
              id="isTeamEvent"
              name="isTeamEvent"
              type="checkbox"
              checked={form.isTeamEvent}
              onChange={handleChange}
              className="w-5 h-5 rounded text-accent focus:ring-accent border-bg-border bg-bg-card accent-accent cursor-pointer"
            />
            <label htmlFor="isTeamEvent" className="text-sm font-semibold text-text-primary cursor-pointer select-none">
              This is a Team Event
            </label>
          </div>

          {/* Team Size Limits */}
          {form.isTeamEvent && (
            <div className="grid grid-cols-2 gap-3 animate-fade-up">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                  Min Team Size <span className="text-danger">*</span>
                </label>
                <input
                  name="minTeamSize"
                  type="number"
                  min="2"
                  value={form.minTeamSize}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  className={errors.minTeamSize ? inputError : inputNormal}
                />
                {errors.minTeamSize && <p className="text-xs text-danger mt-1.5">{errors.minTeamSize}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                  Max Team Size <span className="text-danger">*</span>
                </label>
                <input
                  name="maxTeamSize"
                  type="number"
                  min="2"
                  value={form.maxTeamSize}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                  className={errors.maxTeamSize ? inputError : inputNormal}
                />
                {errors.maxTeamSize && <p className="text-xs text-danger mt-1.5">{errors.maxTeamSize}</p>}
              </div>
            </div>
          )}

          {/* Max Participants / Max Teams */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              {form.isTeamEvent ? 'Max Number of Teams' : 'Max Participants'} <span className="text-danger">*</span>
            </label>
            <input
              name="maxParticipants"
              type="number"
              min="1"
              value={form.maxParticipants}
              onChange={handleChange}
              placeholder={form.isTeamEvent ? "e.g. 50" : "e.g. 100"}
              className={errors.maxParticipants ? inputError : inputNormal}
            />
            {errors.maxParticipants && <p className="text-xs text-danger mt-1.5">{errors.maxParticipants}</p>}
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Instructions <span className="text-text-muted text-[10px]">(shown after registration)</span>
            </label>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              placeholder="Any special instructions for participants..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-bg-border text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light shadow-glow-sm hover:shadow-glow pressable disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Event"
        message={`Are you sure you want to delete "${event.name}"? This action cannot be undone and will remove all ${event.registeredCount || 0} registrations.`}
        confirmText="Yes, Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <Navbar />
    </div>
  )
}
