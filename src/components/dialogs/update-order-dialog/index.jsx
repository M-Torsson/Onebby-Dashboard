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

const UpdateOrderDialog = ({ open, setOpen, orderData, onUpdate }) => {
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
        setError('No changes to update')
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
      setError(err.message || 'Failed to update order')
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
      <DialogTitle>Update Order #{orderData?.id}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error' className='mb-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' className='mb-4'>
            Order updated successfully!
          </Alert>
        )}

        <Grid container spacing={3} className='mt-1'>
          {/* First Row: Order Status + Payment Status */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label='Order Status'
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
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='confirmed'>Confirmed</MenuItem>
              <MenuItem value='completed'>Completed</MenuItem>
              <MenuItem value='cancelled'>Cancelled</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label='Payment Status'
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
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='completed'>Completed</MenuItem>
              <MenuItem value='failed'>Failed</MenuItem>
              <MenuItem value='refunded'>Refunded</MenuItem>
            </TextField>
          </Grid>

          {/* Second Row: Shipping Status + Shipping Method */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label='Shipping Status'
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
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='shipped'>Shipped</MenuItem>
              <MenuItem value='delivered'>Delivered</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Shipping Method'
              value={formData.shipping_method}
              onChange={handleChange('shipping_method')}
              disabled={loading}
              placeholder='e.g., standard, express'
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
            />
          </Grid>

          {/* Third Row: Tracking Number (Full Width) */}
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label='Tracking Number'
              value={formData.tracking_number}
              onChange={handleChange('tracking_number')}
              disabled={loading}
              placeholder='Enter tracking number'
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
            />
          </Grid>

          {/* Fourth Row: Admin Note (Full Width) */}
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label='Admin Note'
              value={formData.admin_note}
              onChange={handleChange('admin_note')}
              disabled={loading}
              multiline
              rows={3}
              placeholder='Add optional admin note...'
              InputLabelProps={{
                sx: { whiteSpace: 'nowrap' }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className='px-6 pb-6'>
        <Button onClick={handleClose} disabled={loading} color='secondary' variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant='contained'
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Updating...' : 'Update Order'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UpdateOrderDialog
