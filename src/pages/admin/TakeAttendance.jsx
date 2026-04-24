// src/pages/admin/TakeAttendance.jsx
// Bulk attendance marking for an event

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import Navbar from '../../components/Navbar'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function TakeAttendance() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [absentIds, setAbsentIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!eventId) return
      
      const eventSnap = await getDoc(doc(db, 'events', eventId))
      if (eventSnap.exists()) {
        setEvent({ id: eventSnap.id, ...eventSnap.data() })
      } else {
        setLoading(false)
        return
      }

      const regsSnap = await getDocs(collection(db, 'events', eventId, 'registrations'))
      const list = regsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => !p.banned)

      // Pre-populate absentIds with those who were previously marked absent
      const initialAbsent = new Set(list.filter(p => p.attendance === 'absent').map(p => p.id))
      
      // Sort alphabetically by name
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      
      setParticipants(list)
      setAbsentIds(initialAbsent)
      setLoading(false)
    }
    loadData()
  }, [eventId])

  const toggleAbsent = (id) => {
    setAbsentIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setShowConfirm(false)
    try {
      const batch = writeBatch(db)
      
      participants.forEach(p => {
        const ref = doc(db, 'events', eventId, 'registrations', p.id)
        const isAbsent = absentIds.has(p.id)
        batch.update(ref, {
          attendance: isAbsent ? 'absent' : 'present',
          attendanceMarkedAt: serverTimestamp()
        })
      })

      await batch.commit()
      toast.success('Attendance submitted successfully!')
      navigate(`/admin/events/${eventId}/participants`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit attendance')
    }
    setSubmitting(false)
  }

  const filtered = participants.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.regNumber?.toLowerCase().includes(q)
    )
  })

  if (loading) return <LoadingSpinner />

  if (!event) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center text-text-primary">
        Event not found
      </div>
    )
  }

  const presentCount = participants.length - absentIds.size

  return (
    <div className="min-h-screen bg-bg-base pb-32 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border/50">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-bg-elevated transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-text-primary truncate">Take Attendance</h1>
              <p className="text-xs text-text-muted truncate">{event.name}</p>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Search by name or reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 px-4 rounded-xl bg-bg-elevated border border-bg-border text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-text-primary font-medium">
            <span className="text-accent font-bold">Instructions:</span> By default, all students are considered <span className="text-green-500 font-bold">Present</span>. Tap on a student to mark them as <span className="text-danger font-bold">Absent</span>.
          </p>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No matching students</p>
          ) : (
            filtered.map(p => {
              const isAbsent = absentIds.has(p.id)
              return (
                <div 
                  key={p.id} 
                  onClick={() => toggleAbsent(p.id)} 
                  className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                    isAbsent 
                      ? 'bg-red-500/10 border-danger/30 hover:bg-red-500/20' 
                      : 'bg-bg-card border-bg-border hover:border-accent/30'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{p.regNumber || 'No Reg No.'}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    isAbsent 
                      ? 'bg-danger text-white' 
                      : 'bg-green-500/10 text-green-500'
                  }`}>
                    {isAbsent ? 'Absent' : 'Present'}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-bg-base/80 backdrop-blur-xl border-t border-bg-border/50 z-40">
        <div className="max-w-lg mx-auto flex justify-between items-center gap-4">
          <div className="flex-1">
             <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-0.5">Summary</p>
             <p className="text-sm font-bold text-text-primary">
               <span className="text-green-500">{presentCount}</span> Present • <span className="text-danger">{absentIds.size}</span> Absent
             </p>
          </div>
          <button 
            onClick={() => setShowConfirm(true)} 
            disabled={submitting} 
            className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl text-sm font-bold shadow-glow-sm hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Review & Submit'
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Submit Attendance"
        message={absentIds.size === 0 ? "You are about to submit attendance with NO absentees. Everyone will be marked present." : `Are you sure you want to mark these ${absentIds.size} students as Absent?`}
        confirmText="Yes, Submit"
        isDestructive={absentIds.size > 0}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
      >
        {absentIds.size > 0 && (
          <div className="bg-bg-elevated border border-bg-border rounded-xl overflow-hidden mt-1 max-h-48 overflow-y-auto">
            {participants.filter(p => absentIds.has(p.id)).map((p, i) => (
              <div key={p.id} className={`px-3 py-2 text-xs flex justify-between items-center ${i !== 0 ? 'border-t border-bg-border' : ''}`}>
                <span className="font-semibold text-text-primary truncate mr-2">{p.name}</span>
                <span className="text-danger font-bold shrink-0">Absent</span>
              </div>
            ))}
          </div>
        )}
      </ConfirmModal>

      <Navbar />
    </div>
  )
}
