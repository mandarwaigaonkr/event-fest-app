// src/pages/admin/CreateEvent.jsx
// Admin form to create a new event

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    maxParticipants: '',
    instructions: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Event name is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.time) e.time = 'Time is required'
    if (!form.venue.trim()) e.venue = 'Venue is required'
    if (!form.maxParticipants || parseInt(form.maxParticipants) < 1)
      e.maxParticipants = 'Enter a valid number (min 1)'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const dateTime = Timestamp.fromDate(
        new Date(`${form.date}T${form.time}`)
      )

      await addDoc(collection(db, 'events'), {
        name: form.name.trim(),
        description: form.description.trim(),
        dateTime,
        venue: form.venue.trim(),
        maxParticipants: parseInt(form.maxParticipants),
        registeredCount: 0,
        posterURL: '', // Storage not enabled yet
        status: 'active',
        createdBy: user.uid,
        instructions: form.instructions.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast.success('Event created successfully! 🎉')
      navigate('/admin')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'w-full h-12 px-4 rounded-xl bg-bg-elevated border text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200'
  const inputNormal = `${inputBase} border-bg-border focus:border-accent`
  const inputError = `${inputBase} border-danger/60 focus:border-danger`

  return (
    <div className="min-h-screen bg-bg-base pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-bg-elevated transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">Create Event</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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

          {/* Max Participants */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Max Participants <span className="text-danger">*</span>
            </label>
            <input
              name="maxParticipants"
              type="number"
              min="1"
              value={form.maxParticipants}
              onChange={handleChange}
              placeholder="e.g. 100"
              className={errors.maxParticipants ? inputError : inputNormal}
            />
            {errors.maxParticipants && <p className="text-xs text-danger mt-1.5">{errors.maxParticipants}</p>}
          </div>

          {/* Poster Upload (placeholder) */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Event Poster
            </label>
            <div className="w-full h-32 rounded-xl border-2 border-dashed border-bg-border bg-bg-elevated flex flex-col items-center justify-center gap-2 text-text-muted cursor-not-allowed">
              <PhotoIcon className="w-8 h-8" />
              <p className="text-xs">Poster upload coming soon</p>
              <p className="text-[10px] text-text-muted">Firebase Storage not enabled</p>
            </div>
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
            disabled={loading}
            className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light shadow-glow-sm hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  )
}
