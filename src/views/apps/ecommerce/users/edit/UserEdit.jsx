'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import CustomTextField from '@core/components/mui/TextField'

const UserEdit = ({ userId }) => {
  const router = useRouter()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    email: ''
  })

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const fetchUserData = async () => {
    try {
      setFetchingData(true)
      setError('')

      const response = await fetch(`https://onebby-api.onrender.com/api/users/customers/${userId}`, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
        }
      })

      if (!response.ok) {
        setError(`Failed to load user data (${response.status})`)
        return
      }

      const data = await response.json()

      setFormData({
        title: data.title || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || ''
      })
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error fetching user:', err)
    } finally {
      setFetchingData(false)
    }
  }

  const handleSaveUser = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      if (!formData.first_name || !formData.last_name || !formData.email) {
        setError('First Name, Last Name, and Email are required')
        setLoading(false)
        return
      }

      const response = await fetch(`https://onebby-api.onrender.com/api/users/customers/${userId}`, {
        method: 'PUT',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || `Failed to update user (${response.status})`)
        setLoading(false)
        return
      }

      setSuccess('User updated successfully!')
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error updating user:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (fetchingData) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center' style={{ minHeight: '400px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Header Card */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h5' className='font-bold'>
              Edit User #{userId} {formData.first_name && formData.last_name ? `- ${formData.first_name} ${formData.last_name}` : ''}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Update user information and account settings
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Alerts */}
      {error && (
        <Grid item xs={12}>
          <Alert severity='error' onClose={() => setError('')}>
            {error}
          </Alert>
        </Grid>
      )}
      {success && (
        <Grid item xs={12}>
          <Alert severity='success' onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Grid>
      )}

      {/* Basic Information Card */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Basic Information' 
            subheader='Personal details of the user'
          />
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={4}>
                <CustomTextField
                  select
                  fullWidth
                  label='Title'
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value='Mr'>Mr</MenuItem>
                  <MenuItem value='Mrs'>Mrs</MenuItem>
                  <MenuItem value='Ms'>Ms</MenuItem>
                  <MenuItem value='Dr'>Dr</MenuItem>
                </CustomTextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label='First Name'
                  placeholder='John'
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  error={!formData.first_name}
                  helperText={!formData.first_name ? 'First name is required' : ' '}
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ style: { minHeight: '20px' } }}
                  slotProps={{
                    input: {
                      startAdornment: <i className='tabler-user text-textSecondary me-2' />
                    }
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <CustomTextField
                  fullWidth
                  label='Last Name'
                  placeholder='Doe'
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  error={!formData.last_name}
                  helperText={!formData.last_name ? 'Last name is required' : ' '}
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ style: { minHeight: '20px' } }}
                  slotProps={{
                    input: {
                      startAdornment: <i className='tabler-user text-textSecondary me-2' />
                    }
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Email Address'
                  type='email'
                  placeholder='john.doe@example.com'
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  error={!formData.email}
                  helperText={!formData.email ? 'Email is required' : 'User will receive notifications at this email'}
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ style: { minHeight: '20px' } }}
                  slotProps={{
                    input: {
                      startAdornment: <i className='tabler-mail text-textSecondary me-2' />
                    }
                  }}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Action Buttons */}
      <Grid item xs={12}>
        <div className='flex gap-4 justify-end'>
          <Button variant='contained' onClick={handleSaveUser} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <i className='tabler-device-floppy' />}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleCancel} disabled={loading} startIcon={<i className='tabler-x' />}>
            Cancel
          </Button>
        </div>
      </Grid>
    </Grid>
  )
}

export default UserEdit
