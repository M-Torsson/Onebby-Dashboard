'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

// Component Imports
import OrderDetails from '@views/apps/ecommerce/orders/details'

// API Imports
import { getOrderById } from '@/services/ordersApi'

// Hook Imports
import useAuthToken from '@/hooks/useAuthToken'

const OrderDetailsPage = props => {
  // Auth hook - syncs NextAuth session with localStorage
  const { isAuthenticated, isLoading: authLoading } = useAuthToken()

  // States
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get params
  const [params, setParams] = useState(null)

  useEffect(() => {
    props.params.then(p => setParams(p))
  }, [props.params])

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    if (!params?.id) return

    // Wait for auth to load
    if (authLoading) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const order = await getOrderById(params.id)

      setOrderData(order)
    } catch (err) {
      console.error('[Order Details] Error fetching order:', err)

      // Check if it's an authentication error
      if (err.message?.includes('401') || err.message?.includes('403')) {
        setError('Please login to view order details. Your session may have expired.')
      } else {
        setError(err.message || 'Failed to fetch order details')
      }
    } finally {
      setLoading(false)
    }
  }, [params, isAuthenticated, authLoading])

  useEffect(() => {
    fetchOrderDetails()
  }, [fetchOrderDetails])

  // Handle update callback - refetch data after update
  const handleUpdate = () => {
    fetchOrderDetails()
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box p={4}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    )
  }

  // Not found state
  if (!orderData) {
    return (
      <Box p={4}>
        <Alert severity='warning'>Order not found</Alert>
      </Box>
    )
  }

  return <OrderDetails orderData={orderData} order={params.id} onUpdate={handleUpdate} />
}

export default OrderDetailsPage
