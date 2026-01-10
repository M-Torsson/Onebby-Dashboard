/**
 * API Configuration
 * Centralized API configuration for the application
 */

const getApiConfig = () => {
  // In production, these should come from environment variables
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://onebby-api.onrender.com'
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''

  if (!apiKey && typeof window !== 'undefined') {
    console.warn('API_KEY is not configured. Please set NEXT_PUBLIC_API_KEY in your .env file')
  }

  return {
    baseUrl: apiBaseUrl,
    apiKey: apiKey,
    endpoints: {
      admin: `${apiBaseUrl}/api/admin`,
      v1: `${apiBaseUrl}/api/v1`,
      api: `${apiBaseUrl}/api`
    }
  }
}

export const apiConfig = getApiConfig()

export const API_BASE_URL = apiConfig.baseUrl
export const API_KEY = apiConfig.apiKey

export default apiConfig
