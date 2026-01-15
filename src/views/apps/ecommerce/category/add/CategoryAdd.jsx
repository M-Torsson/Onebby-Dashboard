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
import Chip from '@mui/material/Chip'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import { API_BASE_URL, API_KEY } from '@/configs/apiConfig'

const CATEGORIES_BASE_URL = `${API_BASE_URL}/api/v1/categories`

const CategoryAdd = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const parentIdParam = searchParams.get('parent')

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
  const [discounts, setDiscounts] = useState([])
  const [loadingDiscounts, setLoadingDiscounts] = useState(false)

  useEffect(() => {
    fetchParentCategories()

    if (editId) {
      fetchCategoryData()
    }
  }, [editId, parentIdParam])

  const fetchParentCategories = async () => {
    try {
      // جلب كل الفئات (134 فئة) - لا يحتاج X-API-Key
      const response = await fetch(`${CATEGORIES_BASE_URL}`)

      if (response.ok) {
        const result = await response.json()
        const allCategories = result.data || result || []

        // فلترة الفئات: نعرض فقط Parent و Child (نستثني Grandson من القائمة)
        // Grandson لا يمكن أن يكون parent لفئة جديدة
        const selectableCategories = Array.isArray(allCategories)
          ? allCategories.filter(cat => {
              // نتحقق من level: إذا كان parent_id موجود، نحتاج نتأكد أنه ليس grandson
              if (!cat.parent_id) return true // Parent category

              // إذا له parent، نتحقق هل parent_id هذا هو parent رئيسي
              const parentOfThis = allCategories.find(p => p.id === cat.parent_id)
              return parentOfThis && !parentOfThis.parent_id // Child category (parent له ليس له parent)
            })
          : []

        setParents(selectableCategories)

        if (parentIdParam && !editId) {
          const requestedParentId = Number(parentIdParam)
          const isValidParent = selectableCategories.some(p => Number(p.id) === requestedParentId)

          if (Number.isFinite(requestedParentId) && isValidParent) {
            setFormData(prev => ({ ...prev, parent_id: requestedParentId }))
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch parent categories:', err)
    }
  }

  const fetchCategoryData = async () => {
    try {
      setFetchingData(true)
      setError('') // مسح أي أخطاء سابقة

      let category = null

      // محاولة 1: جلب الفئة مباشرة من API
      try {
        const directResponse = await fetch(`${CATEGORIES_BASE_URL}/${editId}`)

        if (directResponse.ok) {
          const directResult = await directResponse.json()
          category = directResult.data || directResult
          console.log('✅ Category loaded from direct API:', category)
        }
      } catch (err) {
        console.warn('Direct fetch failed, trying list approach:', err)
      }

      // محاولة 2: إذا فشلت المحاولة الأولى، نجلب كل الفئات ونبحث
      if (!category) {
        console.log('🔍 Searching in all categories for ID:', editId)
        // إضافة limit=500 لجلب كل الـ 134 فئة
        const listResponse = await fetch(`${CATEGORIES_BASE_URL}?limit=500`)

        if (!listResponse.ok) {
          setError(`Failed to load categories (${listResponse.status})`)
          setFetchingData(false)
          return
        }

        const listResult = await listResponse.json()
        const listData = listResult.data || listResult
        const asArray = Array.isArray(listData) ? listData : []

        console.log('📋 Total categories loaded:', asArray.length)
        category = asArray.find(c => Number(c.id) === Number(editId))

        if (category) {
          console.log('✅ Category found in list:', category.name)
        } else {
          console.error(
            '❌ Category not found. Searched ID:',
            editId,
            'Available IDs:',
            asArray.map(c => c.id).slice(0, 20)
          )
        }
      }

      if (!category) {
        setError(`Category not found (ID: ${editId})`)
        setFetchingData(false)
        return
      }

      const data = category

      // Set the form data
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        image: data.image || '',
        icon: data.icon || '',
        parent_id: data.parent_id ?? null,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order || 1
      })
      setImagePreview(data.image || '')
      setIconPreview(data.icon || '')

      // Fetch discounts for this category
      if (editId) {
        fetchCategoryDiscounts(editId)
      }
    } catch (err) {
      console.error('Error fetching category:', err)
      setError('Network error. Please try again.')
    } finally {
      setFetchingData(false)
    }
  }

  const fetchCategoryDiscounts = async categoryId => {
    try {
      setLoadingDiscounts(true)
      const response = await fetch(`${API_BASE_URL}/api/v1/discounts`, {
        headers: { 'X-API-KEY': API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        const allDiscounts = result.data || result || []
        // Filter discounts that target this category
        const categoryDiscounts = allDiscounts.filter(
          discount =>
            discount.target_type === 'category' &&
            discount.target_ids &&
            discount.target_ids.includes(Number(categoryId))
        )
        setDiscounts(categoryDiscounts)
      }
    } catch (err) {
      console.error('Error fetching discounts:', err)
    } finally {
      setLoadingDiscounts(false)
    }
  }

  const uploadImageToCloudinary = async (file, folder) => {
    try {
      // Use local API endpoint for direct upload
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', folder)

      console.log('📤 Uploading to:', `/api/admin/upload/image`)
      console.log('📁 Folder:', folder)

      const uploadResponse = await fetch(`/api/admin/upload/image`, {
        method: 'POST',
        body: formDataUpload
      })

      console.log('📡 Response status:', uploadResponse.status)

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        console.error('❌ Upload error:', errorData)
        throw new Error(errorData.detail || 'Failed to upload image')
      }

      const result = await uploadResponse.json()
      console.log('✅ Upload successful:', result)

      return result.url
    } catch (err) {
      console.error('💥 Upload exception:', err)
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

      const url = editId ? `${CATEGORIES_BASE_URL}/${editId}` : `${CATEGORIES_BASE_URL}`
      const method = editId ? 'PUT' : 'POST'

      const normalizedParentId =
        formData.parent_id === '' || formData.parent_id === null ? null : Number(formData.parent_id)

      let bodyData

      bodyData = {
        name: formData.name,
        slug: formData.slug,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
        parent_id: Number.isFinite(normalizedParentId) ? normalizedParentId : null
      }

      if (formData.image) bodyData.image = formData.image
      if (formData.icon) bodyData.icon = formData.icon

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
                      onChange={e => {
                        const value = e.target.value

                        setFormData({ ...formData, parent_id: value ? Number(value) : null })
                      }}
                      helperText={dictionary.common?.leaveEmptyMainCategory || 'Leave empty for main category'}
                    >
                      <MenuItem value=''>{dictionary.common?.noneMainCategory || 'None (Main Category)'}</MenuItem>
                      {parents.map(parent => {
                        // عرض الفئات مع تنسيق حسب المستوى
                        const isChild = parent.parent_id !== null && parent.parent_id !== undefined
                        const prefix = isChild ? '└─ ' : ''

                        return (
                          <MenuItem key={parent.id} value={parent.id}>
                            {prefix}
                            {parent.name}
                          </MenuItem>
                        )
                      })}
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

          {/* Active Discounts */}
          {editId && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title={dictionary.common?.activeDiscounts || 'Active Discounts'} />
                <CardContent>
                  {loadingDiscounts ? (
                    <div className='flex justify-center items-center' style={{ minHeight: '100px' }}>
                      <CircularProgress size={24} />
                    </div>
                  ) : discounts.length > 0 ? (
                    <Grid container spacing={3}>
                      {discounts.map(discount => (
                        <Grid size={{ xs: 12 }} key={discount.id}>
                          <Box
                            sx={{
                              p: 3,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              bgcolor: 'action.hover'
                            }}
                          >
                            <div className='flex justify-between items-start mb-2'>
                              <Typography variant='subtitle2' className='font-medium'>
                                {discount.name}
                              </Typography>
                              <Chip
                                label={discount.is_active ? 'Active' : 'Inactive'}
                                color={discount.is_active ? 'success' : 'error'}
                                size='small'
                                variant='tonal'
                              />
                            </div>
                            <Typography variant='body2' color='text.secondary'>
                              {discount.discount_type === 'percentage'
                                ? `${discount.discount_value}% Off`
                                : `€${discount.discount_value} Off`}
                            </Typography>
                            {discount.start_date && (
                              <Typography variant='caption' color='text.secondary' display='block' className='mt-1'>
                                From: {new Date(discount.start_date).toLocaleDateString()}
                              </Typography>
                            )}
                            {discount.end_date && (
                              <Typography variant='caption' color='text.secondary' display='block'>
                                To: {new Date(discount.end_date).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant='body2' color='text.secondary' align='center'>
                      {dictionary.common?.noDiscountsApplied || 'No discounts applied to this category'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default CategoryAdd
