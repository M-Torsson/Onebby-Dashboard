// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { setAuthToken, getAuthToken, clearAuthToken, isAuthenticated as checkAuth } from '@/utils/authTokenManager'

/**
 * Custom hook to manage authentication token
 * Syncs NextAuth session token with localStorage for API calls
 */
export const useAuthToken = () => {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session?.user?.accessToken) {
      // Store token using centralized manager
      setAuthToken(session.user.accessToken, session.user.tokenType)
    } else if (status === 'unauthenticated') {
      // Only clear token if explicitly unauthenticated AND no token in localStorage
      // This prevents clearing tokens from direct login (non-NextAuth)
      const existingToken = getAuthToken()
      if (!existingToken) {
        console.log('[useAuthToken] NextAuth unauthenticated and no localStorage token, clearing')
        clearAuthToken()
      } else {
        console.log('[useAuthToken] NextAuth unauthenticated but localStorage token exists, keeping it')
      }
    }
  }, [session, status])

  // Check if token exists in localStorage (for immediate availability)
  const hasToken = checkAuth()
  const token = getAuthToken()

  return {
    token: token || session?.user?.accessToken || null,
    isAuthenticated: status === 'authenticated' || hasToken,
    isLoading: status === 'loading',
    session
  }
}

export default useAuthToken
