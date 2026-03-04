// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

/**
 * Payments API Service
 * Handles all API calls related to payments
 */

import { apiConfig } from '@/configs/apiConfig'
import { getAuthToken } from '@/utils/authTokenManager'

/**
 * Get auth headers for API requests
 */
const getAuthHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': apiConfig.apiKey
  }

  const authToken = token || getAuthToken()

  if (authToken) {
    const cleanToken = authToken.startsWith('Bearer ') ? authToken.substring(7) : authToken
    headers['Authorization'] = `Bearer ${cleanToken}`
  } else {
    console.error('[paymentsApi] ❌ NO AUTHENTICATION TOKEN FOUND!')
  }

  return headers
}

/**
 * Get all payments for an order
 * @param {number} orderId - Order ID
 * @param {boolean} isAdmin - Whether to use admin endpoint
 */
export const getPaymentsByOrderId = async (orderId, isAdmin = true) => {
  try {
    console.log('[paymentsApi] Fetching payments for order:', orderId, 'isAdmin:', isAdmin)

    // Use admin endpoint to avoid 403 errors in admin dashboard
    let url

    if (isAdmin) {
      // For admin: Get all payments and filter by order_id on client side
      // Note: This is a workaround until API supports order_id filter in admin endpoint
      url = `${apiConfig.endpoints.api}/payments/admin/payments?limit=1000`
    } else {
      // For customers: Direct order payments endpoint
      url = `${apiConfig.endpoints.api}/payments/orders/${orderId}/payments`
    }

    console.log('[paymentsApi] Request URL:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[paymentsApi] API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: url
      })

      // If admin endpoint also fails, return empty array instead of throwing
      if (response.status === 403 || response.status === 404) {
        console.warn(`[paymentsApi] Payments not accessible or not found for order ${orderId}`)
        return { total: 0, payments: [] }
      }

      throw new Error(
        `Failed to fetch payments (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    const data = await response.json()
    console.log('[paymentsApi] Raw API response:', data)

    // Handle both response formats:
    // 1. Direct array: [payment1, payment2, ...]
    // 2. Object with payments: { payments: [...], total: X }
    let allPayments = []

    if (Array.isArray(data)) {
      allPayments = data
    } else if (data.payments && Array.isArray(data.payments)) {
      allPayments = data.payments
    }

    console.log('[paymentsApi] All payments before filtering:', allPayments.length)

    // If using admin endpoint, filter by order_id
    if (isAdmin) {
      // Try both order_id and orderId with type conversion
      const filteredPayments = allPayments.filter(payment => {
        const matches =
          payment.order_id === orderId ||
          payment.orderId === orderId ||
          payment.order_id === String(orderId) ||
          payment.orderId === String(orderId) ||
          payment.order_id === Number(orderId) ||
          payment.orderId === Number(orderId)

        if (matches) {
          console.log('[paymentsApi] Payment matched order_id:', payment.id, payment.order_id || payment.orderId)
        }

        return matches
      })

      console.log('[paymentsApi] Filtered payments for order', orderId, ':', filteredPayments.length)

      return {
        total: filteredPayments.length,
        payments: filteredPayments
      }
    }

    // For customer endpoint, return the data as-is
    console.log('[paymentsApi] Returning customer endpoint data:', allPayments.length, 'payments')

    return {
      total: allPayments.length,
      payments: allPayments
    }
  } catch (error) {
    console.error('Error fetching payments:', error)
    // Return empty instead of throwing to prevent UI crash
    if (error.message?.includes('403') || error.message?.includes('404')) {
      return { total: 0, payments: [] }
    }
    throw error
  }
}

/**
 * Get payment details by ID
 * @param {number} paymentId - Payment ID
 */
export const getPaymentById = async paymentId => {
  try {
    const url = `${apiConfig.endpoints.api}/payments/${paymentId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: url
      })
      throw new Error(
        `Failed to fetch payment (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching payment:', error)
    throw error
  }
}

/**
 * Check payment status (Admin)
 * @param {number} paymentId - Payment ID
 */
export const checkPaymentStatus = async paymentId => {
  try {
    const url = `${apiConfig.endpoints.api}/payments/admin/payments/${paymentId}/check-status`

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: url
      })
      throw new Error(
        `Failed to check payment status (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error checking payment status:', error)
    throw error
  }
}

/**
 * Refund payment (Admin)
 * @param {number} paymentId - Payment ID
 * @param {Object} refundData - Refund details
 * @param {number} refundData.amount - Amount to refund (optional - full refund if not specified)
 * @param {string} refundData.reason - Reason for refund
 */
export const refundPayment = async (paymentId, refundData) => {
  try {
    const url = `${apiConfig.endpoints.api}/payments/admin/payments/${paymentId}/refund`

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(refundData)
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: url
      })
      throw new Error(
        `Failed to refund payment (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error refunding payment:', error)
    throw error
  }
}

/**
 * Get all payments (Admin)
 * @param {Object} params - Query parameters
 * @param {number} params.skip - Number of records to skip
 * @param {number} params.limit - Maximum number of records
 * @param {string} params.provider - Filter by provider
 * @param {string} params.status - Filter by status
 * @param {boolean} params.is_test - Filter test payments
 */
export const getAllPayments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (params.skip !== undefined) queryParams.append('skip', params.skip)
    if (params.limit !== undefined) queryParams.append('limit', params.limit)
    if (params.provider) queryParams.append('provider', params.provider)
    if (params.status) queryParams.append('status', params.status)
    if (params.is_test !== undefined) queryParams.append('is_test', params.is_test)

    const url = `${apiConfig.endpoints.api}/payments/admin/payments?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: url
      })
      throw new Error(
        `Failed to fetch all payments (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching all payments:', error)
    throw error
  }
}

/**
 * Verify payment by payment ID
 * This endpoint returns full payment details for PayPal, Floa, and other payment providers
 * @param {string} paymentId - Payment ID (transaction ID from payment provider)
 */
export const verifyPayment = async paymentId => {
  try {
    // Always convert to string (API expects string)
    const paymentIdString = String(paymentId)

    console.log('[paymentsApi] Verifying payment:', paymentIdString, `(type: ${typeof paymentIdString})`)

    const url = `${apiConfig.endpoints.api}/orders/verify_payment`
    const headers = getAuthHeaders()

    console.log('[paymentsApi] Request URL:', url)
    console.log('[paymentsApi] Request headers:', {
      'Content-Type': headers['Content-Type'],
      'X-API-Key': headers['X-API-Key'] ? 'Present' : 'Missing',
      Authorization: headers['Authorization'] ? 'Present (Bearer token)' : 'Missing'
    })
    console.log('[paymentsApi] Request body:', { payment_id: paymentIdString })

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        payment_id: paymentIdString
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()

      console.log(
        `[paymentsApi] Got error response - Status: ${response.status}, Body length: ${errorBody.length}, Body: "${errorBody}"`
      )

      // Handle 422 - validation error (usually invalid payment_id format)
      if (response.status === 422) {
        console.warn(`⚠️ [paymentsApi] Validation error (422) - invalid payment_id format`)
        return null
      }

      // Handle 404 - payment not found
      if (response.status === 404) {
        console.warn(`⚠️ [paymentsApi] Payment not found (404)`)
        return null
      }

      // Handle 500 errors - most are payment not found
      if (response.status === 500) {
        console.log('[paymentsApi] Got 500 error, checking if payment not found...')

        // Empty response = payment not found
        if (!errorBody || errorBody.trim() === '') {
          console.warn(`⚠️ [paymentsApi] Payment not found (empty error body): ${paymentId}`)
          return null
        }

        // Try to parse error details
        try {
          const errorData = JSON.parse(errorBody)
          console.log('[paymentsApi] Parsed error data:', errorData)

          // Check for payment not found indicators
          const detail = errorData.detail || ''
          if (
            detail.includes('RESOURCE_NOT_FOUND') ||
            detail.includes('INVALID_RESOURCE_ID') ||
            detail.includes('does not exist') ||
            detail.includes('not found') ||
            detail.includes('Failed to verify payment')
          ) {
            console.warn(`⚠️ [paymentsApi] Payment not found in provider: ${paymentId}`)
            return null
          }
        } catch (parseError) {
          // Can't parse = likely payment not found
          console.warn(`⚠️ [paymentsApi] Payment not found (unparseable error): ${paymentId}`)
          return null
        }
      }

      // If we reach here, it's an unexpected error
      console.error('[paymentsApi] Unexpected API error:', {
        status: response.status,
        statusText: response.statusText,
        paymentId: paymentId,
        body: errorBody
      })

      throw new Error(`API Error (${response.status}): ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[paymentsApi] Payment verified successfully:', data)

    return data
  } catch (error) {
    console.error('[paymentsApi] Error verifying payment:', error)
    throw error
  }
}
