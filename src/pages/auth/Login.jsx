// src/pages/auth/Login.jsx
// Authenticaton — OLED dark theme with Email/Password & Google

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const navigate = useNavigate()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function processUserDoc(firebaseUser) {
    const userRef = doc(db, 'users', firebaseUser.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || '',
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
  }

  async function handleEmailAuth(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password)
      } else {
        result = await signInWithEmailAndPassword(auth, email, password)
      }
      await processUserDoc(result.user)
    } catch (err) {
      console.error(err)
      // Make errors more user friendly
      if (err.code === 'auth/email-already-in-use') setError('Email already in use. Please sign in.')
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') setError('Invalid email or password.')
      else if (err.code === 'auth/weak-password') setError('Password should be at least 6 characters.')
      else if (err.code === 'auth/operation-not-allowed') setError('Email/Password login is not enabled in Firebase.')
      else setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await processUserDoc(result.user)
    } catch (err) {
      console.error(err)
      setError('Google Sign-in failed. Use Email/Password on Mobile.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full h-11 px-4 rounded-xl border border-bg-border bg-bg-elevated text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-all duration-200"

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 relative transition-colors duration-300">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full bg-bg-elevated border border-bg-border text-text-secondary hover:text-accent hover:border-accent/50 transition-all shadow-sm"
        aria-label="Toggle theme"
      >
        {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      </button>

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm bg-bg-card border border-bg-border rounded-2xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col items-center gap-6 shadow-glow">

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

        <div className="w-full border-t border-bg-border" />

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4">
          <p className="text-xs font-medium text-text-secondary tracking-wide uppercase text-center">
            {isSignUp ? 'Create an account' : 'Sign in to continue'}
          </p>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />

          {error && <p className="text-xs text-danger text-center bg-danger/10 py-2 rounded-lg px-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm hover:shadow-glow flex items-center justify-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="w-full flex items-center justify-between text-xs text-text-muted">
          <span>{isSignUp ? 'Already have an account?' : 'Need an account?'}</span>
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-accent font-semibold hover:underline"
          >
            {isSignUp ? 'Sign In instead' : 'Sign Up'}
          </button>
        </div>

        {/* Divider */}
        <div className="w-full relative flex items-center justify-center my-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-bg-border"></div></div>
          <div className="relative px-4 bg-bg-card text-xs text-text-muted uppercase font-medium">Or</div>
        </div>

        {/* Google Sign in (Web Only) */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-11 flex items-center justify-center gap-3 bg-bg-elevated border border-bg-border rounded-xl text-sm font-medium text-text-primary hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google (Web Only)
        </button>

      </div>
    </div>
  )
}
