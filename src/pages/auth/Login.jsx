// src/pages/auth/Login.jsx
// Google Sign-In — OLED dark theme

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { Capacitor } from '@capacitor/core'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()

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
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 relative transition-colors duration-300">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full bg-bg-elevated border border-bg-border text-text-secondary hover:text-accent hover:border-accent/50 transition-all shadow-sm"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <SunIcon className="w-5 h-5" />
        ) : (
          <MoonIcon className="w-5 h-5" />
        )}
      </button>

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm bg-bg-card border border-bg-border rounded-2xl px-8 py-10 flex flex-col items-center gap-7 shadow-glow">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-glow">
            <span className="text-white text-xl font-bold tracking-tight">F</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Foobar 10.0</h1>
            <p className="text-sm text-text-secondary mt-0.5">Event Management Platform</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-bg-border" />

        {/* Sign in */}
        <div className="w-full flex flex-col items-center gap-4">
          <p className="text-xs font-medium text-text-secondary tracking-wide uppercase">
            Sign in to continue
          </p>

          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 bg-bg-elevated border border-bg-border rounded-xl text-sm font-medium text-text-primary hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-xs text-danger text-center">{error}</p>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-text-muted text-center">
          Use your college Google account to sign in
        </p>
      </div>

      <p className="mt-8 text-xs text-text-muted">
        Foobar 10.0 — Powered by Firebase
      </p>
    </div>
  )
}
