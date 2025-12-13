'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children, locale }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    const accessToken = localStorage.getItem('accessToken')

    if (authStatus === 'true' && accessToken) {
      setIsAuthenticated(true)
    } else {
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
