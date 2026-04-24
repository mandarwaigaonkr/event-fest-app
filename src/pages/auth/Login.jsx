// src/pages/auth/Login.jsx
// Clean login — Google Sign-In only

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { Capacitor } from '@capacitor/core'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  useState(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '101858911871-nngicql2os8261mgf6vpk8jtiefg5l3e.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      })
    }
  }, [])

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      let firebaseUser;
      if (Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn()
        const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken)
        const result = await signInWithCredential(auth, credential)
        firebaseUser = result.user
      } else {
        const result = await signInWithPopup(auth, googleProvider)
        firebaseUser = result.user
      }

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
      } else {
        const data = userSnap.data()
        if (!data.onboarded) navigate('/onboarding', { replace: true })
        else if (data.role === 'admin') navigate('/admin', { replace: true })
        else navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      console.error(err)
      setError('Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* Ambient gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/[0.07] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-15%] w-[600px] h-[600px] rounded-full bg-accent-light/[0.05] blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center animate-fade-up">
        
        {/* Logo */}
        <div className="w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-8">
          <span className="text-accent text-2xl font-black">F</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text-primary tracking-tight text-center">
          Welcome back
        </h1>
        <p className="text-sm text-text-muted mt-2 text-center max-w-[260px]">
          Sign in to discover, register, and manage all your events in one place.
        </p>

        {/* Google Sign In Button */}
        <button
          id="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-10 h-14 glass rounded-2xl flex items-center justify-center gap-3 text-[15px] font-semibold text-text-primary hover:border-accent/30 hover:bg-accent/[0.03] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-glass"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-text-muted border-t-accent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {error && (
          <p className="text-xs text-danger text-center mt-4 animate-fade-up">{error}</p>
        )}

        {/* Footer */}
        <p className="text-[11px] text-text-muted mt-8 text-center leading-relaxed">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}
