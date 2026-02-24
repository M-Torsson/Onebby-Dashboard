// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

/**
 * Authentication Token Manager
 * Centralized utility for managing authentication tokens
 */

const TOKEN_KEY = 'onebby_auth_token'
const TOKEN_TYPE_KEY = 'onebby_token_type'
const IS_AUTH_KEY = 'onebby_is_authenticated'

/**
 * Store authentication token in localStorage
 * @param {string} token - JWT token (without Bearer prefix)
 * @param {string} tokenType - Token type (usually 'bearer')
 */
export const setAuthToken = (token, tokenType = 'bearer') => {
  if (typeof window === 'undefined') return

  try {
    // Remove any "Bearer " prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token

    // Store in multiple keys for compatibility
    localStorage.setItem(TOKEN_KEY, cleanToken)
    localStorage.setItem('token', cleanToken) // Primary key
    localStorage.setItem('accessToken', cleanToken) // Legacy support
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
    localStorage.setItem(IS_AUTH_KEY, 'true')
    localStorage.setItem('isAuthenticated', 'true') // Legacy support

    console.log('[AuthTokenManager] Token stored successfully')
    console.log('[AuthTokenManager] Token preview:', cleanToken.substring(0, 30) + '...')
  } catch (error) {
    console.error('[AuthTokenManager] Failed to store token:', error)
  }
}

/**
 * Get authentication token from localStorage
 * @returns {string|null} - Token or null if not found
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null

  try {
    // Try multiple keys for compatibility
    const token =
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('token')

    if (token) {
      // Remove "Bearer " prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token
      return cleanToken
    }

    return null
  } catch (error) {
    console.error('[AuthTokenManager] Failed to retrieve token:', error)
    return null
  }
}

/**
 * Remove authentication token from localStorage
 */
export const clearAuthToken = () => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem(TOKEN_TYPE_KEY)
    localStorage.removeItem(IS_AUTH_KEY)
    localStorage.removeItem('isAuthenticated') // Legacy support
    sessionStorage.removeItem('token')

    console.log('[AuthTokenManager] All tokens cleared')
  } catch (error) {
    console.error('[AuthTokenManager] Failed to clear tokens:', error)
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false

  const token = getAuthToken()
  const isAuth = localStorage.getItem(IS_AUTH_KEY) === 'true'

  return !!(token && isAuth)
}

/**
 * Get authorization header value
 * @returns {string|null} - "Bearer TOKEN" or null
 */
export const getAuthorizationHeader = () => {
  const token = getAuthToken()

  if (!token) {
    console.warn('[AuthTokenManager] Cannot create Authorization header - no token')
    return null
  }

  return `Bearer ${token}`
}

/**
 * Debug function to show all auth-related data
 */
export const debugAuthStatus = () => {
  if (typeof window === 'undefined') {
    console.log('[AuthTokenManager] Running on server - no localStorage')
    return
  }

  console.log('=== AUTH DEBUG INFO ===')
  console.log('onebby_auth_token:', localStorage.getItem(TOKEN_KEY)?.substring(0, 30) + '...')
  console.log('token:', localStorage.getItem('token')?.substring(0, 30) + '...')
  console.log('accessToken:', localStorage.getItem('accessToken')?.substring(0, 30) + '...')
  console.log('isAuthenticated:', isAuthenticated())
  console.log('======================')
}

export default {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  isAuthenticated,
  getAuthorizationHeader,
  debugAuthStatus
}
