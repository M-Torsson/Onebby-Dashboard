/**
 * API Configuration
 * Centralized API configuration for the application
 */

const getApiConfig = () => {
  // In production, these should come from environment variables
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://onebby-api.onrender.com'
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🔑 API Configuration Debug:')
    console.log('API_KEY length:', apiKey.length)
    console.log('API_KEY first 10 chars:', apiKey.substring(0, 10))
    console.log('API_KEY last 10 chars:', apiKey.substring(apiKey.length - 10))
    console.log('API_KEY is empty:', !apiKey)
  }

  if (!apiKey && typeof window !== 'undefined') {
    console.error('⚠️ API_KEY is not configured!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Please follow these steps to fix the issue:')
    console.error('1. Open .env.local file in the root directory')
    console.error('2. Add your API key: NEXT_PUBLIC_API_KEY=your-key-here')
    console.error('3. Save the file and restart the development server')
    console.error("4. Contact your administrator if you don't have an API key")
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
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
