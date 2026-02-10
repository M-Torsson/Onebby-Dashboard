// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import GlobalStyles from '@mui/material/GlobalStyles'
import MenuItem from '@mui/material/MenuItem'
import CustomTextField from '@core/components/mui/TextField'
import { API_BASE_URL, API_KEY } from '@/configs/apiConfig'

const V1_BASE_URL = `${API_BASE_URL}/api/admin`
const API_V1_BASE_URL = `${API_BASE_URL}/api/v1`
const WARRANTY_API_KEY = 'OnebbyAPIKey2025P9mK7xL4rT8nW2qF5vB3cH6jD9zYaXbRcGdTeUf1MwNyQsV'

const WarrantyAdd = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [categories, setCategories] = useState([])
  const [expandedCategories, setExpandedCategories] = useState({})
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    subtitle: '',
    meta_description: '',
    image: '',
    category_id: [],
    is_active: true
  })

  const [featuresList, setFeaturesList] = useState([
    { id: 1, key: '', value: '' }
  ])

  useEffect(() => {
    fetchCategories()
    if (editId) {
      fetchWarrantyData()
    }
  }, [editId])

  const fetchCategories = async () => {
    try {
      const limit = 500
      let skip = 0
      let allCategories = []
      let hasMore = true

      while (hasMore && skip < 5000) {
        const url = `${API_V1_BASE_URL}/categories?skip=${skip}&limit=${limit}&active_only=false&parent_only=false`
        const response = await fetch(url, {
          headers: { 'X-API-KEY': API_KEY }
        })

        if (!response.ok) break

        const result = await response.json()
        const data = result.data || result || []
        const categoriesArray = Array.isArray(data) ? data : []

        allCategories = allCategories.concat(categoriesArray)

        if (categoriesArray.length < limit) {
          hasMore = false
        } else {
          skip += limit
        }
      }

      allCategories.sort((a, b) => {
        if (a.parent_id === null && b.parent_id !== null) return -1
        if (a.parent_id !== null && b.parent_id === null) return 1
        return (a.name || '').localeCompare(b.name || '')
      })

      setCategories(allCategories)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const toggleCategoryExpanded = categoryId => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev?.[categoryId] }))
  }

  const getAllDescendants = categoryId => {
    const descendants = []
    const childrenByParent = new Map()

    for (const c of categories) {
      if (!c || c?.id == null) continue
      const pid = c?.parent_id == null ? null : String(c.parent_id)
      const arr = childrenByParent.get(pid) || []
      arr.push(c)
      childrenByParent.set(pid, arr)
    }

    const collectChildren = parentId => {
      const children = childrenByParent.get(String(parentId)) || []
      for (const child of children) {
        descendants.push(child.id)
        collectChildren(child.id)
      }
    }

    collectChildren(categoryId)
    return descendants
  }

  const getCategoryTree = () => {
    const byId = new Map(categories.filter(Boolean).map(c => [String(c?.id ?? ''), c]))
    const childrenByParent = new Map()

    for (const c of categories) {
      if (!c || c?.id == null) continue
      const pid = c?.parent_id == null ? null : String(c.parent_id)
      const arr = childrenByParent.get(pid) || []
      arr.push(c)
      childrenByParent.set(pid, arr)
    }

    const getName = c => String(c?.name ?? c?.label ?? '').trim()
    const sortByName = arr => [...arr].sort((a, b) => getName(a).localeCompare(getName(b)))
    const roots = sortByName(childrenByParent.get(null) || [])

    const flatten = () => {
      const out = []
      const visited = new Set()

      const walk = (node, depth) => {
        const id = String(node?.id ?? '')
        if (!id || visited.has(id)) return
        visited.add(id)

        const kids = sortByName(childrenByParent.get(id) || [])
        const hasChildren = kids.length > 0

        out.push({ id, label: getName(node), depth, hasChildren, node })

        if (hasChildren && expandedCategories?.[id]) {
          for (const child of kids) {
            walk(child, depth + 1)
          }
        }
      }

      for (const root of roots) {
        walk(root, 0)
      }

      return out
    }

    return flatten()
  }

  const fetchWarrantyData = async () => {
    try {
      setFetchingData(true)
      const response = await fetch(`${V1_BASE_URL}/warranties/${editId}`, {
        headers: { 'X-API-Key': WARRANTY_API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        
        setFormData({
          title: data.title || '',
          price: data.price || '',
          subtitle: data.subtitle || '',
          meta_description: data.meta_description || '',
          image: data.image || '',
          category_id: data.categories || [],
          is_active: data.is_active !== undefined ? data.is_active : true
        })

        setImagePreview(data.image || '')

        if (data.features && data.features.length > 0) {
          setFeaturesList(data.features.map((feat, index) => ({
            id: index + 1,
            key: feat.key || '',
            value: feat.value || ''
          })))
        } else {
          setFeaturesList([{ id: 1, key: '', value: '' }])
        }
      } else {
        setError('Failed to load warranty data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setFetchingData(false)
    }
  }

  const handleAddFeature = () => {
    setFeaturesList([
      ...featuresList,
      {
        id: featuresList.length + 1,
        key: '',
        value: ''
      }
    ])
  }

  const handleRemoveFeature = id => {
    if (featuresList.length > 1) {
      setFeaturesList(featuresList.filter(feat => feat.id !== id))
    }
  }

  const handleFeatureChange = (id, field, value) => {
    setFeaturesList(
      featuresList.map(feat => (feat.id === id ? { ...feat, [field]: value } : feat))
    )
  }

  const uploadImageToCloudinary = async file => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'warranties')

      const response = await fetch(`/api/admin/upload/image`, {
        method: 'POST',
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
      throw err
    }
  }

  const handleImageUpload = async e => {
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
      setUploadingImage(true)
      setError('')
      
      const imageUrl = await uploadImageToCloudinary(file)
      
      setImagePreview(imageUrl)
      setFormData({ ...formData, image: imageUrl })
      setSuccess('Image uploaded successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(`Failed to upload image: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      const payload = {
        title: formData.title || '',
        price: parseFloat(formData.price) || 0,
        subtitle: formData.subtitle || '',
        meta_description: formData.meta_description || '',
        image: formData.image || '',
        is_active: formData.is_active || true,
        categories: formData.category_id || [],
        translations: [
          {
            lang: 'en',
            title: formData.title || '',
            subtitle: formData.subtitle || '',
            meta_description: formData.meta_description || ''
          },
          {
            lang: 'it',
            title: formData.title || '',
            subtitle: formData.subtitle || '',
            meta_description: formData.meta_description || ''
          },
          {
            lang: 'ar',
            title: formData.title || '',
            subtitle: formData.subtitle || '',
            meta_description: formData.meta_description || ''
          }
        ],
        features: featuresList.map(feat => ({
          key: feat.key || '',
          value: feat.value || ''
        }))
      }

      const url = editId ? `${V1_BASE_URL}/warranties/${editId}` : `${V1_BASE_URL}/warranties`
      const method = editId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': WARRANTY_API_KEY
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess(editId ? 'Warranty updated successfully!' : 'Warranty created successfully!')
        setTimeout(() => {
          router.push('/apps/ecommerce/warranty/list')
        }, 1500)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || errorData.message || 'Failed to save warranty')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <>
      <GlobalStyles
        styles={{
          '.ts-vertical-layout-content': {
            maxInlineSize: 'none !important',
            maxWidth: 'none !important'
          },
          '.ts-vertical-layout-content-compact': {
            maxInlineSize: 'none !important',
            maxWidth: 'none !important'
          },
          'main': {
            maxInlineSize: 'none !important',
            maxWidth: 'none !important'
          }
        }}
      />

      <Box sx={{ width: '100%', maxWidth: '1000px', margin: '24px auto', padding: '0 24px' }}>
        <Card>
          <CardHeader title={editId ? 'Edit Warranty' : 'Add Warranty'} />
          <CardContent>
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Title */}
              <Box>
                <Typography variant='h6' className='mb-2'>
                  Title
                </Typography>
                <CustomTextField
                  fullWidth
                  placeholder='Enter warranty title'
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </Box>

              {/* Price */}
              <Box>
                <Typography variant='h6' className='mb-2'>
                  Price (in Euros)
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  placeholder='0.00'
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  InputProps={{
                    endAdornment: <Typography>€</Typography>
                  }}
                  inputProps={{ min: 0, step: '0.01' }}
                  sx={{
                    '& input[type=number]': {
                      MozAppearance: 'textfield'
                    },
                    '& input[type=number]::-webkit-outer-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0
                    },
                    '& input[type=number]::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0
                    }
                  }}
                />
              </Box>

              {/* Subtitle */}
              <Box>
                <Typography variant='h6' className='mb-2'>
                  Subtitle
                </Typography>
                <CustomTextField
                  fullWidth
                  placeholder='Enter subtitle'
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </Box>

              {/* Meta Description */}
              <Box>
                <Typography variant='h6' className='mb-2'>
                  Meta Description
                </Typography>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.meta_description}
                  onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder='Enter meta description'
                />
              </Box>

              {/* Image Upload */}
              <Box>
                <Typography variant='h6' className='mb-2'>
                  Image
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: 'action.hover',
                      border: '2px dashed',
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: 'action.selected'
                      }
                    }}
                  >
                    <input
                      type='file'
                      accept='image/*'
                      style={{ display: 'none' }}
                      id='warranty-image-upload'
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor='warranty-image-upload'
                      style={{
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        opacity: uploadingImage ? 0.6 : 1
                      }}
                    >
                      {uploadingImage ? (
                        <CircularProgress size={40} />
                      ) : imagePreview ? (
                        <img
                          src={imagePreview}
                          alt='warranty'
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        />
                      ) : (
                        <i className='tabler-photo text-4xl text-textSecondary' />
                      )}
                    </label>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Click to upload warranty image
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      Recommended size: 800x600px
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Features Section */}
              <Box>
                <Box className='flex items-center justify-between mb-4'>
                  <Typography variant='h6'>Features</Typography>
                  <IconButton
                    color='primary'
                    onClick={handleAddFeature}
                    size='small'
                    className='bg-primary text-white hover:bg-primary-dark'
                  >
                    <i className='tabler-plus' />
                  </IconButton>
                </Box>

                {featuresList.map((feature, index) => (
                  <Card key={feature.id} className='mb-4 p-4 border'>
                    <Box className='flex items-center justify-between mb-3'>
                      <Typography variant='subtitle1' className='font-semibold'>
                        Feature {index + 1}
                      </Typography>
                      {featuresList.length > 1 && (
                        <IconButton
                          color='error'
                          onClick={() => handleRemoveFeature(feature.id)}
                          size='small'
                        >
                          <i className='tabler-trash' />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <CustomTextField
                          fullWidth
                          label='Key'
                          placeholder='Feature key'
                          value={feature.key}
                          onChange={e => handleFeatureChange(feature.id, 'key', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <CustomTextField
                          fullWidth
                          label='Value'
                          placeholder='Feature value'
                          value={feature.value}
                          onChange={e => handleFeatureChange(feature.id, 'value', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>

              {/* Select Category */}
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Select category</InputLabel>
                  <Select
                    multiple
                    value={Array.isArray(formData.category_id) ? formData.category_id : []}
                    onChange={e => {
                      const newValue = e.target.value
                      const currentValue = formData.category_id || []
                      
                      const added = newValue.filter(id => !currentValue.includes(id))
                      
                      if (added.length > 0) {
                        const addedId = added[0]
                        const descendants = getAllDescendants(addedId)
                        const allIds = [addedId, ...descendants]
                        const uniqueIds = [...new Set([...currentValue, ...allIds])]
                        setFormData({ ...formData, category_id: uniqueIds })
                      } else {
                        setFormData({ ...formData, category_id: newValue })
                      }
                    }}
                    input={<OutlinedInput label='Select category' />}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: '60vh'
                        }
                      },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left'
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left'
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 'auto !important',
                        minHeight: '56px !important'
                      },
                      '& .MuiSelect-select': {
                        height: 'auto !important',
                        minHeight: 'unset !important',
                        display: 'flex !important',
                        flexWrap: 'wrap !important',
                        gap: '4px !important',
                        paddingTop: '12px !important',
                        paddingBottom: '12px !important',
                        paddingRight: '32px !important'
                      },
                      '& .MuiSelect-icon': {
                        top: 'calc(50% - 12px) !important'
                      }
                    }}
                    renderValue={selected => {
                      if (!selected || selected.length === 0) {
                        return null
                      }
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            width: '100%'
                          }}
                        >
                          {selected.map(value => {
                            const category = categories.find(c => c.id === value)
                            return (
                              <Chip
                                key={value}
                                label={category?.name || `ID: ${value}`}
                                size='small'
                                onDelete={e => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  const newCategoryIds = formData.category_id.filter(id => id !== value)
                                  setFormData({ ...formData, category_id: newCategoryIds })
                                }}
                                onMouseDown={e => {
                                  e.stopPropagation()
                                }}
                                deleteIcon={
                                  <i
                                    className='tabler-x'
                                    style={{ fontSize: '0.875rem', color: '#d32f2f', cursor: 'pointer' }}
                                    onMouseDown={e => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      const newCategoryIds = formData.category_id.filter(id => id !== value)
                                      setFormData({ ...formData, category_id: newCategoryIds })
                                    }}
                                  />
                                }
                              />
                            )
                          })}
                        </Box>
                      )
                    }}
                  >
                    {getCategoryTree().map(opt => (
                      <MenuItem
                        key={opt.id}
                        value={opt.node.id}
                        sx={{
                          pl: 2 + opt.depth * 3,
                          fontWeight: opt.depth === 0 ? 700 : opt.depth === 1 ? 400 : 400,
                          fontSize: opt.depth === 0 ? '0.95rem' : opt.depth === 1 ? '0.875rem' : '0.8rem',
                          color: opt.depth === 0 ? 'text.primary' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        {opt.hasChildren && (
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              toggleCategoryExpanded(opt.id)
                            }}
                            sx={{ p: 0, minWidth: 20 }}
                          >
                            <i
                              className={
                                expandedCategories?.[opt.id] ? 'tabler-chevron-down' : 'tabler-chevron-right'
                              }
                              style={{ fontSize: opt.depth === 0 ? '1rem' : '0.875rem' }}
                            />
                          </IconButton>
                        )}
                        {!opt.hasChildren && <Box sx={{ width: 20 }} />}
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Submit Buttons */}
              <Box>
                <Box className='flex gap-4'>
                  <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Saving...' : editId ? 'Update Warranty' : 'Create Warranty'}
                  </Button>
                  <Button
                    variant='tonal'
                    color='secondary'
                    onClick={() => router.push('/apps/ecommerce/warranty/list')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export default WarrantyAdd
