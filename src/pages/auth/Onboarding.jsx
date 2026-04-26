// src/pages/auth/Onboarding.jsx
// Profile completion — auto-detected regNumber (read-only), class, department

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { extractRegNumber } from '../../utils/formatters'
import christLogo from '../../assets/Christ complete logo.png'

const DEPARTMENT_OPTIONS = [
  'Computer Science',
  'AI & DS',
  'Mechanical',
  'Civil',
  'Electrical and Electronics',
  'Psychology',
  'BBA',
  'MBA',
]



export default function Onboarding() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  // Auto-detect reg number — prefer what's already in Firestore (set during ensureUserProfile),
  // fall back to extracting from displayName
  const regNumber = useMemo(() => {
    return profile?.regNumber || extractRegNumber(user?.displayName) || ''
  }, [profile, user])

  const [form, setForm] = useState({
    class: '',      // free text e.g. "2BTCS A", "4BTCS IOT"
    department: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!regNumber) e.regNumber = 'Could not detect registration number. Contact admin.'
    if (!form.class.trim()) e.class = 'Class is required (e.g. 2BTCS A)'
    if (!form.department) e.department = 'Please select your department'
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
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        regNumber,
        class: form.class.trim().toUpperCase(),
        department: form.department,
        onboarded: true,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to save profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Shared input classes
  const inputBase = 'w-full h-12 px-4 rounded-xl border bg-bg-elevated text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200'
  const inputNormal = `${inputBase} border-bg-border focus:border-accent`
  const inputError = `${inputBase} border-danger/60 focus:border-danger`
  const inputReadOnly = `${inputBase} border-bg-border bg-bg-base text-text-muted cursor-not-allowed`

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 py-10">

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm bg-bg-card border border-bg-border rounded-2xl px-8 py-10 shadow-glow animate-scale-in">

        {/* Header */}
        <div className="mb-8">
          <img src={christLogo} alt="Christ University" className="h-12 object-contain mb-5" />
          <h1 className="text-2xl font-bold text-text-primary">Complete your profile</h1>
          <p className="text-sm text-text-secondary mt-1.5">
            Hey {user?.displayName?.split(' ')[0]}! Just a few details to get you in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Registration Number — Auto-detected, Read-only */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 tracking-wide uppercase">
              Registration Number
            </label>
            <input
              id="regNumber"
              type="text"
              value={regNumber}
              readOnly
              className={inputReadOnly}
            />
            <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
              <svg className="w-3 h-3 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Auto-detected from your Christ email
            </p>
            {errors.regNumber && (
              <p className="text-xs text-danger mt-1">{errors.regNumber}</p>
            )}
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 tracking-wide uppercase">
              Class <span className="text-danger">*</span>
            </label>
            <input
              id="class"
              name="class"
              type="text"
              value={form.class}
              onChange={handleChange}
              placeholder="e.g. 2BTCS A, 3BTCS B, 4BTCS IOT"
              className={errors.class ? inputError : inputNormal}
            />
            {errors.class ? (
              <p className="text-xs text-danger mt-1.5">{errors.class}</p>
            ) : (
              <p className="text-xs text-text-muted mt-1.5">
                Enter year + branch + section (e.g. 2BTCS A)
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 tracking-wide uppercase">
              Department <span className="text-danger">*</span>
            </label>
            <select
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              className={`${errors.department ? inputError : inputNormal} appearance-none cursor-pointer`}
            >
              <option value="" disabled>Select department</option>
              {DEPARTMENT_OPTIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && (
              <p className="text-xs text-danger mt-1.5">{errors.department}</p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <p className="text-xs text-danger text-center bg-danger/10 rounded-lg px-3 py-2">
              {errors.submit}
            </p>
          )}

          {/* Submit */}
          <button
            id="onboarding-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light pressable disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm hover:shadow-glow mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Setup →'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
