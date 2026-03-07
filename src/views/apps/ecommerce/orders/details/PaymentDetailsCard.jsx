'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import { useDictionary } from '@/hooks/useDictionary'

// API Imports
import { verifyPayment } from '@/services/paymentsApi'

// Payment status configuration
const paymentStatusConfig = {
  pending: { text: 'Pending', color: 'warning' },
  processing: { text: 'Processing', color: 'info' },
  completed: { text: 'Completed', color: 'success' },
  approved: { text: 'Approved', color: 'success' },
  created: { text: 'Created', color: 'info' },
  failed: { text: 'Failed', color: 'error' },
  cancelled: { text: 'Cancelled', color: 'secondary' },
  refunded: { text: 'Refunded', color: 'secondary' }
}

const PaymentDetailsCard = ({ orderData, onUpdate }) => {
  const dictionary = useDictionary()
  // States
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch payment details when component mounts or order changes
  useEffect(() => {
    let isMounted = true

    const loadPaymentDetails = async () => {
      if (!orderData) return

      try {
        setLoading(true)
        setError(null)

        // Extract payment_id from orderData - try payment_transaction_id first (for PayPlug)
        const paymentId =
          orderData?.payment_transaction_id || // ✅ Try this first (e.g., "pay_7juxionqDVnhomH90EkPSO")
          orderData?.transaction_id ||
          orderData?.payment_info?.payment_id || // May be string or number
          orderData?.payment_id ||
          orderData?.paymentId ||
          orderData?.paypal_payment_id ||
          orderData?.paypal_order_id ||
          orderData?.payplug_payment_id ||
          orderData?.floa_payment_id ||
          orderData?.floa_deal_id ||
          orderData?.external_payment_id ||
          orderData?.provider_payment_id

        if (!paymentId) {
          console.warn('⚠️ [PaymentDetailsCard] No payment_id found in order data')
          if (isMounted) {
            setError(dictionary?.orders?.paymentIdNotFound || 'Payment ID not found in order data.')
            setPaymentDetails(null)
            setLoading(false)
          }
          return
        }

        // Convert to string (API expects string, not number)
        const paymentIdString = String(paymentId)

        console.log('[PaymentDetailsCard] Calling verify_payment with payment_id:', paymentIdString)

        const data = await verifyPayment(paymentIdString)

        if (!isMounted) return

        // If data is null, payment was not found in provider system (expected case)
        if (data === null) {
          console.warn('⚠️ [PaymentDetailsCard] Payment not found in provider system, showing basic info')
          setError(
            dictionary?.orders?.paymentNotFound ||
              'Payment not found in payment provider. Showing basic information from order data.'
          )
          setPaymentDetails(null)
        } else {
          console.log('[PaymentDetailsCard] Payment verified successfully')
          setPaymentDetails(data)
        }
      } catch (err) {
        if (!isMounted) return

        // Only log unexpected errors
        console.error('❌ [PaymentDetailsCard] Unexpected error fetching payment:', err.message)

        // Handle specific error cases
        let errorMessage = err.message || 'Failed to fetch payment details'

        if (errorMessage.includes('500')) {
          errorMessage = dictionary?.orders?.paymentProviderError || 'Payment provider error. Please try again later.'
        } else if (errorMessage.includes('authentication') || errorMessage.includes('API_KEY')) {
          errorMessage = dictionary?.orders?.paymentAuthError || 'Authentication error. Please contact support.'
        }

        setError(errorMessage)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPaymentDetails()

    return () => {
      isMounted = false
    }
  }, [orderData?.id]) // Only re-run when order ID changes

  // Format date
  const formatDate = dateString => {
    if (!dateString) return dictionary?.orders?.notAvailable || 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Format amount
  const formatAmount = amount => {
    if (!amount) return dictionary?.orders?.notAvailable || 'N/A'
    return `€${parseFloat(amount).toFixed(2)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title={dictionary?.orders?.paymentDetails || 'Payment Details'} />
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title={dictionary?.orders?.paymentDetails || 'Payment Details'} />
        <CardContent>
          <Alert severity='warning' className='mb-4'>
            {error}
          </Alert>

          {/* Show basic payment info from orderData even if verification failed */}
          {orderData && (
            <Box>
              <Typography variant='subtitle2' className='mb-3'>
                {dictionary?.orders?.basicPaymentInfo || 'Basic Payment Information'}
              </Typography>

              {/* Payment Method */}
              <Box className='flex items-center justify-between gap-4 mb-3'>
                <Typography variant='body2' color='text.secondary'>
                  {dictionary?.orders?.paymentMethod || 'Payment Method:'}
                </Typography>
                <Chip
                  label={orderData.payment_method || dictionary?.orders?.notAvailable || 'N/A'}
                  color='primary'
                  size='small'
                  variant='tonal'
                />
              </Box>

              {/* Payment Status */}
              <Box className='flex items-center justify-between gap-4 mb-3'>
                <Typography variant='body2' color='text.secondary'>
                  {dictionary?.orders?.paymentStatus || 'Payment Status:'}
                </Typography>
                <Chip
                  label={orderData.payment_status || dictionary?.orders?.notAvailable || 'N/A'}
                  color={orderData.payment_status === 'paid' ? 'success' : 'warning'}
                  size='small'
                  variant='tonal'
                />
              </Box>

              {/* Payment ID */}
              {orderData.payment_info?.payment_id && (
                <Box className='flex items-center justify-between gap-4 mb-3'>
                  <Typography variant='body2' color='text.secondary'>
                    {dictionary?.orders?.paymentId || 'Payment ID:'}
                  </Typography>
                  <Typography variant='body2' className='font-medium'>
                    {orderData.payment_info.payment_id}
                  </Typography>
                </Box>
              )}

              {/* Total Amount */}
              <Box className='flex items-center justify-between gap-4'>
                <Typography variant='body2' color='text.secondary'>
                  {dictionary?.orders?.totalAmount || 'Total Amount:'}
                </Typography>
                <Typography variant='h6' className='font-semibold'>
                  {formatAmount(orderData.total_amount)}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={dictionary?.orders?.paymentDetails || 'Payment Details'} />
      <CardContent>
        {!paymentDetails ? (
          <Alert severity='info'>
            <Typography variant='body2'>
              {dictionary?.orders?.noPaymentInfo || 'No payment information found for this order yet.'}
            </Typography>
          </Alert>
        ) : (
          <Box>
            {/* Payment Provider/Method */}
            <Box className='flex items-center justify-between gap-4 mb-4'>
              <Typography variant='body2' color='text.secondary'>
                {dictionary?.orders?.paymentMethod || 'Payment Method:'}
              </Typography>
              <Chip
                label={orderData?.payment_method || dictionary?.orders?.notAvailable || 'N/A'}
                color='primary'
                size='small'
                variant='tonal'
              />
            </Box>

            {/* Payment ID */}
            <Box className='flex items-center justify-between gap-4 mb-4'>
              <Typography variant='body2' color='text.secondary'>
                {dictionary?.orders?.transactionId || 'Transaction ID:'}
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {paymentDetails.transaction_number || paymentDetails.payment_id}
              </Typography>
            </Box>

            {/* Status */}
            <Box className='flex items-center justify-between gap-4 mb-4'>
              <Typography variant='body2' color='text.secondary'>
                {dictionary?.orders?.status || 'Status:'}
              </Typography>
              <Chip
                label={paymentStatusConfig[paymentDetails.status]?.text || paymentDetails.status}
                color={paymentStatusConfig[paymentDetails.status]?.color || 'default'}
                size='small'
                variant='tonal'
              />
            </Box>

            {/* Amount */}
            <Box className='flex items-center justify-between gap-4 mb-4'>
              <Typography variant='body2' color='text.secondary'>
                {dictionary?.orders?.amount || 'Amount:'}
              </Typography>
              <Typography variant='h6' className='font-semibold'>
                {formatAmount(paymentDetails.amount)}
              </Typography>
            </Box>

            {/* Payment Status */}
            <Box className='flex items-center justify-between gap-4 mb-4'>
              <Typography variant='body2' color='text.secondary'>
                {dictionary?.orders?.paidLabel || 'Paid:'}
              </Typography>
              <Chip
                label={paymentDetails.is_paid ? dictionary?.delivery?.yes || 'Yes' : dictionary?.delivery?.no || 'No'}
                color={paymentDetails.is_paid ? 'success' : 'error'}
                size='small'
                variant='tonal'
              />
            </Box>

            {/* Customer Email */}
            {paymentDetails.customer_email && (
              <Box className='flex items-center justify-between gap-4 mb-4'>
                <Typography variant='body2' color='text.secondary'>
                  {dictionary?.orders?.customerEmail || 'Customer Email:'}
                </Typography>
                <Typography variant='body2'>{paymentDetails.customer_email}</Typography>
              </Box>
            )}

            {/* Deal Status (Floa) */}
            {paymentDetails.deal_status && (
              <Box className='flex items-center justify-between gap-4 mb-4'>
                <Typography variant='body2' color='text.secondary'>
                  {dictionary?.orders?.dealStatus || 'Deal Status:'}
                </Typography>
                <Chip
                  label={paymentDetails.deal_status}
                  color={paymentDetails.deal_status === 'APPROVED' ? 'success' : 'warning'}
                  size='small'
                  variant='tonal'
                />
              </Box>
            )}

            {/* Order Status (PayPal) */}
            {paymentDetails.order_status && (
              <Box className='flex items-center justify-between gap-4 mb-4'>
                <Typography variant='body2' color='text.secondary'>
                  {dictionary?.orders?.orderStatus || 'Order Status:'}
                </Typography>
                <Chip
                  label={paymentDetails.order_status}
                  color={paymentDetails.order_status === 'COMPLETED' ? 'success' : 'warning'}
                  size='small'
                  variant='tonal'
                />
              </Box>
            )}

            {/* Paid At */}
            {paymentDetails.paid_at && (
              <Box className='flex items-center justify-between gap-4 mb-4'>
                <Typography variant='body2' color='text.secondary'>
                  {dictionary?.orders?.paidAt || 'Paid At:'}
                </Typography>
                <Typography variant='body2'>{formatDate(paymentDetails.paid_at)}</Typography>
              </Box>
            )}

            {/* Date */}
            <Box className='flex items-center justify-between gap-4'>
              <Typography variant='body2' color='text.secondary'>
                {dictionary?.orders?.createdAt || 'Created At:'}
              </Typography>
              <Typography variant='body2'>{formatDate(paymentDetails.created_at)}</Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentDetailsCard
