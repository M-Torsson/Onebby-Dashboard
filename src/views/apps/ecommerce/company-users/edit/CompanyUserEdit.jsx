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

const CompanyUserEdit = ({ companyId }) => {
  const router = useRouter()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)

  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    vat_number: '',
    tax_code: '',
    pec: '',
    approval_status: 'pending'
  })

  useEffect(() => {
    if (companyId) {
      fetchCompanyData()
    }
  }, [companyId])

  const fetchCompanyData = async () => {
    try {
      setFetchingData(true)
      setError('')

      const response = await fetch(`https://onebby-api.onrender.com/api/users/companies/${companyId}`, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
        }
      })

      if (!response.ok) {
        setError(`Failed to load company data (${response.status})`)
        return
      }

      const data = await response.json()

      setFormData({
        company_name: data.company_name || '',
        email: data.email || '',
        vat_number: data.vat_number || '',
        tax_code: data.tax_code || '',
        pec: data.pec || '',
        approval_status: data.approval_status || 'pending'
      })
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error fetching company:', err)
    } finally {
      setFetchingData(false)
    }
  }

  const handleSaveCompany = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      if (!formData.company_name || !formData.email || !formData.vat_number) {
        setError('Company Name, Email, and VAT Number are required')
        setLoading(false)
        return
      }

      const response = await fetch(`https://onebby-api.onrender.com/api/users/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || `Failed to update company (${response.status})`)
        setLoading(false)
        return
      }

      setSuccess('Company updated successfully!')
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error updating company:', err)
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
              Edit Company #{companyId} {formData.company_name ? `- ${formData.company_name}` : ''}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Update company information and approval status
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

      {/* Company Information Card */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Company Information' 
            subheader='Basic company details'
          />
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Company Name'
                  placeholder='Acme Corporation'
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  error={!formData.company_name}
                  helperText={!formData.company_name ? 'Company name is required' : ' '}
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ style: { minHeight: '20px' } }}
                  slotProps={{
                    input: {
                      startAdornment: <i className='tabler-building text-textSecondary me-2' />
                    }
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Email Address'
                  type='email'
                  placeholder='company@example.com'
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  error={!formData.email}
                  helperText={!formData.email ? 'Email is required' : 'Primary contact email'}
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

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='PEC (Certified Email)'
                  type='email'
                  placeholder='pec@company.it'
                  value={formData.pec}
                  onChange={e => setFormData({ ...formData, pec: e.target.value })}
                  helperText='Certified email for official communications'
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ style: { minHeight: '20px' } }}
                  slotProps={{
                    input: {
                      startAdornment: <i className='tabler-mail-check text-textSecondary me-2' />
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='VAT Number'
                  placeholder='IT12345678901'
                  value={formData.vat_number}
                  onChange={e => setFormData({ ...formData, vat_number: e.target.value })}
                  error={!formData.vat_number}
                  helperText={!formData.vat_number ? 'VAT number is required' : 'European VAT identification number'}
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ style: { minHeight: '20px' } }}
                  slotProps={{
                    input: {
                      startAdornment: <i className='tabler-receipt-tax text-textSecondary me-2' />
                    }
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Tax Code'
                  placeholder='ABC123XYZ'
                  value={formData.tax_code}
                  onChange={e => setFormData({ ...formData, tax_code: e.target.value })}
                  helperText='Company fiscal/tax identification code'
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ style: { minHeight: '20px' } }}
                  slotProps={{
                    input: {
                      startAdornment: <i className='tabler-certificate text-textSecondary me-2' />
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider className='my-2' />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='Approval Status'
                  value={formData.approval_status}
                  onChange={e => setFormData({ ...formData, approval_status: e.target.value })}
                  helperText='Current approval state of the company'
                  InputLabelProps={{ shrink: true }}
                  FormHelperTextProps={{ style: { minHeight: '20px' } }}
                >
                  <MenuItem value='approved'>
                    <div className='flex items-center gap-2 w-full'>
                      <i className='tabler-circle-check text-success' />
                      <span>Approved</span>
                    </div>
                  </MenuItem>
                  <MenuItem value='pending'>
                    <div className='flex items-center gap-2 w-full'>
                      <i className='tabler-clock text-warning' />
                      <span>Pending</span>
                    </div>
                  </MenuItem>
                  <MenuItem value='rejected'>
                    <div className='flex items-center gap-2 w-full'>
                      <i className='tabler-x text-error' />
                      <span>Rejected</span>
                    </div>
                  </MenuItem>
                </CustomTextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Action Buttons */}
      <Grid item xs={12}>
        <div className='flex gap-4 justify-end'>
          <Button variant='contained' onClick={handleSaveCompany} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <i className='tabler-device-floppy' />}>
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

export default CompanyUserEdit
