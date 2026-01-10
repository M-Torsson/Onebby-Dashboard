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
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const API_BASE_URL = process.env.NEXT_PUBLIC_ONEBBY_API_BASE_URL || 'https://onebby-api.onrender.com/api'
const API_KEY = process.env.NEXT_PUBLIC_ONEBBY_API_KEY

const CategoryAdd = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    icon: '',
    parent_id: null,
    is_active: true,
    sort_order: 1
  })
  const [imagePreview, setImagePreview] = useState('')
  const [iconPreview, setIconPreview] = useState('')
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)

  useEffect(() => {
    fetchParentCategories()
    if (editId) {
      fetchCategoryData()
    }
  }, [editId])

  const fetchParentCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        setParents(result.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch parent categories:', err)
    }
  }

  const fetchCategoryData = async () => {
    try {
      setFetchingData(true)

      // Fetch specific category by ID using new endpoint
      const response = await fetch(`${API_BASE_URL}/admin/categories/${editId}`, {
        headers: { 'X-API-KEY': API_KEY }
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('Category not found')
        } else {
          setError(`Failed to load category data (${response.status})`)
        }
        setFetchingData(false)
        return
      }

      const result = await response.json()
      const data = result.data || result

      // Set the form data
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        image: data.image || '',
        icon: data.icon || '',
        parent_id: data.parent_id || null,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order || 1
      })
      setImagePreview(data.image || '')
      setIconPreview(data.icon || '')
    } catch (err) {
      console.error('Error fetching category:', err)
      setError('Network error. Please try again.')
    } finally {
      setFetchingData(false)
    }
  }

  const uploadImageToCloudinary = async (file, folder) => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', folder)

      const response = await fetch(`${API_BASE_URL}/admin/upload/image`, {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY },
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

  const handleImageChange = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, WEBP, SVG)')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'image') {
        setImagePreview(reader.result)
      } else {
        setIconPreview(reader.result)
      }
    }
    reader.readAsDataURL(file)

    // Upload
    try {
      if (type === 'image') {
        setUploadingImage(true)
      } else {
        setUploadingIcon(true)
      }
      setError('')

      const imageUrl = await uploadImageToCloudinary(file, 'categories')
      setFormData(prev => ({ ...prev, [type]: imageUrl }))
      setSuccess(`${type === 'image' ? 'Image' : 'Icon'} uploaded successfully!`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(`Failed to upload ${type}: ${err.message}`)
      if (type === 'image') {
        setImagePreview('')
      } else {
        setIconPreview('')
      }
    } finally {
      if (type === 'image') {
        setUploadingImage(false)
      } else {
        setUploadingIcon(false)
      }
    }
  }

  const handleSaveCategory = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      if (!formData.name || !formData.slug) {
        setError('Name and Slug are required')
        setLoading(false)
        return
      }

      const url = editId ? `${API_BASE_URL}/admin/categories/${editId}` : `${API_BASE_URL}/admin/categories`
      const method = editId ? 'PUT' : 'POST'

      let bodyData

      if (editId) {
        bodyData = {
          id: parseInt(editId),
          name: formData.name,
          slug: formData.slug,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
          parent_id: formData.parent_id === '' ? null : formData.parent_id,
          created_at: null,
          updated_at: null
        }

        bodyData.image = formData.image || null
        bodyData.icon = formData.icon || null
      } else {
        bodyData = {
          name: formData.name,
          slug: formData.slug,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
          parent_id: formData.parent_id === '' ? null : formData.parent_id
        }

        if (formData.image) {
          bodyData.image = formData.image
        }
        if (formData.icon) {
          bodyData.icon = formData.icon
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
        setSuccess(editId ? 'Category updated successfully!' : 'Category created successfully!')
        setTimeout(() => {
          router.push('/apps/ecommerce/category/list')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || `Failed to ${editId ? 'update' : 'create'} category`)
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
                ? dictionary.common?.editCategory || 'Edit category'
                : dictionary.common?.addNewCategory || 'Add a new category'}
            </Typography>
            <Typography>{dictionary.common?.manageCategoryInfo || 'Manage your category information'}</Typography>
          </div>
          <div className='flex flex-wrap max-sm:flex-col gap-4'>
            <Button variant='tonal' color='secondary' onClick={() => router.push('/apps/ecommerce/category/list')}>
              {dictionary.common?.discard || 'Discard'}
            </Button>
            <Button variant='contained' onClick={handleSaveCategory} disabled={loading}>
              {loading
                ? editId
                  ? dictionary.common?.updating || 'Updating...'
                  : dictionary.common?.publishing || 'Publishing...'
                : editId
                  ? dictionary.common?.updateCategory || 'Update Category'
                  : dictionary.common?.publishCategory || 'Publish Category'}
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
          {/* Category Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.categoryInformation || 'Category Information'} />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label={dictionary.common?.categoryName || 'Category Name'}
                      placeholder={dictionary.common?.enterCategoryName || 'Enter category name'}
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
                      placeholder='category-slug'
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      required
                      helperText={dictionary.common?.slugHelper || 'URL-friendly version of the name'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      select
                      fullWidth
                      label={dictionary.common?.parentCategory || 'Parent Category'}
                      value={formData.parent_id || ''}
                      onChange={e => setFormData({ ...formData, parent_id: e.target.value || null })}
                      helperText={dictionary.common?.leaveEmptyMainCategory || 'Leave empty for main category'}
                    >
                      <MenuItem value=''>{dictionary.common?.noneMainCategory || 'None (Main Category)'}</MenuItem>
                      {parents.map(parent => (
                        <MenuItem key={parent.id} value={parent.id}>
                          {parent.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Image */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.categoryImage || 'Category Image'} />
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
                  onClick={() => !uploadingImage && document.getElementById('category-image-input').click()}
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
                    <Avatar
                      src={imagePreview}
                      alt='Category preview'
                      variant='rounded'
                      sx={{ width: 200, height: 200 }}
                    />
                  ) : (
                    <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                      <i
                        className='tabler-upload'
                        style={{ fontSize: '4rem', color: 'var(--mui-palette-text-secondary)' }}
                      />
                      <Typography variant='h6' color='text.primary'>
                        {dictionary.common?.clickToUploadCategoryImage || 'Click to upload category image'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {dictionary.common?.uploadBrandFormat || 'Upload image in JPEG, PNG, WEBP or SVG format'}
                      </Typography>
                    </Box>
                  )}
                  <input
                    id='category-image-input'
                    type='file'
                    accept='image/jpeg,image/png,image/webp,image/svg+xml'
                    hidden
                    onChange={e => handleImageChange(e, 'image')}
                    disabled={uploadingImage}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Icon */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.categoryIconOptional || 'Category Icon (Optional)'} />
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
                  sx={{ cursor: uploadingIcon ? 'not-allowed' : 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => !uploadingIcon && document.getElementById('category-icon-input').click()}
                >
                  {iconPreview && !uploadingIcon && (
                    <IconButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation()
                        setIconPreview('')
                        setFormData({ ...formData, icon: '' })
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
                  {uploadingIcon ? (
                    <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                      <CircularProgress />
                      <Typography variant='body2' color='text.secondary'>
                        {dictionary.common?.uploadingIcon || 'Uploading icon...'}
                      </Typography>
                    </Box>
                  ) : iconPreview ? (
                    <Avatar src={iconPreview} alt='Icon preview' variant='rounded' sx={{ width: 100, height: 100 }} />
                  ) : (
                    <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                      <i
                        className='tabler-upload'
                        style={{ fontSize: '3rem', color: 'var(--mui-palette-text-secondary)' }}
                      />
                      <Typography variant='h6' color='text.primary'>
                        {dictionary.common?.clickToUploadCategoryIcon || 'Click to upload category icon'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {dictionary.common?.uploadBrandFormat || 'Upload icon in JPEG, PNG, WEBP or SVG format'}
                      </Typography>
                    </Box>
                  )}
                  <input
                    id='category-icon-input'
                    type='file'
                    accept='image/jpeg,image/png,image/webp,image/svg+xml'
                    hidden
                    onChange={e => handleImageChange(e, 'icon')}
                    disabled={uploadingIcon}
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
          {/* Category Settings */}
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
                      {dictionary.common?.enableCategoryVisible || 'Enable to make this category visible to customers'}
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

export default CategoryAdd
