// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

/**
 * Orders API Service
 * Handles all API calls related to orders
 */

import { apiConfig } from '@/configs/apiConfig'
import { getAuthToken, getAuthorizationHeader } from '@/utils/authTokenManager'

/**
 * Get auth headers for API requests
 * Note: In client components, we might need to pass the token directly
 */
const getAuthHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': apiConfig.apiKey
  }

  // Get token from parameter or storage
  const authToken = token || getAuthToken()

  if (authToken) {
    // Ensure token doesn't have "Bearer " prefix, then add it
    const cleanToken = authToken.startsWith('Bearer ') ? authToken.substring(7) : authToken
    headers['Authorization'] = `Bearer ${cleanToken}`
  } else {
    console.error('[ordersApi] ❌ NO AUTHENTICATION TOKEN FOUND!')
    console.error('[ordersApi] Please login first or check token storage')
  }

  return headers
}

/**
 * Get all orders (Admin)
 * @param {Object} params - Query parameters
 * @param {number} params.skip - Number of records to skip
 * @param {number} params.limit - Maximum number of records
 * @param {string} params.status - Filter by status
 * @param {string} params.payment_status - Filter by payment status
 * @param {string} params.shipping_status - Filter by shipping status
 * @param {string} params.user_type - Filter by user type
 */
export const getAllOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (params.skip !== undefined) queryParams.append('skip', params.skip)
    if (params.limit !== undefined) queryParams.append('limit', params.limit)
    if (params.status) queryParams.append('status', params.status)
    if (params.payment_status) queryParams.append('payment_status', params.payment_status)
    if (params.shipping_status) queryParams.append('shipping_status', params.shipping_status)
    if (params.user_type) queryParams.append('user_type', params.user_type)

    const url = `${apiConfig.endpoints.api}/orders/admin/all?${queryParams.toString()}`

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
        `Failed to fetch orders (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

/**
 * Get order details by ID (Admin)
 * @param {number} orderId - Order ID
 */
export const getOrderById = async orderId => {
  try {
    const url = `${apiConfig.endpoints.api}/orders/admin/${orderId}`

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
        `Failed to fetch order (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

/**
 * Update order (Admin)
 * @param {number} orderId - Order ID
 * @param {Object} updateData - Data to update
 */
export const updateOrder = async (orderId, updateData) => {
  try {
    const url = `${apiConfig.endpoints.api}/orders/admin/${orderId}`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
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
        `Failed to update order (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

/**
 * Get orders statistics (Admin)
 */
export const getOrdersStatistics = async () => {
  try {
    const url = `${apiConfig.endpoints.api}/orders/admin/statistics/overview`

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
        `Failed to fetch statistics (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching statistics:', error)
    throw error
  }
}

/**
 * Get orders with failed warranties (Admin)
 * @param {Object} params - Query parameters
 */
export const getFailedWarranties = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (params.skip !== undefined) queryParams.append('skip', params.skip)
    if (params.limit !== undefined) queryParams.append('limit', params.limit)

    const url = `${apiConfig.endpoints.api}/orders/admin/failed-warranties?${queryParams.toString()}`

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
        `Failed to fetch failed warranties (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching failed warranties:', error)
    throw error
  }
}

/**
 * Update warranty information for an order item (Admin)
 * @param {number} orderId - Order ID
 * @param {number} itemId - Order item ID
 * @param {Object} warrantyData - Warranty data to update
 */
export const updateItemWarranty = async (orderId, itemId, warrantyData) => {
  try {
    const url = `${apiConfig.endpoints.api}/orders/admin/${orderId}/items/${itemId}/warranty`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(warrantyData)
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
        `Failed to update warranty (${response.status}): ${response.statusText}. ${errorBody || 'Check API_KEY and authentication token.'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating warranty:', error)
    throw error
  }
}

export default {
  getAllOrders,
  getOrderById,
  updateOrder,
  getOrdersStatistics,
  getFailedWarranties,
  updateItemWarranty
}
