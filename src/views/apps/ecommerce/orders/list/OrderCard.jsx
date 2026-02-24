'use client'

// React Im ports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// API Imports
import { getOrdersStatistics } from '@/services/ordersApi'

// Hook Imports
import useAuthToken from '@/hooks/useAuthToken'

const OrderCard = () => {
  // Auth hook
  const { isAuthenticated, isLoading: authLoading } = useAuthToken()

  // States
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  // Fetch statistics when component mounts and user is authenticated
  useEffect(() => {
    const fetchStatistics = async () => {
      // Wait for auth to load
      if (authLoading) {
        console.log('[OrderCard] Waiting for auth to load...')
        return
      }

      try {
        setLoading(true)

        console.log('[OrderCard] Fetching statistics... isAuthenticated:', isAuthenticated)

        const stats = await getOrdersStatistics()

        console.log('[OrderCard] Statistics fetched successfully:', stats)
        setStatistics(stats)
      } catch (error) {
        console.error('[OrderCard] Error fetching statistics:', error)
        // Use default values if API fails
        setStatistics({
          unpaid_orders: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          paid_orders: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [isAuthenticated, authLoading])

  // Prepare data array from statistics
  const data = statistics
    ? [
        {
          value: statistics.unpaid_orders || 0,
          title: 'Pending Payment',
          icon: 'tabler-calendar-stats'
        },
        {
          value: statistics.completed_orders || 0,
          title: 'Completed',
          icon: 'tabler-checks'
        },
        {
          value: statistics.cancelled_orders || 0,
          title: 'Refunded',
          icon: 'tabler-wallet'
        },
        {
          value: statistics.paid_orders || 0,
          title: 'Paid',
          icon: 'tabler-alert-octagon'
        }
      ]
    : []

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='120px'>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {data.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              key={index}
              className={classnames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                  isBelowMdScreen && !isBelowSmScreen,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
              })}
            >
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>{item.value.toLocaleString()}</Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={42} skin='light'>
                  <i className={classnames(item.icon, 'text-[26px]')} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < data.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < data.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default OrderCard
