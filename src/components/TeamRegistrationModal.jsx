import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import toast from 'react-hot-toast'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { createTeamRegistration } from '../hooks/useEvents'

export default function TeamRegistrationModal({ isOpen, onClose, event, currentUser, profile, onSuccess }) {
  const [teamName, setTeamName] = useState('')
  const [teammates, setTeammates] = useState(['']) // Array of regNumbers
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = 'auto' }
    }
  }, [isOpen])

  if (!isOpen) return null

  const maxTeammates = event.maxTeamSize - 1 // Leader is already 1

  function handleTeammateChange(index, value) {
    const newTeammates = [...teammates]
    newTeammates[index] = value
    setTeammates(newTeammates)
    setError('')
  }

  function addTeammateField() {
    if (teammates.length < maxTeammates) {
      setTeammates([...teammates, ''])
    }
  }

  function removeTeammateField(index) {
    const newTeammates = teammates.filter((_, i) => i !== index)
    setTeammates(newTeammates)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!teamName.trim()) {
      setError('Team name is required')
      return
    }

    const filteredTeammates = teammates.map(t => t.trim()).filter(t => t !== '')
    const totalMembers = 1 + filteredTeammates.length // Leader + members

    if (totalMembers < event.minTeamSize) {
      setError(`Minimum team size is ${event.minTeamSize}. Please add more teammates.`)
      return
    }

    // Check for duplicate reg numbers
    if (new Set(filteredTeammates).size !== filteredTeammates.length) {
      setError('Duplicate registration numbers found.')
      return
    }

    // Check if leader's regNumber is in the list
    if (filteredTeammates.includes(profile.regNumber)) {
      setError('You cannot invite yourself.')
      return
    }

    setLoading(true)
    try {
      // 1. Look up users by regNumber
      const membersData = [
        { uid: currentUser.uid, regNumber: profile.regNumber, name: profile.name, status: 'leader' }
      ]

      for (const regNum of filteredTeammates) {
        const q = query(collection(db, 'users'), where('regNumber', '==', regNum))
        const snap = await getDocs(q)
        if (snap.empty) {
          throw new Error(`Registration number ${regNum} is not registered on the platform.`)
        }
        const userData = snap.docs[0].data()
        membersData.push({
          uid: userData.uid,
          regNumber: userData.regNumber,
          name: userData.name,
          status: 'pending'
        })
      }

      // 2. We skip manual checks of existing teams here and let the transaction handle the leader's registration.
      // But we can warn if we see obvious issues. (Optional)
      
      const success = await createTeamRegistration(event.id, teamName, membersData, profile)
      if (success) {
        onSuccess()
        onClose()
      } else {
        setError('Failed to create team. You may already be registered.')
      }

    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create team.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-card border border-bg-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-4 border-b border-bg-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Create a Team</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-elevated pressable">
            <XMarkIcon className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Team Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. The Innovators"
              className="w-full h-12 px-4 rounded-xl bg-bg-elevated border border-bg-border text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Teammate Registration Numbers
            </label>
            <div className="space-y-3">
              {teammates.map((teammate, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={teammate}
                    onChange={(e) => handleTeammateChange(index, e.target.value)}
                    placeholder="e.g. 2460476"
                    className="flex-1 h-12 px-4 rounded-xl bg-bg-elevated border border-bg-border text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-all duration-200"
                  />
                  {teammates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeammateField(index)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-bg-elevated border border-bg-border text-text-secondary hover:text-danger hover:border-danger/30 pressable"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {teammates.length < maxTeammates && (
              <button
                type="button"
                onClick={addTeammateField}
                className="mt-3 flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-light pressable"
              >
                <PlusIcon className="w-4 h-4" /> Add another teammate
              </button>
            )}
            <p className="mt-2 text-[10px] text-text-muted">
              Min Team Size: {event.minTeamSize} | Max Team Size: {event.maxTeamSize}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light shadow-glow-sm hover:shadow-glow pressable disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              'Create & Send Invites'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
