// src/pages/auth/Login.jsx
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
    <div className="min-h-screen bg-bg-base relative overflow-hidden flex flex-col justify-between pt-16">
      
      {/* Neumorphic Diagonal Background */}
      <div className="absolute inset-0 bg-neu-diagonal opacity-80 pointer-events-none" />

      {/* Header Content (Dark top) */}
      <div className="relative z-10 px-8 flex flex-col mt-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">Foobar 10.0</span>
        </div>
        
        <h1 className="text-4xl font-extrabold text-white mb-3">Get Started now</h1>
        <p className="text-sm text-text-secondary">
          Create an account or log in to explore events and manage your dashboard
        </p>
      </div>

      {/* Bottom Sheet */}
      <div className="relative z-10 w-full bg-bg-elevated rounded-t-[40px] px-8 pt-10 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] mt-8 flex-1 flex flex-col">
        
        {/* Fake Tabs */}
        <div className="w-full h-12 bg-bg-card rounded-2xl flex p-1 mb-8 shadow-neu-in">
          <div className="flex-1 bg-bg-elevated rounded-xl shadow-sm flex items-center justify-center text-sm font-bold text-text-primary">
            Log In
          </div>
          <div className="flex-1 rounded-xl flex items-center justify-center text-sm font-semibold text-text-muted">
            Sign Up
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end gap-5">
          <div className="w-full relative flex items-center justify-center mb-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bg-border"></div>
            </div>
            <div className="relative px-4 bg-bg-elevated text-xs text-text-muted font-medium">Or</div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 flex items-center justify-center gap-3 bg-bg-card rounded-2xl text-sm font-bold text-text-primary shadow-neu-out hover:bg-bg-card/90 transition-all active:shadow-neu-in"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-text-muted border-t-accent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          {error && <p className="text-xs text-danger text-center mt-2">{error}</p>}
        </div>
        
        {/* iOS Home Indicator fake */}
        <div className="w-32 h-1.5 bg-bg-border rounded-full mx-auto mt-8 opacity-50" />
      </div>
    </div>
  )
}
