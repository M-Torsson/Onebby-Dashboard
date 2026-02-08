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
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import OutlinedInput from '@mui/material/OutlinedInput'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CustomTextField from '@core/components/mui/TextField'
import { API_BASE_URL, API_KEY } from '@/configs/apiConfig'

const V1_BASE_URL = `${API_BASE_URL}/api/v1`

const DiscountAdd = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [products, setProducts] = useState([])
  const [productSearchInput, setProductSearchInput] = useState('')
  const [searchedProducts, setSearchedProducts] = useState([])
  const [searchingProducts, setSearchingProducts] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    discount_type: 'percentage',
    discount_value: 0,
    target_type: 'category',
    target_ids: [],
    start_date: '',
    end_date: '',
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    fetchProducts()
    if (editId) {
      fetchDiscountData()
    }
  }, [editId])

  const fetchCategories = async () => {
    try {
      // Fetch all categories with pagination
      const limit = 500
      let skip = 0
      let allCategories = []
      let hasMore = true

      while (hasMore && skip < 5000) {
        const url = `${V1_BASE_URL}/categories?skip=${skip}&limit=${limit}&active_only=false&parent_only=false`
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

      // Sort: parents first, then by name
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

  const fetchBrands = async () => {
    try {
      // Fetch all brands with pagination
      const limit = 500
      let skip = 0
      let allBrands = []
      let hasMore = true

      while (hasMore && skip < 5000) {
        const url = `${API_BASE_URL}/api/admin/brands?skip=${skip}&limit=${limit}&active_only=false`
        const response = await fetch(url, {
          headers: { 'X-API-KEY': API_KEY }
        })

        if (!response.ok) break

        const result = await response.json()
        const data = result.data || result
        const brandsArray = Array.isArray(data) ? data : []

        allBrands = allBrands.concat(brandsArray)

        if (brandsArray.length < limit) {
          hasMore = false
        } else {
          skip += limit
        }
      }

      // Sort brands alphabetically
      allBrands.sort((a, b) => {
        const nameA = String(a?.name || '').toLowerCase()
        const nameB = String(b?.name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })

      setBrands(allBrands)
    } catch (err) {
      console.error('Error fetching brands:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/products?active_only=false&limit=50`, {
        headers: { 'X-API-KEY': API_KEY }
      })
      if (response.ok) {
        const result = await response.json()
        setProducts(result.data || result || [])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const fetchDiscountData = async () => {
    try {
      setFetchingData(true)
      const response = await fetch(`${V1_BASE_URL}/discounts/${editId}`, {
        headers: { 'X-API-KEY': API_KEY }
      })

      if (response.ok) {
        const discount = await response.json()
        setFormData({
          name: discount.name || '',
          discount_type: discount.discount_type || 'percentage',
          discount_value: discount.discount_value || 0,
          target_type: discount.target_type || 'category',
          target_ids: discount.target_ids || [],
          start_date: discount.start_date ? discount.start_date.split('T')[0] : '',
          end_date: discount.end_date ? discount.end_date.split('T')[0] : '',
          is_active: discount.is_active !== undefined ? discount.is_active : true
        })
      } else {
        setError(`Failed to load discount campaign`)
      }
    } catch (err) {
      setError(`Network error: ${err.message}`)
    } finally {
      setFetchingData(false)
    }
  }

  const handleSaveDiscount = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      if (!formData.name || formData.discount_value <= 0 || formData.target_ids.length === 0) {
        setError('Name, discount value, and at least one target are required')
        setLoading(false)
        return
      }

      const url = editId ? `${V1_BASE_URL}/discounts/${editId}` : `${V1_BASE_URL}/discounts`
      const method = editId ? 'PUT' : 'POST'

      const bodyData = {
        name: formData.name,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        target_type: formData.target_type === 'product' ? 'products' : formData.target_type,
        target_ids: formData.target_ids,
        start_date: formData.start_date ? `${formData.start_date}T00:00:00Z` : null,
        end_date: formData.end_date ? `${formData.end_date}T23:59:59Z` : null,
        is_active: formData.is_active
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        const createdDiscount = await response.json()
        const discountId = editId || createdDiscount.id || createdDiscount.data?.id

        // Step 2: Apply the discount campaign after creation/update
        if (discountId) {
          try {
            const applyResponse = await fetch(`${V1_BASE_URL}/discounts/${discountId}/apply`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY
              }
            })

            if (applyResponse.ok) {
              setSuccess(
                editId
                  ? 'Discount campaign updated and applied successfully!'
                  : 'Discount campaign created and applied successfully!'
              )
            } else {
              setSuccess(
                editId
                  ? 'Discount campaign updated but failed to apply. Please apply manually.'
                  : 'Discount campaign created but failed to apply. Please apply manually.'
              )
            }
          } catch (applyErr) {
            setSuccess(
              editId
                ? 'Discount campaign updated but failed to apply. Please apply manually.'
                : 'Discount campaign created but failed to apply. Please apply manually.'
            )
          }
        }

        setTimeout(() => {
          router.push('/apps/ecommerce/discounts/list')
        }, 2000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = ''
        if (errorData.detail && Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(err => `${err.loc.join(' -> ')}: ${err.msg}`).join('\n')
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
        } else {
          errorMessage = `Failed to ${editId ? 'update' : 'create'} discount campaign`
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const searchProductsByIdOrName = async searchValue => {
    if (!searchValue || searchValue.trim().length === 0) {
      setSearchedProducts([])
      return
    }

    try {
      setSearchingProducts(true)

      const trimmedValue = searchValue.trim()
      let results = []

      // If search is a number, try direct ID lookup first
      if (/^\d+$/.test(trimmedValue)) {
        try {
          const idResponse = await fetch(`${API_BASE_URL}/api/v1/products/${trimmedValue}`, {
            headers: { 'X-API-KEY': API_KEY },
            mode: 'cors'
          })

          if (idResponse.ok) {
            const productData = await idResponse.json()

            // Handle both direct product and wrapped response
            const product = productData.data || productData

            if (product && product.id) {
              results = [product]
            }
          }
        } catch (err) {}
      }

      // If no direct match or searching by name, search in the list (with reduced limit)
      if (results.length === 0) {
        const response = await fetch(`${API_BASE_URL}/api/v1/products?active_only=false&limit=100`, {
          headers: { 'X-API-KEY': API_KEY }
        })

        if (response.ok) {
          const result = await response.json()
          const allProducts = result.data || result || []

          // Search by ID or name
          const filtered = allProducts.filter(product => {
            const searchLower = trimmedValue.toLowerCase()
            const productId = String(product.id || '')
            const productName = (product.title || product.name || '').toLowerCase()

            return productId.includes(searchLower) || productName.includes(searchLower)
          })

          results = filtered
        }
      }

      setSearchedProducts(results.slice(0, 10))
    } catch (err) {
    } finally {
      setSearchingProducts(false)
    }
  }

  const handleProductSearch = value => {
    setProductSearchInput(value)
    searchProductsByIdOrName(value)
  }

  const addProductToTargets = productId => {
    if (!formData.target_ids.includes(productId)) {
      setFormData(prev => ({
        ...prev,
        target_ids: [...prev.target_ids, productId]
      }))
    }
    setProductSearchInput('')
    setSearchedProducts([])
  }

  const removeProductFromTargets = productId => {
    setFormData(prev => ({
      ...prev,
      target_ids: prev.target_ids.filter(id => id !== productId)
    }))
  }

  const getTargetOptions = () => {
    switch (formData.target_type) {
      case 'category':
        return categories
      case 'brand':
        return brands
      case 'product':
        return products
      default:
        return []
    }
  }

  const getTargetLabel = item => {
    if (formData.target_type === 'product') {
      return item.title || item.name || `Product ${item.id}`
    }
    return item.name || `Item ${item.id}`
  }

  const toggleCategoryExpanded = categoryId => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev?.[categoryId] }))
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

    // Auto-expand path to selected categories
    if (formData.target_ids.length > 0) {
      for (const selectedId of formData.target_ids) {
        const selected = byId.get(String(selectedId))
        if (selected) {
          const seen = new Set()
          let cur = selected
          while (cur && cur?.parent_id != null) {
            const pid = String(cur.parent_id)
            if (!pid || seen.has(pid)) break
            seen.add(pid)
            cur = byId.get(pid)
          }
        }
      }
    }

    return flatten()
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
      <Grid size={{ xs: 12 }}>
        <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
          <div>
            <Typography variant='h4' className='mbe-1'>
              {editId
                ? dictionary.common?.editCampaign || 'Edit Discount Campaign'
                : dictionary.common?.addNewCampaign || 'Add New Discount Campaign'}
            </Typography>
            <Typography>{dictionary.common?.manageCampaignInfo || 'Manage your discount campaign'}</Typography>
          </div>
          <div className='flex flex-wrap max-sm:flex-col gap-4'>
            <Button variant='tonal' color='secondary' onClick={() => router.push('/apps/ecommerce/discounts/list')}>
              {dictionary.common?.discard || 'Discard'}
            </Button>
            <Button variant='contained' onClick={handleSaveDiscount} disabled={loading}>
              {loading
                ? editId
                  ? dictionary.common?.updating || 'Updating...'
                  : dictionary.common?.creating || 'Creating...'
                : editId
                  ? dictionary.common?.updateCampaign || 'Update Campaign'
                  : dictionary.common?.createCampaign || 'Create Campaign'}
            </Button>
          </div>
        </div>
      </Grid>

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

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardHeader title={dictionary.common?.campaignDetails || 'Campaign Details'} />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label={dictionary.common?.campaignName || 'Campaign Name'}
                  placeholder='e.g., Summer Sale'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{dictionary.common?.discountType || 'Discount Type'}</InputLabel>
                  <Select
                    value={formData.discount_type}
                    label={dictionary.common?.discountType || 'Discount Type'}
                    onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                  >
                    <MenuItem value='percentage'>Percentage (%)</MenuItem>
                    <MenuItem value='fixed'>Fixed Amount (€)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  type='number'
                  label={dictionary.common?.discountValue || 'Discount Value'}
                  placeholder={formData.discount_type === 'percentage' ? 'e.g., 15' : 'e.g., 10.00'}
                  value={formData.discount_value}
                  onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography sx={{ color: 'text.secondary', ml: 1 }}>
                          {formData.discount_type === 'percentage' ? '%' : '€'}
                        </Typography>
                      )
                    }
                  }}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>{dictionary.common?.targetType || 'Target Type'}</InputLabel>
                  <Select
                    value={formData.target_type}
                    label={dictionary.common?.targetType || 'Target Type'}
                    onChange={e => setFormData({ ...formData, target_type: e.target.value, target_ids: [] })}
                  >
                    <MenuItem value='category'>Category</MenuItem>
                    <MenuItem value='product'>Product</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.target_type === 'product' ? (
                <>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label={dictionary.common?.searchProduct || 'Search Product by ID or Name'}
                      placeholder='Enter product ID or name...'
                      value={productSearchInput}
                      onChange={e => handleProductSearch(e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: searchingProducts ? <CircularProgress size={20} /> : null
                        }
                      }}
                    />
                    {searchedProducts.length > 0 && (
                      <Box
                        sx={{
                          mt: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                          bgcolor: 'background.paper'
                        }}
                      >
                        {searchedProducts.map(product => (
                          <Box
                            key={product.id}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:hover': { bgcolor: 'action.hover' },
                              '&:last-child': { borderBottom: 'none' }
                            }}
                            onClick={() => addProductToTargets(product.id)}
                          >
                            <Typography variant='body2' color='text.primary'>
                              {product.title || product.name || `Product ${product.id}`}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              ID: {product.id}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Grid>

                  {formData.target_ids.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant='subtitle2' className='mb-2'>
                        {dictionary.common?.selectedProducts || 'Selected Products'}:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.target_ids.map(productId => {
                          const product = products.find(p => p.id === productId)
                          return (
                            <Chip
                              key={productId}
                              label={product ? product.title || product.name || `ID: ${productId}` : `ID: ${productId}`}
                              onDelete={() => removeProductFromTargets(productId)}
                              color='primary'
                              variant='outlined'
                            />
                          )
                        })}
                      </Box>
                    </Grid>
                  )}
                </>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>{dictionary.common?.selectTargets || `Select ${formData.target_type}s`}</InputLabel>
                    <Select
                      multiple
                      value={formData.target_ids}
                      onChange={e => {
                        // Filter out parent categories (those with children)
                        const selectedIds = e.target.value.filter(id => {
                          if (formData.target_type === 'category') {
                            const opt = getCategoryTree().find(o => o.node.id === id)
                            return opt && !opt.hasChildren
                          }
                          return true
                        })
                        setFormData({ ...formData, target_ids: selectedIds })
                      }}
                      input={<OutlinedInput label={`Select ${formData.target_type}s`} />}
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
                      renderValue={selected => (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            width: '100%'
                          }}
                        >
                          {selected.map(value => {
                            const item = getTargetOptions().find(opt => opt.id === value)
                            return (
                              <Chip
                                key={value}
                                label={item ? getTargetLabel(item) : value}
                                size='small'
                                onDelete={e => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  const newTargetIds = formData.target_ids.filter(id => id !== value)
                                  setFormData({ ...formData, target_ids: newTargetIds })
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
                                      const newTargetIds = formData.target_ids.filter(id => id !== value)
                                      setFormData({ ...formData, target_ids: newTargetIds })
                                    }}
                                  />
                                }
                              />
                            )
                          })}
                        </Box>
                      )}
                    >
                      {formData.target_type === 'category'
                        ? getCategoryTree().map(opt => (
                            <MenuItem
                              key={opt.id}
                              value={opt.node.id}
                              onClick={e => {
                                if (opt.hasChildren) {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleCategoryExpanded(opt.id)
                                }
                              }}
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
                          ))
                        : getTargetOptions().map(item => (
                            <MenuItem key={item.id} value={item.id}>
                              {getTargetLabel(item)}
                            </MenuItem>
                          ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  type='date'
                  label={dictionary.common?.startDate || 'Start Date'}
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  type='date'
                  label={dictionary.common?.endDate || 'End Date'}
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader title={dictionary.common?.settings || 'Settings'} />
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label={
                <div>
                  <Typography variant='body1'>{dictionary.common?.activeStatus || 'Active Status'}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {dictionary.common?.enableCampaign || 'Enable this discount campaign'}
                  </Typography>
                </div>
              }
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DiscountAdd
