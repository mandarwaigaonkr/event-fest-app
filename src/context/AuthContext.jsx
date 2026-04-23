// AuthContext — Provides auth state to entire app
// Phase 2: Wraps app, listens to Firebase onAuthStateChanged

import { createContext } from 'react'

export const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  // Phase 2: Firebase auth listener, user profile loading, role check
  return (
    <AuthContext.Provider value={null}>
      {children}
    </AuthContext.Provider>
  )
}
