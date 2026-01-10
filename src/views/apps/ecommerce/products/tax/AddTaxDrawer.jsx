'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'

// API Config
import { API_KEY } from '@/configs/apiConfig'

const API_BASE_URL = 'https://onebby-api.onrender.com/api'

const AddTaxDrawer = props => {
  const { open, handleClose, taxData, onSuccess } = props

  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (open) {
      if (taxData) {
        setFormData({
          name: taxData.name || '',
          rate: taxData.rate || 0,
          is_active: taxData.is_active ?? true
        })
      } else {
        setFormData({
          name: '',
          rate: 0,
          is_active: true
        })
        setError('')
        setSuccess('')
      }
    }
  }, [open, taxData])

  const handleFormSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      if (!formData.name || formData.rate < 0) {
        setError('Name is required and rate must be a positive number')
        setLoading(false)
        return
      }

      const url = taxData ? `${API_BASE_URL}/v1/tax-classes/${taxData.id}` : `${API_BASE_URL}/v1/tax-classes`
      const method = taxData ? 'PUT' : 'POST'

      const bodyData = {
        name: formData.name,
        rate: parseFloat(formData.rate),
        is_active: formData.is_active
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        setSuccess(taxData ? 'Tax class updated successfully!' : 'Tax class created successfully!')
        onSuccess()
        setTimeout(() => {
          handleReset()
        }, 500)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || errorData.message || 'Failed to save tax class')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Save error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      rate: 0,
      is_active: true
    })
    setError('')
    setSuccess('')
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{taxData ? 'Edit Tax Class' : 'Add New Tax Class'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        {error && (
          <Alert severity='error' onClose={() => setError('')} className='mb-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' onClose={() => setSuccess('')} className='mb-4'>
            {success}
          </Alert>
        )}
        <form onSubmit={e => e.preventDefault()} className='flex flex-col gap-6'>
          <CustomTextField
            label='Tax Name'
            fullWidth
            placeholder='e.g., Standard 22%'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <CustomTextField
            label='Tax Rate (%)'
            fullWidth
            type='number'
            placeholder='e.g., 22.0'
            value={formData.rate}
            onChange={e => setFormData({ ...formData, rate: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
            required
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label='Active'
          />
          <Box className='flex gap-4'>
            <Button
              fullWidth
              variant='contained'
              onClick={handleFormSubmit}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color='inherit' />}
            >
              {loading ? 'Saving...' : taxData ? 'Update' : 'Submit'}
            </Button>
            <Button fullWidth variant='tonal' color='error' onClick={handleReset}>
              Cancel
            </Button>
          </Box>
        </form>
      </div>
    </Drawer>
  )
}

export default AddTaxDrawer
