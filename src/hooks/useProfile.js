// useProfile - compatibility hook for profile data from AuthContext.

import { useAuth } from './useAuth'

export function useProfile() {
  const { profile, loading } = useAuth()
  return { profile, loading }
}
