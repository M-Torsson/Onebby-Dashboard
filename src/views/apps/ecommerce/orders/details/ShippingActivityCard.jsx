'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'
import { useDictionary } from '@/hooks/useDictionary'

// Styled Timeline component
const Timeline = styled(MuiTimeline)({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    },
    '& .MuiTimelineContent-root:last-child': {
      paddingBottom: 0
    },
    '&:nth-last-child(2) .MuiTimelineConnector-root': {
      backgroundColor: 'transparent',
      borderInlineStart: '1px dashed var(--mui-palette-divider)'
    },
    '& .MuiTimelineConnector-root': {
      backgroundColor: 'var(--mui-palette-primary-main)'
    }
  }
})

// Helper function to format date
const formatDate = dateString => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const ShippingActivity = ({ orderData }) => {
  const dictionary = useDictionary()
  // Map shipping status to display text
  const shippingStatusMap = {
    pending: dictionary?.orders?.pending || 'Pending',
    processing: dictionary?.orders?.processing || 'Processing',
    shipped: dictionary?.orders?.shipped || 'Shipped',
    delivered: dictionary?.orders?.delivered || 'Delivered',
    cancelled: dictionary?.orders?.cancelled || 'Cancelled'
  }

  // Generate timeline events based on order data
  const timelineEvents = useMemo(() => {
    if (!orderData) return []

    const events = []

    // 1. Order Placed
    events.push({
      title: `${dictionary?.orders?.orderWasPlaced || 'Order was placed'} (Order ID: #${orderData.id})`,
      description: dictionary?.orders?.orderPlacedSuccess || 'Your order has been placed successfully',
      date: formatDate(orderData.created_at),
      status: 'completed'
    })

    // 2. Payment Status
    if (orderData.payment_status === 'completed' || orderData.payment_status === 'paid') {
      events.push({
        title: dictionary?.orders?.paymentConfirmed || 'Payment Confirmed',
        description: `${dictionary?.orders?.paymentReceived || 'Payment received via'} ${orderData.payment_method || dictionary?.orders?.notAvailable || 'N/A'}`,
        date: formatDate(orderData.created_at), // Usually same as order creation
        status: 'completed'
      })
    }

    // 3. Processing
    if (orderData.shipping_status !== 'pending') {
      events.push({
        title: dictionary?.orders?.orderProcessing || 'Order Processing',
        description: dictionary?.orders?.orderPreparingShipment || 'Your order is being prepared for shipment',
        date: formatDate(orderData.created_at),
        status: 'completed'
      })
    }

    // 4. Shipped
    if (orderData.shipped_at || orderData.shipping_status === 'shipped' || orderData.shipping_status === 'delivered') {
      events.push({
        title: dictionary?.orders?.dispatched || 'Dispatched',
        description: orderData.tracking_number
          ? `${dictionary?.orders?.packageShippedVia || 'Package shipped via'} ${orderData.shipping_method || 'standard'} (Tracking: ${orderData.tracking_number})`
          : `${dictionary?.orders?.packageShippedVia || 'Package shipped via'} ${orderData.shipping_method || 'standard'}`,
        date: formatDate(orderData.shipped_at),
        status: 'completed'
      })
    }

    // 5. In Transit
    if (orderData.shipping_status === 'shipped' || orderData.shipping_status === 'delivered') {
      events.push({
        title: dictionary?.orders?.inTransit || 'In Transit',
        description: dictionary?.orders?.packageOnTheWay || 'Package is on the way',
        date: formatDate(orderData.shipped_at),
        status: 'completed'
      })
    }

    // 6. Delivered
    if (orderData.delivered_at || orderData.shipping_status === 'delivered') {
      events.push({
        title: dictionary?.orders?.delivered || 'Delivered',
        description: dictionary?.orders?.packageDelivered || 'Package has been delivered successfully',
        date: formatDate(orderData.delivered_at),
        status: 'completed'
      })
    } else {
      // Expected delivery
      events.push({
        title: dictionary?.orders?.delivery || 'Delivery',
        description:
          orderData.shipping_status === 'shipped'
            ? dictionary?.orders?.deliverySoon || 'Package will be delivered soon'
            : dictionary?.orders?.waitingForShipment || 'Waiting for shipment',
        date: '',
        status: 'pending'
      })
    }

    return events
  }, [orderData])

  // Calculate delivery and warranty options from all items
  const deliveryAndWarrantyOptions = useMemo(() => {
    if (!orderData?.items) return { deliveryOptions: [], warrantyOptions: [] }

    const deliveryOptions = []
    const warrantyOptions = []

    orderData.items.forEach(item => {
      try {
        // Parse delivery_option
        if (item.delivery_option) {
          let deliveryOption = null
          if (typeof item.delivery_option === 'string') {
            deliveryOption = JSON.parse(item.delivery_option)
          } else if (typeof item.delivery_option === 'object') {
            deliveryOption = item.delivery_option
          }
          if (deliveryOption) {
            deliveryOptions.push({
              option: deliveryOption.option,
              price: parseFloat(deliveryOption.price || 0)
            })
          }
        }

        // Parse warranty_option
        if (item.warranty_option) {
          let warrantyOption = null
          if (typeof item.warranty_option === 'string') {
            warrantyOption = JSON.parse(item.warranty_option)
          } else if (typeof item.warranty_option === 'object') {
            warrantyOption = item.warranty_option
          }
          if (warrantyOption) {
            warrantyOptions.push({
              title: warrantyOption.title,
              price: parseFloat(warrantyOption.price || 0)
            })
          }
        }
      } catch (e) {
        console.error('[ShippingActivityCard] Failed to parse options:', e)
      }
    })

    return { deliveryOptions, warrantyOptions }
  }, [orderData])

  // Show shipping info header
  const shippingInfo = orderData ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mb: 4,
        p: 3,
        bgcolor: 'action.hover',
        borderRadius: 1,
        border: theme => `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography variant='body2'>
        <strong>{dictionary?.orders?.shippingMethod || 'Shipping Method:'}</strong>{' '}
        {orderData.shipping_method?.charAt(0).toUpperCase() + orderData.shipping_method?.slice(1) || 'Standard'}
      </Typography>
      <Typography variant='body2'>
        <strong>{dictionary?.orders?.shippingCost || 'Shipping Cost:'}</strong> €
        {parseFloat(orderData.shipping_cost || 0).toFixed(2)}
      </Typography>
      {deliveryAndWarrantyOptions.deliveryOptions.length > 0 && (
        <div className='flex flex-col gap-1 mt-2'>
          {deliveryAndWarrantyOptions.deliveryOptions.map((opt, idx) => (
            <Typography key={`delivery-${idx}`} variant='body2' color='text.primary'>
              🚚 {opt.option} (+€{opt.price.toFixed(2)})
            </Typography>
          ))}
        </div>
      )}
      {deliveryAndWarrantyOptions.warrantyOptions.length > 0 && (
        <div className='flex flex-col gap-1 mt-1'>
          {deliveryAndWarrantyOptions.warrantyOptions.map((opt, idx) => (
            <Typography key={`warranty-${idx}`} variant='body2' color='text.primary'>
              🛡️ {opt.title} (+€{opt.price.toFixed(2)})
            </Typography>
          ))}
        </div>
      )}
      {orderData.tracking_number && (
        <Typography variant='body2'>
          <strong>{dictionary?.orders?.trackingNumber || 'Tracking Number:'}</strong> {orderData.tracking_number}
        </Typography>
      )}
      <Typography variant='body2'>
        <strong>{dictionary?.orders?.status || 'Status:'}</strong>{' '}
        {shippingStatusMap[orderData.shipping_status] ||
          orderData.shipping_status ||
          dictionary?.orders?.pending ||
          'Pending'}
      </Typography>
    </Box>
  ) : null

  return (
    <Card>
      <CardHeader title={dictionary?.orders?.shippingActivity || 'Shipping Activity'} />
      <CardContent>
        {shippingInfo}
        <Timeline>
          {timelineEvents.map((event, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot color={event.status === 'completed' ? 'primary' : 'secondary'} />
                {index < timelineEvents.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                  <Typography color='text.primary' className='font-medium'>
                    {event.title}
                  </Typography>
                  {event.date && <Typography variant='caption'>{event.date}</Typography>}
                </div>
                <Typography className='mbe-2'>{event.description}</Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default ShippingActivity
