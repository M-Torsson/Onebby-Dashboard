'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Component Imports
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import RefundPaymentDialog from '@components/dialogs/refund-payment-dialog'

// API Imports
import { getPaymentsByOrderId, checkPaymentStatus } from '@/services/paymentsApi'

// Payment status configuration
const paymentStatusConfig = {
  pending: { text: 'Pending', color: 'warning' },
  processing: { text: 'Processing', color: 'info' },
  completed: { text: 'Completed', color: 'success' },
  failed: { text: 'Failed', color: 'error' },
  cancelled: { text: 'Cancelled', color: 'secondary' },
  refunded: { text: 'Refunded', color: 'secondary' }
}

// Provider display names with icons
const providerConfig = {
  payplug: {
    name: 'Payplug',
    icon: 'tabler-credit-card',
    color: 'primary',
    bgColor: 'primary.lighterOpacity'
  },
  floa: {
    name: 'Floa',
    icon: 'tabler-wallet',
    color: 'warning',
    bgColor: 'warning.lighterOpacity'
  },
  findomestic: {
    name: 'Findomestic',
    icon: 'tabler-building-bank',
    color: 'info',
    bgColor: 'info.lighterOpacity'
  },
  mock: {
    name: 'Test (Mock)',
    icon: 'tabler-flask',
    color: 'secondary',
    bgColor: 'action.hover'
  }
}

const providerNames = {
  payplug: 'Payplug',
  floa: 'Floa',
  findomestic: 'Findomestic',
  mock: 'Test (Mock)'
}

// Payment method display names
const paymentMethodNames = {
  credit_card: 'Credit Card',
  bnpl_3x: 'Buy Now Pay Later (3x)',
  bnpl_4x: 'Buy Now Pay Later (4x)',
  installments_6m: 'Installments (6 months)',
  installments_12m: 'Installments (12 months)',
  installments_24m: 'Installments (24 months)'
}

const PaymentDetailsCard = ({ orderId, onUpdate }) => {
  // States
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState({})

  // Fetch payments when component mounts
  useEffect(() => {
    if (orderId) {
      fetchPayments()
    }
  }, [orderId])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPaymentsByOrderId(orderId)
      setPayments(data.payments || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError(err.message || 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async paymentId => {
    try {
      setCheckingStatus(prev => ({ ...prev, [paymentId]: true }))
      await checkPaymentStatus(paymentId)
      // Refresh payments after checking status
      await fetchPayments()
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error checking payment status:', err)
      setError(err.message || 'Failed to check payment status')
    } finally {
      setCheckingStatus(prev => ({ ...prev, [paymentId]: false }))
    }
  }

  const handleRefundSuccess = async () => {
    // Refresh payments after refund
    await fetchPayments()
    if (onUpdate) onUpdate()
  }

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A'
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
    return `€${parseFloat(amount).toFixed(2)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title='Payment Details' />
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
        <CardHeader title='Payment Details' />
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Payment Details' />
      <CardContent>
        {payments.length === 0 ? (
          <Alert severity='info'>
            <Typography variant='body2'>No payments found for this order yet.</Typography>
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map(payment => {
                  const statusInfo = paymentStatusConfig[payment.status] || {
                    text: payment.status,
                    color: 'default'
                  }
                  const canRefund = payment.status === 'completed' && !payment.refunded_at

                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Typography variant='body2' className='font-medium'>
                          #{payment.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statusInfo.text} color={statusInfo.color} size='small' variant='tonal' />
                      </TableCell>
                      <TableCell>
                        <Typography className='font-medium'>{formatAmount(payment.amount)}</Typography>
                        {payment.refunded_at && (
                          <Typography variant='caption' color='error'>
                            Refunded on {formatDate(payment.refunded_at)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const providerInfo = providerConfig[payment.provider]
                          if (providerInfo) {
                            return (
                              <div className='flex items-center gap-2'>
                                <div
                                  className='flex justify-center items-center rounded px-2 py-1'
                                  style={{ backgroundColor: `var(--mui-palette-${providerInfo.color}-lighterOpacity)` }}
                                >
                                  <i className={`${providerInfo.icon} text-${providerInfo.color} text-base`} />
                                </div>
                                <div className='flex flex-col'>
                                  <Typography variant='body2' className='font-medium'>
                                    {providerInfo.name}
                                  </Typography>
                                  {payment.provider_payment_id && (
                                    <Typography variant='caption' color='text.secondary'>
                                      {payment.provider_payment_id}
                                    </Typography>
                                  )}
                                </div>
                              </div>
                            )
                          }
                          return (
                            <div>
                              <Typography variant='body2'>
                                {providerNames[payment.provider] || payment.provider}
                              </Typography>
                              {payment.provider_payment_id && (
                                <Typography variant='caption' color='text.secondary'>
                                  {payment.provider_payment_id}
                                </Typography>
                              )}
                            </div>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {paymentMethodNames[payment.payment_method] || payment.payment_method}
                        </Typography>
                        {payment.payment_info?.card_last4 && (
                          <Typography variant='caption' color='text.secondary'>
                            •••• {payment.payment_info.card_last4}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{formatDate(payment.created_at)}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Tooltip title='Check Status'>
                            <span>
                              <IconButton
                                size='small'
                                onClick={() => handleCheckStatus(payment.id)}
                                disabled={checkingStatus[payment.id]}
                              >
                                {checkingStatus[payment.id] ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <i className='tabler-refresh' />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          {canRefund && (
                            <OpenDialogOnElementClick
                              element={IconButton}
                              elementProps={{
                                size: 'small',
                                color: 'error',
                                children: (
                                  <Tooltip title='Refund'>
                                    <i className='tabler-cash-off' />
                                  </Tooltip>
                                )
                              }}
                              dialog={RefundPaymentDialog}
                              dialogProps={{
                                paymentId: payment.id,
                                amount: payment.amount,
                                onSuccess: handleRefundSuccess
                              }}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentDetailsCard
