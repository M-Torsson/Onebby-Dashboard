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
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import GlobalStyles from '@mui/material/GlobalStyles'
import CustomTextField from '@core/components/mui/TextField'
import { API_BASE_URL, API_KEY } from '@/configs/apiConfig'

const V1_BASE_URL = `${API_BASE_URL}/api/admin`
const API_V1_BASE_URL = `${API_BASE_URL}/api/v1`
const DELIVERY_API_KEY = 'OnebbyAPIKey2025P9mK7xL4rT8nW2qF5vB3cH6jD9zYaXbRcGdTeUf1MwNyQsV'

const DeliveryAdd = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [expandedCategories, setExpandedCategories] = useState({})

  const [formData, setFormData] = useState({
    days_from: '',
    days_to: '',
    note: '',
    is_free_delivery: false,
    category_id: [],
    option_note: '',
    options: []
  })

  const [optionsList, setOptionsList] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    if (editId) {
      fetchDeliveryData()
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

  const fetchProducts = async () => {
    try {
      const limit = 500
      let skip = 0
      let allProducts = []
      let hasMore = true

      while (hasMore && skip < 5000) {
        const url = `${API_V1_BASE_URL}/products?skip=${skip}&limit=${limit}`
        const response = await fetch(url, {
          headers: { 'X-API-KEY': API_KEY }
        })

        if (!response.ok) break

        const result = await response.json()
        const data = result.data || result || []
        const productsArray = Array.isArray(data) ? data : []

        allProducts = allProducts.concat(productsArray)

        if (productsArray.length < limit) {
          hasMore = false
        } else {
          skip += limit
        }
      }

      setProducts(allProducts)
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const fetchDeliveryData = async () => {
    try {
      setFetchingData(true)
      const response = await fetch(`${V1_BASE_URL}/deliveries/${editId}`, {
        headers: { 'X-API-Key': DELIVERY_API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        
        setFormData({
          days_from: data.days_from || '',
          days_to: data.days_to || '',
          note: data.note || '',
          is_free_delivery: data.is_free_delivery || false,
          category_id: data.categories || [],
          option_note: data.option_note || '',
          options: data.options || []
        })

        if (data.options && data.options.length > 0) {
          setOptionsList(data.options.map((opt, index) => ({
            id: index + 1,
            icon: opt.icon || '',
            details: opt.details || '',
            price: opt.price || ''
          })))
        }
      } else {
        setError('Failed to load delivery data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setFetchingData(false)
    }
  }

  const handleAddOption = () => {
    setOptionsList([
      ...optionsList,
      {
        id: optionsList.length + 1,
        icon: '',
        details: '',
        price: ''
      }
    ])
  }

  const handleRemoveOption = id => {
    setOptionsList(optionsList.filter(opt => opt.id !== id))
  }

  const handleOptionChange = (id, field, value) => {
    setOptionsList(
      optionsList.map(opt => (opt.id === id ? { ...opt, [field]: value } : opt))
    )
  }

  const handleSubmit = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      const payload = {
        days_from: parseInt(formData.days_from) || 0,
        days_to: parseInt(formData.days_to) || 0,
        note: formData.note || '',
        option_note: formData.option_note || '',
        is_free_delivery: formData.is_free_delivery || false,
        is_active: true,
        categories: formData.category_id || [],
        translations: [
          {
            lang: 'it',
            note: formData.note || '',
            option_note: formData.option_note || ''
          }
        ],
        options: formData.is_free_delivery ? [] : optionsList.map(opt => ({
          icon: opt.icon || '',
          details: opt.details || '',
          price: parseFloat(opt.price) || 0
        }))
      }

      const url = editId ? `${V1_BASE_URL}/deliveries/${editId}` : `${V1_BASE_URL}/deliveries`
      const method = editId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': DELIVERY_API_KEY
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess(editId ? 'Delivery updated successfully!' : 'Delivery created successfully!')
        setTimeout(() => {
          router.push('/apps/ecommerce/delivery/list')
        }, 1500)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || errorData.message || 'Failed to save delivery')
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
          <CardHeader title={editId ? 'Edit Delivery' : 'Add Delivery'} />
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
              {/* Estimated Delivery Time */}
              <Box>
                <Typography variant='h6' className='mb-4'>
                  Estimated delivery time
                </Typography>
                <Grid container spacing={4} alignItems='center'>
                  <Grid item xs={12} sm={2}>
                    <Typography>Days from:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CustomTextField
                      fullWidth
                      type='number'
                      placeholder='0'
                      value={formData.days_from}
                      onChange={e => setFormData({ ...formData, days_from: e.target.value })}
                      inputProps={{ min: 0 }}
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
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography>To:</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CustomTextField
                      fullWidth
                      type='number'
                      placeholder='0'
                      value={formData.days_to}
                      onChange={e => setFormData({ ...formData, days_to: e.target.value })}
                      inputProps={{ min: 0 }}
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
                  </Grid>
                </Grid>
                
                {/* Note */}
                <Typography variant='h6' className='mb-2 mt-4'>
                  Note:
                </Typography>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={6}
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder='Option note:'
                  sx={{
                    '& .MuiInputBase-input::placeholder': {
                      color: '#9e9e9e',
                      opacity: 1
                    }
                  }}
                />
              </Box>

              {/* Options Section - Hidden when free delivery is checked */}
              {!formData.is_free_delivery && (
                <Box>
                  {/* Options List */}
                  <Box className='flex items-center justify-between mb-4'>
                    <Typography variant='h6'>Options:</Typography>
                    <IconButton
                      color='primary'
                      onClick={handleAddOption}
                      size='small'
                      className='bg-primary text-white hover:bg-primary-dark'
                    >
                      <i className='tabler-plus' />
                    </IconButton>
                  </Box>

                  {optionsList.map((option, index) => (
                    <Card key={option.id} className='mb-4 p-4 border'>
                      <Box className='flex items-center justify-between mb-3'>
                        <Typography variant='subtitle1' className='font-semibold'>
                          Option {index + 1}
                        </Typography>
                        {optionsList.length > 1 && (
                          <IconButton
                            color='error'
                            onClick={() => handleRemoveOption(option.id)}
                            size='small'
                          >
                            <i className='tabler-trash' />
                          </IconButton>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                          <Box sx={{ flex: '0 0 auto' }}>
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                backgroundColor: 'action.hover',
                                '&:hover': {
                                  backgroundColor: 'action.selected'
                                }
                              }}
                            >
                              <input
                                type='file'
                                accept='image/*'
                                style={{ display: 'none' }}
                                id={`icon-upload-${option.id}`}
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      handleOptionChange(option.id, 'icon', reader.result)
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                              <label
                                htmlFor={`icon-upload-${option.id}`}
                                style={{
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  height: '100%'
                                }}
                              >
                                {option.icon ? (
                                  <img
                                    src={option.icon}
                                    alt='icon'
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                  />
                                ) : (
                                  <i className='tabler-photo text-2xl text-textSecondary' />
                                )}
                              </label>
                            </Box>
                          </Box>

                          <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 } }}>
                            <CustomTextField
                              fullWidth
                              label='option details'
                              placeholder='option details'
                              value={option.details}
                              onChange={e => handleOptionChange(option.id, 'details', e.target.value)}
                            />
                          </Box>

                          <Box sx={{ width: { xs: '100%', sm: 220 } }}>
                            <CustomTextField
                              fullWidth
                              label='option price'
                              placeholder='0'
                              type='number'
                              value={option.price}
                              onChange={e => handleOptionChange(option.id, 'price', e.target.value)}
                              InputProps={{
                                endAdornment: <Typography>€</Typography>
                              }}
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
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Select Category - Fixed Section - Always visible */}
              <Box sx={{ mt: 10, mb: 4 }}>
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

              {/* Option Note - Fixed Section - Always visible */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='subtitle2' className='mb-2'>
                  Option note:
                </Typography>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.option_note}
                  onChange={e => setFormData({ ...formData, option_note: e.target.value })}
                  placeholder='Option note:'
                />
              </Box>

              {/* Free Delivery Checkbox */}
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_free_delivery}
                      onChange={e => setFormData({ ...formData, is_free_delivery: e.target.checked })}
                    />
                  }
                  label='Make this category as a free delivery'
                />
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
                    {loading ? 'Saving...' : editId ? 'Update Delivery' : 'Create Delivery'}
                  </Button>
                  <Button
                    variant='tonal'
                    color='secondary'
                    onClick={() => router.push('/apps/ecommerce/delivery/list')}
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

export default DeliveryAdd
