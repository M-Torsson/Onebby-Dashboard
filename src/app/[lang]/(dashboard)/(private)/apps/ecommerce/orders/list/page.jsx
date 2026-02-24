'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

// Component Imports
import OrderList from '@views/apps/ecommerce/orders/list'

// API Imports
import { getAllOrders } from '@/services/ordersApi'

// Hook Imports
import useAuthToken from '@/hooks/useAuthToken'

const OrdersListPage = () => {
  // Auth hook - syncs NextAuth session with localStorage
  const { isAuthenticated, isLoading: authLoading } = useAuthToken()

  // States
  const [orderData, setOrderData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch orders when component mounts and user is authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      // Wait for auth to load
      if (authLoading) {
        console.log('[Orders List] Waiting for auth to load...')
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log('[Orders List] Fetching orders... isAuthenticated:', isAuthenticated)

        // Fetch all orders from API
        const orders = await getAllOrders({ limit: 100 })

        console.log('[Orders List] Orders fetched successfully:', orders?.length || 0)
        setOrderData(orders)
      } catch (err) {
        console.error('[Orders List] Error fetching orders:', err)

        // Check if it's an authentication error
        if (err.message?.includes('401') || err.message?.includes('403')) {
          setError('Please login to view orders. Your session may have expired.')
        } else {
          setError(err.message || 'Failed to fetch orders')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, authLoading])

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

  return <OrderList orderData={orderData} />
}

export default OrdersListPage
