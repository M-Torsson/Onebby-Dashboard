'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const API_BASE_URL = 'https://onebby-api.onrender.com/api'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

const BrandsAdd = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    is_active: true,
    sort_order: 1
  })
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch brand data if editing
  useEffect(() => {
    if (editId) {
      fetchBrandData()
    }
  }, [editId])

  const fetchBrandData = async () => {
    try {
      setFetchingData(true)
      const response = await fetch(`${API_BASE_URL}/admin/brands/${editId}`, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name,
          slug: data.slug,
          image: data.image,
          is_active: data.is_active,
          sort_order: data.sort_order
        })
        setImagePreview(data.image)
      } else {
        setError('Failed to load brand data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setFetchingData(false)
    }
  }

  // Upload Image to Cloudinary via API
  const uploadImageToCloudinary = async file => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'brands')

      const response = await fetch(`${API_BASE_URL}/admin/upload/image`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY
          // لا تضع Content-Type، FormData يضبطه تلقائياً
        },
        body: formDataUpload
      })

      if (response.ok) {
        const result = await response.json()
        return result.url
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Upload failed: ${response.status}`)
      }
    } catch (err) {
      throw err
    }
  }

  // Handle Image Selection and Upload
  const handleImageChange = async e => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG, WEBP, or SVG)')
        return
      }

      // Check file size (max 5MB for Cloudinary)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB')
        return
      }

      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Upload to Cloudinary
      try {
        setUploadingImage(true)
        setError('')
        const imageUrl = await uploadImageToCloudinary(file)
        console.log('Image uploaded to Cloudinary:', imageUrl) // Debug
        setFormData({ ...formData, image: imageUrl })
        setSuccess('Image uploaded successfully!')
        setTimeout(() => setSuccess(''), 2000)
      } catch (err) {
        console.error('Cloudinary upload failed:', err) // Debug
        setError(`Failed to upload image: ${err.message}`)
        setImagePreview('')
      } finally {
        setUploadingImage(false)
      }
    }
  }

  // Handle Save Brand
  const handleSaveBrand = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      // Validation
      if (!formData.name || !formData.slug) {
        setError('Name and Slug are required')
        setLoading(false)
        return
      }

      const url = editId ? `${API_BASE_URL}/admin/brands/${editId}` : `${API_BASE_URL}/admin/brands`
      const method = editId ? 'PUT' : 'POST'

      // Prepare body data
      let bodyData

      if (editId) {
        bodyData = {
          id: parseInt(editId),
          name: formData.name,
          slug: formData.slug,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
          created_at: null,
          updated_at: null
        }
        // Only add image if it exists
        if (formData.image) {
          bodyData.image = formData.image
        } else {
          bodyData.image = null
        }
      } else {
        bodyData = {
          name: formData.name,
          slug: formData.slug,
          is_active: formData.is_active,
          sort_order: formData.sort_order
        }
        // Only add image if it exists
        if (formData.image) {
          bodyData.image = formData.image
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        setSuccess(editId ? 'Brand updated successfully!' : 'Brand created successfully!')
        setTimeout(() => {
          router.push('/apps/ecommerce/brands/list')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || `Failed to ${editId ? 'update' : 'create'} brand`)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <Card>
        <div className='flex justify-center items-center' style={{ minHeight: '400px' }}>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid size={{ xs: 12 }}>
        <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
          <div>
            <Typography variant='h4' className='mbe-1'>
              {editId
                ? dictionary.common?.editBrand || 'Edit brand'
                : dictionary.common?.addNewBrand || 'Add a new brand'}
            </Typography>
            <Typography>{dictionary.common?.manageBrandInfo || 'Manage your brand information'}</Typography>
          </div>
          <div className='flex flex-wrap max-sm:flex-col gap-4'>
            <Button variant='tonal' color='secondary' onClick={() => router.push('/apps/ecommerce/brands/list')}>
              {dictionary.common?.discard || 'Discard'}
            </Button>
            <Button variant='tonal' onClick={handleSaveBrand} disabled={loading}>
              {dictionary.common?.saveDraft || 'Save Draft'}
            </Button>
            <Button variant='contained' onClick={handleSaveBrand} disabled={loading}>
              {loading
                ? editId
                  ? dictionary.common?.updating || 'Updating...'
                  : dictionary.common?.publishing || 'Publishing...'
                : editId
                  ? dictionary.common?.updateBrand || 'Update Brand'
                  : dictionary.common?.publishBrand || 'Publish Brand'}
            </Button>
          </div>
        </div>
      </Grid>

      {/* Alerts */}
      {error && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='error' onClose={() => setError('')}>
            {error}
          </Alert>
        </Grid>
      )}
      {success && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='success' onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Grid>
      )}

      {/* Main Content - Left Side */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={6}>
          {/* Brand Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.brandInformation || 'Brand Information'} />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label={dictionary.common?.brandName || 'Brand Name'}
                      placeholder={dictionary.common?.enterBrandName || 'Enter brand name'}
                      value={formData.name}
                      onChange={e => {
                        const name = e.target.value
                        setFormData({
                          ...formData,
                          name,
                          slug: name
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '')
                        })
                      }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label='Slug'
                      placeholder='brand-slug'
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      required
                      helperText={dictionary.common?.slugHelper || 'URL-friendly version of the name'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Brand Image */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.brandImage || 'Brand Image'} />
              <CardContent>
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  gap={2}
                  border='2px dashed'
                  borderColor='divider'
                  borderRadius={1}
                  p={4}
                  position='relative'
                  sx={{ cursor: uploadingImage ? 'not-allowed' : 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => !uploadingImage && document.getElementById('brand-image-input').click()}
                >
                  {imagePreview && !uploadingImage && (
                    <IconButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation()
                        setImagePreview('')
                        setFormData({ ...formData, image: '' })
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                    >
                      <i className='tabler-x' style={{ fontSize: '1.2rem' }} />
                    </IconButton>
                  )}
                  {uploadingImage ? (
                    <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                      <CircularProgress />
                      <Typography variant='body2' color='text.secondary'>
                        {dictionary.common?.uploadingImages || 'Uploading image...'}
                      </Typography>
                    </Box>
                  ) : imagePreview ? (
                    <Avatar src={imagePreview} alt='Brand preview' variant='rounded' sx={{ width: 200, height: 200 }} />
                  ) : (
                    <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                      <i
                        className='tabler-upload'
                        style={{ fontSize: '4rem', color: 'var(--mui-palette-text-secondary)' }}
                      />
                      <Typography variant='h6' color='text.primary'>
                        {dictionary.common?.clickToUploadBrand || 'Click to upload brand image'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {dictionary.common?.uploadBrandFormat || 'Upload image in JPEG, PNG, WEBP or SVG format'}
                      </Typography>
                    </Box>
                  )}
                  <input
                    id='brand-image-input'
                    type='file'
                    accept='image/jpeg,image/png,image/webp,image/svg+xml'
                    hidden
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Right Side */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Grid container spacing={6}>
          {/* Brand Settings */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.settings || 'Settings'} />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label={dictionary.common?.sortOrder || 'Sort Order'}
                      type='number'
                      placeholder='1'
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Divider />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                      }
                      label={dictionary.common?.activeStatus || 'Active Status'}
                    />
                    <Typography variant='body2' color='text.secondary' className='mbs-1'>
                      {dictionary.common?.enableBrandVisible || 'Enable to make this brand visible to customers'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default BrandsAdd
