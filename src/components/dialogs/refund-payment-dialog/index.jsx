'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

// API Imports
import { refundPayment } from '@/services/paymentsApi'

const RefundPaymentDialog = ({ open, setOpen, paymentId, amount, onSuccess }) => {
  // States
  const [isPartialRefund, setIsPartialRefund] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [reason, setReason] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleClose = () => {
    if (!loading) {
      setOpen(false)
      // Reset form
      setIsPartialRefund(false)
      setRefundAmount('')
      setReason('')
      setIsConfirmed(false)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    // Validate
    if (!reason.trim()) {
      setError('Please provide a reason for the refund')
      return
    }

    if (isPartialRefund) {
      const refundAmountNum = parseFloat(refundAmount)
      if (!refundAmount || isNaN(refundAmountNum) || refundAmountNum <= 0) {
        setError('Please enter a valid refund amount')
        return
      }
      if (refundAmountNum > parseFloat(amount)) {
        setError('Refund amount cannot exceed payment amount')
        return
      }
    }

    if (!isConfirmed) {
      setError('Please confirm that you want to refund this payment')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const refundData = {
        reason: reason.trim()
      }

      // Add amount for partial refund
      if (isPartialRefund) {
        refundData.amount = parseFloat(refundAmount)
      }

      await refundPayment(paymentId, refundData)

      // Success - call callback and close
      if (onSuccess) {
        onSuccess()
      }
      handleClose()
    } catch (err) {
      console.error('Error refunding payment:', err)
      setError(err.message || 'Failed to refund payment')
    } finally {
      setLoading(false)
    }
  }

  const displayAmount = isPartialRefund ? refundAmount : amount

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <div className='flex items-center gap-2'>
          <i className='tabler-cash-off text-error' />
          <Typography variant='h5'>Refund Payment</Typography>
        </div>
      </DialogTitle>

      <DialogContent>
        <div className='flex flex-col gap-4 pbs-5'>
          {/* Payment Info */}
          <Alert severity='warning'>
            <Typography variant='body2' className='font-medium'>
              Payment ID: #{paymentId}
            </Typography>
            <Typography variant='body2'>Original Amount: €{parseFloat(amount).toFixed(2)}</Typography>
          </Alert>

          {/* Partial Refund Option */}
          <FormControlLabel
            control={<Checkbox checked={isPartialRefund} onChange={e => setIsPartialRefund(e.target.checked)} />}
            label='Partial Refund'
          />

          {/* Refund Amount (for partial refund) */}
          {isPartialRefund && (
            <TextField
              fullWidth
              label='Refund Amount'
              type='number'
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              placeholder='0.00'
              inputProps={{ step: '0.01', min: '0.01', max: amount }}
              helperText={`Maximum: €${parseFloat(amount).toFixed(2)}`}
            />
          )}

          {/* Refund Reason */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Refund Reason'
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder='e.g., Customer request, defective product, etc.'
            required
          />

          <Divider />

          {/* Confirmation */}
          <div className='flex flex-col gap-2'>
            <Typography variant='body2' className='font-medium'>
              Refund Summary:
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              • Refund Amount: €{displayAmount ? parseFloat(displayAmount).toFixed(2) : '0.00'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              • Type: {isPartialRefund ? 'Partial Refund' : 'Full Refund'}
            </Typography>
          </div>

          <FormControlLabel
            control={<Checkbox checked={isConfirmed} onChange={e => setIsConfirmed(e.target.checked)} color='error' />}
            label={
              <Typography variant='body2' color='error'>
                I confirm that I want to refund this payment. This action cannot be undone.
              </Typography>
            }
          />

          {/* Error Message */}
          {error && <Alert severity='error'>{error}</Alert>}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant='tonal' color='secondary' disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color='error'
          disabled={loading || !isConfirmed}
          startIcon={loading ? <CircularProgress size={20} /> : <i className='tabler-cash-off' />}
        >
          {loading ? 'Processing...' : 'Refund Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RefundPaymentDialog
