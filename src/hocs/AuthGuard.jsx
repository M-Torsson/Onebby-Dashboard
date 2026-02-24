// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated as checkAuth, getAuthToken } from '@/utils/authTokenManager'

export default function AuthGuard({ children, locale }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated using centralized auth manager
    const authenticated = checkAuth()
    const token = getAuthToken()

    console.log('[AuthGuard] Checking authentication...')
    console.log('[AuthGuard] isAuthenticated:', authenticated)
    console.log('[AuthGuard] Token present:', !!token)

    if (authenticated && token) {
      console.log('[AuthGuard] User is authenticated')
      setIsAuthenticated(true)
    } else {
      console.log('[AuthGuard] User not authenticated, redirecting to login')
      // Redirect to login if not authenticated
      router.push(`/${locale}/login`)
    }
    setIsLoading(false)
  }, [locale, router])

  if (isLoading) {
    return null // or a loading spinner
  }

  return <>{isAuthenticated ? children : null}</>
}
