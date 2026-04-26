// src/pages/auth/Login.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import christLogo from '../../assets/Christ complete logo.png'

function authErrorMessage(code) {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.'
    case 'auth/popup-blocked':
      return 'Popup was blocked. Redirecting to Google sign-in...'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Auth.'
    default:
      return 'Sign-in failed. Please try again.'
  }
}



async function ensureUserProfile(firebaseUser, navigate) {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      role: 'user',
      onboarded: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    navigate('/onboarding', { replace: true })
    return
  }

  const data = userSnap.data()
  if (!data.onboarded) navigate('/onboarding', { replace: true })
  else if (data.role === 'admin') navigate('/admin', { replace: true })
  else navigate('/dashboard', { replace: true })
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user, profile, loading: authLoading, isAdmin, isOnboarded } = useAuth()

  useEffect(() => {
    if (authLoading || !user || !profile) return
    if (!isOnboarded) navigate('/onboarding', { replace: true })
    else if (isAdmin) navigate('/admin', { replace: true })
    else navigate('/dashboard', { replace: true })
  }, [authLoading, user, profile, isAdmin, isOnboarded, navigate])

  useEffect(() => {
    let mounted = true

    async function finishRedirectSignIn() {
      try {
        const result = await getRedirectResult(auth)
        if (!result || !mounted) return
        await ensureUserProfile(result.user, navigate)
      } catch (err) {
        console.error(err)
        if (mounted) setError(authErrorMessage(err.code))
      }
    }

    finishRedirectSignIn()
    return () => {
      mounted = false
    }
  }, [navigate])

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await ensureUserProfile(result.user, navigate)
    } catch (err) {
      console.error(err)
      setError(authErrorMessage(err.code))
      // Only fallback to redirect if popup was literally blocked by the browser
      if (err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider)
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (user && profile)) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="w-8 h-8 border-2 border-text-muted border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 py-safe">
      <div className="w-full max-w-sm flex flex-col items-center animate-fade-up">
        
        {/* Logo mark */}
        <img src={christLogo} alt="Christ Logo" className="w-[400px] h-[104px] object-contain mb-8" />

        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Christ Event Manager
        </h1>
        <p className="text-sm text-text-secondary mt-1.5 text-center">
          Your campus event companion
        </p>

        {/* Google button */}
        <button
          id="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-10 h-12 bg-bg-card border border-bg-border rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-text-primary hover:bg-bg-elevated active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-text-muted border-t-accent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
        
        <p className="text-[13px] font-medium text-text-primary mt-4 text-center">
          Note: Use Christ email ID.
        </p>

        {error && (
          <p className="text-xs text-danger text-center mt-3">{error}</p>
        )}

        <p className="text-[11px] text-text-muted mt-8 text-center">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}
