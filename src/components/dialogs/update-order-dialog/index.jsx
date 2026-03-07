'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// API Imports
import { updateOrder } from '@/services/ordersApi'
import { useDictionary } from '@/hooks/useDictionary'

const UpdateOrderDialog = ({ open, setOpen, orderData, onUpdate }) => {
  const dictionary = useDictionary()
  // States
  const [formData, setFormData] = useState({
    status: orderData?.status || '',
    payment_status: orderData?.payment_status || '',
    shipping_status: orderData?.shipping_status || '',
    tracking_number: orderData?.tracking_number || '',
    shipping_method: orderData?.shipping_method || '',
    admin_note: orderData?.admin_note || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Handle form change
  const handleChange = field => event => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
    setError(null)
    setSuccess(false)
  }

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Only send changed fields
      const updateData = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== orderData?.[key]) {
          updateData[key] = formData[key]
        }
      })

      if (Object.keys(updateData).length === 0) {
        setError(dictionary?.orders?.noChangesToUpdate || 'No changes to update')
        setLoading(false)
        return
      }

      await updateOrder(orderData.id, updateData)

      setSuccess(true)

      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate()
      }

      // Close dialog after 1 second
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 1000)
    } catch (err) {
      console.error('Error updating order:', err)
      setError(err.message || dictionary?.common?.networkError || 'Failed to update order')
    } finally {
      setLoading(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      setOpen(false)
      setError(null)
      setSuccess(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>
        {(dictionary?.orders?.updateOrderTitle || 'Update Order #{id}').replace('{id}', orderData?.id || '')}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' className='mb-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' className='mb-4'>
            {dictionary?.orders?.orderUpdatedSuccess || 'Order updated successfully!'}
          </Alert>
        )}

        <Grid container spacing={3} className='mt-1'>
          {/* First Row: Order Status + Payment Status */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={dictionary?.orders?.orderStatusLabel || 'Order Status'}
              value={formData.status}
              onChange={handleChange('status')}
              disabled={loading}
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
              SelectProps={{
                sx: { '& .MuiSelect-select': { paddingRight: '40px !important' } }
              }}
            >
              <MenuItem value='pending'>{dictionary?.orders?.pending || 'Pending'}</MenuItem>
              <MenuItem value='confirmed'>{dictionary?.orders?.confirmed || 'Confirmed'}</MenuItem>
              <MenuItem value='completed'>{dictionary?.orders?.completed || 'Completed'}</MenuItem>
              <MenuItem value='cancelled'>{dictionary?.orders?.cancelled || 'Cancelled'}</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={dictionary?.orders?.paymentStatusLabel || 'Payment Status'}
              value={formData.payment_status}
              onChange={handleChange('payment_status')}
              disabled={loading}
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
              SelectProps={{
                sx: { '& .MuiSelect-select': { paddingRight: '40px !important' } }
              }}
            >
              <MenuItem value='pending'>{dictionary?.orders?.pending || 'Pending'}</MenuItem>
              <MenuItem value='completed'>{dictionary?.orders?.completed || 'Completed'}</MenuItem>
              <MenuItem value='failed'>{dictionary?.orders?.failed || 'Failed'}</MenuItem>
              <MenuItem value='refunded'>{dictionary?.orders?.refunded || 'Refunded'}</MenuItem>
            </TextField>
          </Grid>

          {/* Second Row: Shipping Status + Shipping Method */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label={dictionary?.orders?.shippingStatusLabel || 'Shipping Status'}
              value={formData.shipping_status}
              onChange={handleChange('shipping_status')}
              disabled={loading}
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
              SelectProps={{
                sx: { '& .MuiSelect-select': { paddingRight: '40px !important' } }
              }}
            >
              <MenuItem value='pending'>{dictionary?.orders?.pending || 'Pending'}</MenuItem>
              <MenuItem value='shipped'>{dictionary?.orders?.shipped || 'Shipped'}</MenuItem>
              <MenuItem value='delivered'>{dictionary?.orders?.delivered || 'Delivered'}</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={dictionary?.orders?.shippingMethodLabel || 'Shipping Method'}
              value={formData.shipping_method}
              onChange={handleChange('shipping_method')}
              disabled={loading}
              placeholder={dictionary?.orders?.shippingMethodPlaceholder || 'e.g., standard, express'}
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
            />
          </Grid>

          {/* Third Row: Tracking Number (Full Width) */}
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label={dictionary?.orders?.trackingNumberLabel || 'Tracking Number'}
              value={formData.tracking_number}
              onChange={handleChange('tracking_number')}
              disabled={loading}
              placeholder={dictionary?.orders?.trackingNumberPlaceholder || 'Enter tracking number'}
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
            />
          </Grid>

          {/* Fourth Row: Admin Note (Full Width) */}
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label={dictionary?.orders?.adminNote || 'Admin Note'}
              value={formData.admin_note}
              onChange={handleChange('admin_note')}
              disabled={loading}
              multiline
              rows={3}
              placeholder={dictionary?.orders?.adminNotePlaceholder || 'Add optional admin note...'}
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className='px-6 pb-6'>
        <Button onClick={handleClose} disabled={loading} color='secondary' variant='outlined'>
          {dictionary?.common?.cancel || 'Cancel'}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant='contained'
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? dictionary?.common?.updating || 'Updating...' : dictionary?.orders?.updateOrder || 'Update Order'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UpdateOrderDialog
