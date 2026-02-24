'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from '@core/components/mui/TextField'

const AddressManagement = ({ userId, addressType = 'customer' }) => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingAddresses, setFetchingAddresses] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [addressForm, setAddressForm] = useState({
    alias: '',
    name: '',
    last_name: '',
    company: '',
    company_name: '',
    address_house_number: '',
    house_number: '',
    city: '',
    postal_code: '',
    country: '',
    phone: ''
  })

  useEffect(() => {
    if (userId) {
      fetchAddresses()
    }
  }, [userId])

  const fetchAddresses = async () => {
    try {
      setFetchingAddresses(true)
      const endpoint = addressType === 'customer' 
        ? `https://onebby-api.onrender.com/api/addresses/customers/${userId}/addresses`
        : `https://onebby-api.onrender.com/api/addresses/companies/${userId}/addresses`

      const response = await fetch(endpoint, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
    } finally {
      setFetchingAddresses(false)
    }
  }

  const handleOpenDialog = (address = null) => {
    if (address) {
      setEditingAddress(address)
      setAddressForm({
        alias: address.alias || '',
        name: address.name || '',
        last_name: address.last_name || '',
        company: address.company || '',
        company_name: address.company_name || '',
        address_house_number: address.address_house_number || '',
        house_number: address.house_number || '',
        city: address.city || '',
        postal_code: address.postal_code || '',
        country: address.country || '',
        phone: address.phone || ''
      })
    } else {
      setEditingAddress(null)
      setAddressForm({
        alias: '',
        name: '',
        last_name: '',
        company: '',
        company_name: '',
        address_house_number: '',
        house_number: '',
        city: '',
        postal_code: '',
        country: '',
        phone: ''
      })
    }
    setOpenDialog(true)
    setError('')
    setSuccess('')
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingAddress(null)
    setError('')
  }

  const handleSaveAddress = async () => {
    try {
      setLoading(true)
      setError('')

      // Validation
      if (addressType === 'customer') {
        if (!addressForm.name || !addressForm.last_name) {
          setError('Name and Last Name are required')
          setLoading(false)
          return
        }
      } else {
        if (!addressForm.company_name) {
          setError('Company Name is required')
          setLoading(false)
          return
        }
      }

      if (!addressForm.address_house_number || !addressForm.house_number || 
          !addressForm.city || !addressForm.postal_code || !addressForm.country || !addressForm.phone) {
        setError('All address fields are required')
        setLoading(false)
        return
      }

      const endpoint = addressType === 'customer'
        ? `https://onebby-api.onrender.com/api/addresses/customers/${userId}/addresses`
        : `https://onebby-api.onrender.com/api/addresses/companies/${userId}/addresses`

      const url = editingAddress ? `${endpoint}/${editingAddress.id}` : endpoint
      const method = editingAddress ? 'PUT' : 'POST'

      // Prepare body based on address type
      const body = addressType === 'customer' 
        ? {
            alias: addressForm.alias,
            name: addressForm.name,
            last_name: addressForm.last_name,
            company: addressForm.company,
            address_house_number: addressForm.address_house_number,
            house_number: addressForm.house_number,
            city: addressForm.city,
            postal_code: addressForm.postal_code,
            country: addressForm.country,
            phone: addressForm.phone
          }
        : {
            alias: addressForm.alias,
            company_name: addressForm.company_name,
            address_house_number: addressForm.address_house_number,
            house_number: addressForm.house_number,
            city: addressForm.city,
            postal_code: addressForm.postal_code,
            country: addressForm.country,
            phone: addressForm.phone
          }

      const response = await fetch(url, {
        method,
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || 'Failed to save address')
        setLoading(false)
        return
      }

      setSuccess(editingAddress ? 'Address updated successfully!' : 'Address added successfully!')
      handleCloseDialog()
      fetchAddresses()
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error saving address:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const endpoint = addressType === 'customer'
        ? `https://onebby-api.onrender.com/api/addresses/customers/${userId}/addresses/${addressId}`
        : `https://onebby-api.onrender.com/api/addresses/companies/${userId}/addresses/${addressId}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
        }
      })

      if (response.ok) {
        setSuccess('Address deleted successfully!')
        fetchAddresses()
      } else {
        setError('Failed to delete address')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error deleting address:', err)
    }
  }

  return (
    <>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent className='pb-0 pt-5 px-6'>
          <div className='flex justify-between items-start gap-6 mb-4'>
            <div>
              <Typography variant='h5' className='font-semibold mb-1'>
                Address Information
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Manage delivery and billing addresses
              </Typography>
            </div>
            <Button 
              variant='contained'
              size='small'
              startIcon={<i className='tabler-plus' />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                minWidth: '120px',
                flexShrink: 0
              }}
            >
              Add Address
            </Button>
          </div>
          {addresses.length > 0 && (
            <div className='flex items-center gap-2 pb-4 pt-3'>
              <i className='tabler-checklist text-primary text-lg' />
              <Typography variant='body2' color='text.secondary'>
                {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
              </Typography>
            </div>
          )}
        </CardContent>
        <Divider />
        <CardContent className='pt-6 pb-6 px-6'>
          {success && (
            <Alert severity='success' onClose={() => setSuccess('')} className='mb-5' sx={{ borderRadius: 1.5 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity='error' onClose={() => setError('')} className='mb-5' sx={{ borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          {fetchingAddresses ? (
            <div className='flex justify-center items-center py-12'>
              <CircularProgress />
            </div>
          ) : addresses.length === 0 ? (
            <div className='text-center py-16'>
              <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-lighter mb-4'>
                <i className='tabler-map-pin text-5xl text-primary' />
              </div>
              <Typography variant='h6' className='font-semibold mb-2'>
                No Addresses Yet
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mb-4'>
                Get started by adding your first delivery or billing address
              </Typography>
              <Button 
                variant='outlined' 
                startIcon={<i className='tabler-plus' />}
                onClick={() => handleOpenDialog()}
              >
                Add Your First Address
              </Button>
            </div>
          ) : (
            <Grid container spacing={5}>
              {addresses.map((address) => (
                <Grid item xs={12} md={6} key={address.id}>
                  <Card 
                    variant='outlined' 
                    className='h-full hover:shadow-md transition-shadow duration-200'
                    sx={{ 
                      borderRadius: 2,
                      borderColor: 'divider'
                    }}
                  >
                    <CardContent className='p-6'>
                      {/* Header with Name and Actions */}
                      <div className='flex justify-between items-start mb-5'>
                        <div className='flex-1 min-w-0'>
                          {address.alias && (
                            <div className='flex items-center gap-2 mb-2'>
                              <i className='tabler-tag text-primary text-lg' />
                              <Typography variant='body1' className='font-semibold text-primary'>
                                {address.alias}
                              </Typography>
                            </div>
                          )}
                          <Typography variant='h6' className='font-semibold mb-1 truncate'>
                            {addressType === 'customer' 
                              ? `${address.name} ${address.last_name}`
                              : address.company_name
                            }
                          </Typography>
                          {addressType === 'customer' && address.company && (
                            <Typography variant='body2' color='text.secondary'>
                              {address.company}
                            </Typography>
                          )}
                        </div>
                        <div className='flex gap-1 ml-3 flex-shrink-0'>
                          <IconButton 
                            size='small' 
                            onClick={() => handleOpenDialog(address)}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': { 
                                backgroundColor: 'primary.lighter' 
                              }
                            }}
                          >
                            <i className='tabler-edit text-xl' />
                          </IconButton>
                          <IconButton 
                            size='small' 
                            onClick={() => handleDeleteAddress(address.id)}
                            sx={{ 
                              color: 'error.main',
                              '&:hover': { 
                                backgroundColor: 'error.lighter' 
                              }
                            }}
                          >
                            <i className='tabler-trash text-xl' />
                          </IconButton>
                        </div>
                      </div>

                      <Divider sx={{ mb: 3 }} />

                      {/* Address Details */}
                      <div className='space-y-3'>
                        <div className='flex gap-3'>
                          <div className='flex-shrink-0 w-5 flex justify-center'>
                            <i className='tabler-map-pin text-textSecondary text-xl' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <Typography variant='body2' color='text.secondary' className='text-xs mb-0.5'>
                              Address
                            </Typography>
                            <Typography variant='body2' className='font-medium'>
                              {address.address_house_number}
                            </Typography>
                          </div>
                        </div>

                        <div className='flex gap-3'>
                          <div className='flex-shrink-0 w-5 flex justify-center'>
                            <i className='tabler-building text-textSecondary text-xl' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <Typography variant='body2' color='text.secondary' className='text-xs mb-0.5'>
                              City & Postal Code
                            </Typography>
                            <Typography variant='body2' className='font-medium'>
                              {address.city}, {address.postal_code}
                            </Typography>
                          </div>
                        </div>

                        <div className='flex gap-3'>
                          <div className='flex-shrink-0 w-5 flex justify-center'>
                            <i className='tabler-flag text-textSecondary text-xl' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <Typography variant='body2' color='text.secondary' className='text-xs mb-0.5'>
                              Country
                            </Typography>
                            <Typography variant='body2' className='font-medium'>
                              {address.country}
                            </Typography>
                          </div>
                        </div>

                        <div className='flex gap-3'>
                          <div className='flex-shrink-0 w-5 flex justify-center'>
                            <i className='tabler-phone text-textSecondary text-xl' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <Typography variant='body2' color='text.secondary' className='text-xs mb-0.5'>
                              Phone
                            </Typography>
                            <Typography variant='body2' className='font-medium'>
                              {address.phone}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Address Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <div className='px-6 pt-6 pb-4'>
          <Typography variant='h5' className='font-semibold mb-1'>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {editingAddress ? 'Update the address details below' : 'Fill in the address information below'}
          </Typography>
        </div>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity='error' onClose={() => setError('')} className='mb-4' sx={{ borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Alias (Optional)'
                placeholder='e.g., Home, Office, Main Branch'
                value={addressForm.alias}
                onChange={e => setAddressForm({ ...addressForm, alias: e.target.value })}
                slotProps={{
                  input: {
                    startAdornment: <i className='tabler-tag text-textSecondary me-2' />
                  }
                }}
              />
            </Grid>

            {addressType === 'customer' ? (
              <>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label='First Name'
                    placeholder='John'
                    value={addressForm.name}
                    onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                    required
                    slotProps={{
                      input: {
                        startAdornment: <i className='tabler-user text-textSecondary me-2' />
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label='Last Name'
                    placeholder='Doe'
                    value={addressForm.last_name}
                    onChange={e => setAddressForm({ ...addressForm, last_name: e.target.value })}
                    required
                    slotProps={{
                      input: {
                        startAdornment: <i className='tabler-user text-textSecondary me-2' />
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    label='Company (Optional)'
                    placeholder='Company name'
                    value={addressForm.company}
                    onChange={e => setAddressForm({ ...addressForm, company: e.target.value })}
                    slotProps={{
                      input: {
                        startAdornment: <i className='tabler-building text-textSecondary me-2' />
                      }
                    }}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Company Name'
                  placeholder='Acme Corporation'
                  value={addressForm.company_name}
                  onChange={e => setAddressForm({ ...addressForm, company_name: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      startAdornment: <i className='tabler-building text-textSecondary me-2' />
                    }
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Address & House Number'
                placeholder='123 Main Street'
                value={addressForm.address_house_number}
                onChange={e => setAddressForm({ ...addressForm, address_house_number: e.target.value })}
                required
                slotProps={{
                  input: {
                    startAdornment: <i className='tabler-map-pin text-textSecondary me-2' />
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='House Number'
                placeholder='123'
                value={addressForm.house_number}
                onChange={e => setAddressForm({ ...addressForm, house_number: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='City'
                placeholder='New York'
                value={addressForm.city}
                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                required
                slotProps={{
                  input: {
                    startAdornment: <i className='tabler-building text-textSecondary me-2' />
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Postal Code'
                placeholder='12345'
                value={addressForm.postal_code}
                onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                required
                slotProps={{
                  input: {
                    startAdornment: <i className='tabler-mailbox text-textSecondary me-2' />
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Country'
                placeholder='United States'
                value={addressForm.country}
                onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                required
                slotProps={{
                  input: {
                    startAdornment: <i className='tabler-flag text-textSecondary me-2' />
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Phone'
                placeholder='+1 234 567 8900'
                value={addressForm.phone}
                onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                required
                slotProps={{
                  input: {
                    startAdornment: <i className='tabler-phone text-textSecondary me-2' />
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
          <Button 
            variant='tonal' 
            color='secondary' 
            onClick={handleCloseDialog}
            disabled={loading}
            startIcon={<i className='tabler-x' />}
            sx={{ minWidth: '100px' }}
          >
            Cancel
          </Button>
          <Button 
            variant='contained' 
            onClick={handleSaveAddress}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <i className='tabler-device-floppy' />}
            sx={{ minWidth: '140px' }}
          >
            {loading ? 'Saving...' : (editingAddress ? 'Update' : 'Save Address')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddressManagement
