'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'

const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

const AddCategoryDrawer = props => {
  const { open, handleClose, categoryData, parentCategory, onSuccess } = props

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    icon: '',
    sort_order: 1,
    is_active: true,
    parent_id: null
  })
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (open) {
      fetchParentCategories()
      if (categoryData) {
        setFormData({
          name: categoryData.name || '',
          slug: categoryData.slug || '',
          image: categoryData.image || '',
          icon: categoryData.icon || '',
          sort_order: categoryData.sort_order || 1,
          is_active: categoryData.is_active ?? true,
          parent_id: categoryData.parent_id || null
        })
      } else if (parentCategory) {
        // When adding subcategory, set parent_id automatically
        setFormData({
          name: '',
          slug: '',
          image: '',
          icon: '',
          sort_order: 1,
          is_active: true,
          parent_id: parentCategory.id
        })
        setError('')
        setSuccess('')
      } else {
        setFormData({
          name: '',
          slug: '',
          image: '',
          icon: '',
          sort_order: 1,
          is_active: true,
          parent_id: null
        })
        setError('')
        setSuccess('')
      }
    }
  }, [open, categoryData, parentCategory])

  const fetchParentCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/categories?lang=en`, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        setParents(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch parent categories:', err)
    }
  }

  const uploadImageToCloudinary = async (file, folder) => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', folder)

      const response = await fetch(`${API_BASE_URL}/api/admin/upload/image`, {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY },
        body: formDataUpload
      })

      if (response.ok) {
        const result = await response.json()
        return result.url
      } else {
        const errorText = await response.text()
        console.error('Upload error:', response.status, errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }
    } catch (err) {
      console.error('Upload exception:', err)
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
    } finally {
      if (type === 'image') {
        setUploadingImage(false)
      } else {
        setUploadingIcon(false)
      }
    }
  }

  const handleFormSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      if (!formData.name || !formData.slug) {
        setError('Name and Slug are required')
        setLoading(false)
        return
      }

      const url = categoryData
        ? `${API_BASE_URL}/api/admin/categories/${categoryData.id}`
        : `${API_BASE_URL}/api/admin/categories`
      const method = categoryData ? 'PUT' : 'POST'

      let bodyData

      if (categoryData) {
        // For edit mode
        bodyData = {
          id: categoryData.id,
          name: formData.name,
          slug: formData.slug,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
          parent_id: formData.parent_id === '' || formData.parent_id === 'null' ? null : formData.parent_id,
          created_at: categoryData.created_at || null,
          updated_at: categoryData.updated_at || null
        }

        if (formData.image) {
          bodyData.image = formData.image
        } else {
          bodyData.image = categoryData.image || null
        }

        if (formData.icon) {
          bodyData.icon = formData.icon
        } else {
          bodyData.icon = categoryData.icon || null
        }
      } else {
        // For create mode
        bodyData = {
          name: formData.name,
          slug: formData.slug,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
          parent_id: formData.parent_id === '' || formData.parent_id === 'null' ? null : formData.parent_id
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
        setSuccess(categoryData ? 'Category updated successfully!' : 'Category created successfully!')
        onSuccess()
        setTimeout(() => {
          handleReset()
        }, 500)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || errorData.message || 'Failed to save category')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      slug: '',
      image: '',
      icon: '',
      sort_order: 1,
      is_active: true,
      parent_id: null
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
      <div className='flex items-center justify-between pli-6 plb-5'>
        <Typography variant='h5'>
          {categoryData
            ? 'Edit Category'
            : parentCategory
              ? `Add Subcategory to ${parentCategory.name}`
              : 'Add Category'}
        </Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' onClose={() => setSuccess('')} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form className='flex flex-col gap-5'>
          <CustomTextField
            label='Category Name'
            placeholder='Smart Phone'
            fullWidth
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <CustomTextField
            label='Slug'
            placeholder='smart-phone'
            fullWidth
            value={formData.slug}
            onChange={e => setFormData({ ...formData, slug: e.target.value })}
            required
          />

          <FormControl fullWidth>
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={formData.parent_id || ''}
              label='Parent Category'
              onChange={e => setFormData({ ...formData, parent_id: e.target.value === '' ? null : e.target.value })}
              disabled={!!parentCategory}
            >
              <MenuItem value=''>None (Main Category)</MenuItem>
              {parents.map(parent => (
                <MenuItem key={parent.id} value={parent.id}>
                  {parent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CustomTextField
            label='Sort Order'
            type='number'
            fullWidth
            value={formData.sort_order}
            onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
          />

          <div>
            <Typography variant='body2' className='mbe-2'>
              Category Image (Optional)
            </Typography>
            <Button
              variant='outlined'
              component='label'
              fullWidth
              disabled={uploadingImage}
              startIcon={uploadingImage ? <CircularProgress size={20} /> : <i className='tabler-upload' />}
            >
              {formData.image ? 'Change Image' : 'Upload Image'}
              <input type='file' hidden accept='image/*' onChange={e => handleImageChange(e, 'image')} />
            </Button>
            {formData.image && (
              <Box mt={2} textAlign='center'>
                <img src={formData.image} alt='Category' style={{ maxWidth: '100%', maxHeight: 150 }} />
              </Box>
            )}
          </div>

          <div>
            <Typography variant='body2' className='mbe-2'>
              Category Icon (Optional)
            </Typography>
            <Button
              variant='outlined'
              component='label'
              fullWidth
              disabled={uploadingIcon}
              startIcon={uploadingIcon ? <CircularProgress size={20} /> : <i className='tabler-upload' />}
            >
              {formData.icon ? 'Change Icon' : 'Upload Icon'}
              <input type='file' hidden accept='image/*' onChange={e => handleImageChange(e, 'icon')} />
            </Button>
            {formData.icon && (
              <Box mt={2} textAlign='center'>
                <img src={formData.icon} alt='Icon' style={{ maxWidth: '100%', maxHeight: 100 }} />
              </Box>
            )}
          </div>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label='Active Status'
          />

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='button' onClick={handleFormSubmit} disabled={loading} fullWidth>
              {loading ? 'Saving...' : categoryData ? 'Update' : 'Submit'}
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={handleReset} fullWidth>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddCategoryDrawer
