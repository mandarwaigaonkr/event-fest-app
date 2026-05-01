// src/pages/auth/AdminOnboarding.jsx
// Admin access request and status screen

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import christLogo from '../../assets/Christ complete logo.png'

export default function AdminOnboarding() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: profile?.name || user?.displayName || '',
    designation: profile?.designation || '',
    organization: profile?.organization || profile?.department || '',
    reason: profile?.adminRequestReason || '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="w-8 h-8 border-2 border-text-muted border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'admin' && profile?.onboarded) return <Navigate to="/admin" replace />

  const status = profile?.adminStatus
  const isLockedStatus = status === 'pending' || status === 'rejected'

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required'
    if (!form.designation.trim()) nextErrors.designation = 'Role or designation is required'
    if (!form.organization.trim()) nextErrors.organization = 'Organization or department is required'
    if (!form.reason.trim()) nextErrors.reason = 'Reason is required'
    return nextErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const adminsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')))
      const admins = adminsSnap.docs.map(adminDoc => ({ id: adminDoc.id, ...adminDoc.data() }))

      if (admins.length === 0) {
        setErrors({ submit: 'No existing admin accounts were found to review this request.' })
        return
      }

      const batch = writeBatch(db)
      batch.set(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name.trim(),
        email: user.email,
        photoURL: user.photoURL,
        role: 'pending_admin',
        adminStatus: 'pending',
        designation: form.designation.trim(),
        organization: form.organization.trim(),
        adminRequestReason: form.reason.trim(),
        onboarded: true,
        requestedAdminAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      admins.forEach((adminUser) => {
        const notificationRef = doc(collection(db, 'users', adminUser.uid || adminUser.id, 'notifications'))
        batch.set(notificationRef, {
          type: 'admin_access_requested',
          title: 'New admin access request',
          message: `${form.name.trim()} requested administrator access.`,
          actorUid: user.uid,
          actorName: form.name.trim(),
          recipientUid: adminUser.uid || adminUser.id,
          link: '/admin',
          read: false,
          createdAt: serverTimestamp(),
        })
      })

      await batch.commit()
    } catch (err) {
      console.error(err)
      setErrors({ submit: err.message || 'Failed to submit admin request. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSwitchAccount() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  const inputBase = 'w-full h-12 px-4 rounded-xl border bg-bg-elevated text-sm text-text-primary placeholder-text-muted outline-none transition-all duration-200'
  const inputNormal = `${inputBase} border-bg-border focus:border-accent`
  const inputError = `${inputBase} border-danger/60 focus:border-danger`

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm bg-bg-card border border-bg-border rounded-2xl px-8 py-9 shadow-glow animate-scale-in">
        <div className="mb-7">
          <img src={christLogo} alt="Christ University" className="h-12 object-contain mb-5" />
          <h1 className="text-2xl font-bold text-text-primary">
            {isLockedStatus ? 'Admin request status' : 'Request admin access'}
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            {isLockedStatus
              ? 'Your Google account is signed in, but dashboard access depends on admin approval.'
              : 'Create your admin profile. Existing admins will review your request.'}
          </p>
        </div>

        {isLockedStatus ? (
          <div className="space-y-5">
            <div className={`rounded-2xl border p-4 ${
              status === 'pending'
                ? 'bg-warning/10 border-warning/20'
                : 'bg-danger/10 border-danger/20'
            }`}>
              <p className={`text-sm font-bold ${status === 'pending' ? 'text-warning' : 'text-danger'}`}>
                {status === 'pending' ? 'Request pending' : 'Request rejected'}
              </p>
              <p className="text-xs text-text-secondary mt-1.5">
                {status === 'pending'
                  ? 'An existing admin still needs to approve your request.'
                  : 'An existing admin rejected this access request. You cannot access the admin dashboard with this account.'}
              </p>
            </div>

            <div className="text-xs text-text-muted space-y-1.5">
              <p><span className="font-semibold text-text-secondary">Email:</span> {profile?.email || user.email}</p>
              <p><span className="font-semibold text-text-secondary">Designation:</span> {profile?.designation || 'Not provided'}</p>
              <p><span className="font-semibold text-text-secondary">Organization:</span> {profile?.organization || 'Not provided'}</p>
            </div>

            <button
              type="button"
              onClick={handleSwitchAccount}
              className="w-full h-12 rounded-xl border border-bg-border bg-bg-elevated text-sm font-semibold text-text-primary hover:border-accent/30 pressable"
            >
              Use another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 tracking-wide uppercase">
                Name <span className="text-danger">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name && <p className="text-xs text-danger mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 tracking-wide uppercase">
                Google Email
              </label>
              <input value={user.email || ''} readOnly className={`${inputBase} border-bg-border bg-bg-base text-text-muted cursor-not-allowed`} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 tracking-wide uppercase">
                Role / Designation <span className="text-danger">*</span>
              </label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Faculty coordinator, department admin..."
                className={errors.designation ? inputError : inputNormal}
              />
              {errors.designation && <p className="text-xs text-danger mt-1.5">{errors.designation}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 tracking-wide uppercase">
                Organization / Department <span className="text-danger">*</span>
              </label>
              <input
                name="organization"
                value={form.organization}
                onChange={handleChange}
                placeholder="Computer Science, Student Council..."
                className={errors.organization ? inputError : inputNormal}
              />
              {errors.organization && <p className="text-xs text-danger mt-1.5">{errors.organization}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 tracking-wide uppercase">
                Reason for Access <span className="text-danger">*</span>
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                placeholder="Explain why you need administrator access."
                className={`${errors.reason ? inputError : inputNormal} h-28 py-3 resize-none`}
              />
              {errors.reason && <p className="text-xs text-danger mt-1.5">{errors.reason}</p>}
            </div>

            {errors.submit && (
              <p className="text-xs text-danger text-center bg-danger/10 rounded-lg px-3 py-2">
                {errors.submit}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light pressable disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm hover:shadow-glow flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending request...
                </>
              ) : (
                'Send Admin Request'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
