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
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

const ProductsAdd = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [taxClasses, setTaxClasses] = useState([])

  const [formData, setFormData] = useState({
    product_type: 'configurable',
    reference: '',
    ean13: '',
    is_active: true,
    brand_id: null,
    tax: {
      class_id: 1,
      included_in_price: true
    },
    price: {
      list: 0,
      currency: 'EUR',
      discounts: []
    },
    condition: 'new',
    categories: [],
    stock: {
      status: 'in_stock',
      quantity: 0
    },
    images: [],
    features: [],
    attributes: [],
    related_product_ids: [],
    translation: {
      title: '',
      sub_title: '',
      simple_description: '',
      meta_description: ''
    },
    variant_attributes: [],
    variants: []
  })

  const [imagePreview, setImagePreview] = useState(null)

  // Fetch brands and categories on mount
  useEffect(() => {
    const initData = async () => {
      // Try to fetch data without showing errors on initial load
      fetchBrands()
      fetchCategories()
      fetchTaxClasses()
      if (editId) {
        fetchProductData()
      }
    }
    initData()
  }, [editId])

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/brands`, {
        headers: { 'X-API-Key': API_KEY },
        mode: 'cors'
      })
      if (response.ok) {
        const result = await response.json()
        // Handle both { data: [...] } and [...] response formats
        const data = result.data || result
        setBrands(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch brands - Status:', response.status)
        // Don't show error on initial load, just log it
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err)
      // Don't show error on initial load
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        headers: { 'X-API-Key': API_KEY },
        mode: 'cors'
      })
      if (response.ok) {
        const result = await response.json()
        // Handle both { data: [...] } and [...] response formats
        const data = result.data || result
        setCategories(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch categories - Status:', response.status)
        // Don't show error on initial load, just log it
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      // Don't show error on initial load
    }
  }

  const fetchTaxClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tax-classes`, {
        headers: { 'X-API-Key': API_KEY },
        mode: 'cors'
      })
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        console.log('Tax classes loaded:', data)
        setTaxClasses(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch tax classes - Status:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch tax classes:', err)
    }
  }

  const fetchProductData = async () => {
    try {
      setFetchingData(true)
      setError('')

      console.log('Fetching product ID:', editId)

      // Try fetching individual product first
      let response = await fetch(`${API_BASE_URL}/api/v1/products/${editId}`, {
        headers: { 'X-API-Key': API_KEY }
      })

      console.log('Response status:', response.status)

      // If 404, try fetching from list with active_only=false (for inactive products)
      if (response.status === 404) {
        console.log('Product not found in individual endpoint, trying list endpoint...')
        const listResponse = await fetch(`${API_BASE_URL}/api/v1/products?active_only=false&limit=100`, {
          headers: { 'X-API-Key': API_KEY }
        })

        if (listResponse.ok) {
          const listResult = await listResponse.json()
          const products = listResult.data || []
          const product = products.find(p => p.id === parseInt(editId))

          if (product) {
            console.log('Found product in list:', product)
            // Create a mock response with the product data
            response = {
              ok: true,
              json: async () => product
            }
          } else {
            console.error('Product not found in list either')
          }
        }
      }

      if (response.ok) {
        const result = await response.json()
        const product = result.data || result
        console.log('Product data loaded:', product)

        // Check if this is basic data from list (no variants/translations array)
        const isBasicData = !product.variants && !product.translations

        // For configurable products, price and stock are in variants
        const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null
        const productPrice = product.price || firstVariant?.price || { list: 0, currency: 'EUR', discounts: [] }
        const productStock = product.stock || firstVariant?.stock || { status: 'in_stock', quantity: 0 }

        // Get translations - find English or first translation
        let englishTranslation = {}
        if (product.translations && product.translations.length > 0) {
          englishTranslation = product.translations.find(t => t.lang === 'en') || product.translations[0]
        } else if (isBasicData) {
          // Use basic fields from list endpoint
          englishTranslation = {
            title: product.title || '',
            sub_title: product.sub_title || '',
            simple_description: '',
            meta_description: ''
          }
        }

        setFormData({
          product_type: product.product_type || 'configurable',
          reference: product.reference || '',
          ean13: product.ean13 || '',
          is_active: product.is_active !== undefined ? product.is_active : true,
          brand_id: product.brand?.id || product.brand_id || null,
          tax: {
            class_id: product.tax?.id || product.tax?.class_id || null,
            included_in_price: product.tax?.included_in_price !== undefined ? product.tax.included_in_price : true
          },
          price: {
            list: typeof productPrice === 'object' ? productPrice.list || 0 : productPrice || 0,
            currency: productPrice.currency || 'EUR',
            discounts: productPrice.discounts || []
          },
          condition: product.condition || 'new',
          categories: product.categories?.map(cat => cat.id || cat) || [],
          stock: {
            status: product.stock_status || productStock.status || 'in_stock',
            quantity: product.stock_quantity || productStock.quantity || 0
          },
          images: product.images
            ? Array.isArray(product.images)
              ? product.images
              : []
            : product.image
              ? [{ url: product.image }]
              : [],
          features: product.features || [],
          attributes: product.attributes || [],
          related_product_ids: product.related_product_ids || [],
          translation: {
            title: englishTranslation.title || product.title || '',
            sub_title: englishTranslation.sub_title || product.sub_title || '',
            simple_description: englishTranslation.simple_description || product.simple_description || '',
            meta_description: englishTranslation.meta_description || product.meta_description || ''
          },
          variant_attributes: product.variant_attributes || [],
          variants: (product.variants || []).map(v => ({
            reference: v.reference || '',
            ean13: v.ean13 || '',
            is_active: v.is_active !== undefined ? v.is_active : true,
            condition: v.condition || 'new',
            attributes: v.attributes || {},
            price: {
              list: v.price?.list || 0,
              currency: v.price?.currency || 'EUR',
              discounts: v.price?.discounts || []
            },
            stock: {
              status: v.stock?.status || 'in_stock',
              quantity: v.stock?.quantity || 0
            },
            images: v.images || []
          }))
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to load product. Status:', response.status, 'Error:', errorData)

        if (response.status === 404) {
          setError(`Product ID ${editId} not found. It may have been deleted or does not exist.`)
        } else {
          setError(`Failed to load product: ${errorData.detail || response.statusText}`)
        }
      }
    } catch (err) {
      console.error('Network error loading product:', err)
      setError(`Network error: ${err.message}`)
    } finally {
      setFetchingData(false)
    }
  }

  // Upload Image to Cloudinary
  const uploadImageToCloudinary = async file => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'products')

      const response = await fetch(`${API_BASE_URL}/api/admin/upload/image`, {
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

  // Handle Multiple Images Upload
  const handleMainImageChange = async e => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    const filesToUpload = Array.from(files).filter(file => {
      if (!validTypes.includes(file.type)) {
        setError(`${file.name}: Please upload a valid image (JPEG, PNG, WEBP)`)
        return false
      }
      if (file.size > maxSize) {
        setError(`${file.name}: Image size must be less than 5MB`)
        return false
      }
      return true
    })

    if (filesToUpload.length === 0) return

    try {
      setUploadingImage(true)
      setError('')

      const uploadPromises = filesToUpload.map(file => uploadImageToCloudinary(file))
      const uploadedUrls = await Promise.all(uploadPromises)

      const newImages = uploadedUrls.map((url, index) => ({
        url,
        position: formData.images.length + index + 1,
        alt: {
          en: formData.translation.title || 'Product Image'
        }
      }))

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))

      setSuccess(`${uploadedUrls.length} image(s) uploaded successfully!`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(`Failed to upload images: ${err.message}`)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  // Remove Image
  const removeImage = index => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i + 1 }))
    }))
  }

  // Handle Translation Change
  const handleTranslationChange = (field, value) => {
    setFormData({
      ...formData,
      translation: {
        ...formData.translation,
        [field]: value
      }
    })
  }

  // Add Variant
  const addVariant = () => {
    const newVariant = {
      reference: '',
      ean13: '',
      is_active: true,
      condition: 'new',
      attributes: {},
      price: { list: 0, currency: 'EUR', discounts: [] },
      stock: { status: 'in_stock', quantity: 0 },
      images: []
    }
    setFormData({ ...formData, variants: [...formData.variants, newVariant] })
  }

  // Remove Variant
  const removeVariant = index => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index)
    setFormData({ ...formData, variants: updatedVariants })
  }

  // Update Variant
  const updateVariant = (index, field, value) => {
    const updatedVariants = [...formData.variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setFormData({ ...formData, variants: updatedVariants })
  }

  // Handle Save Product
  const handleSaveProduct = async () => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      if (!formData.reference || !formData.translation.title) {
        setError('Reference and Title are required')
        setLoading(false)
        return
      }

      // Validate EAN13 if provided
      if (formData.ean13 && formData.ean13.length !== 13) {
        setError('EAN13 must be exactly 13 digits or leave it empty')
        setLoading(false)
        return
      }

      // Validate variants EAN13
      for (let i = 0; i < formData.variants.length; i++) {
        const variant = formData.variants[i]
        if (variant.ean13 && variant.ean13.length !== 13) {
          setError(`Variant #${i + 1}: EAN13 must be exactly 13 digits or leave it empty`)
          setLoading(false)
          return
        }
      }

      const url = editId ? `${API_BASE_URL}/api/admin/products/${editId}` : `${API_BASE_URL}/api/admin/products`
      const method = editId ? 'PUT' : 'POST'

      // Prepare body data matching API structure
      let bodyData

      if (editId) {
        // For edit mode - send full data structure
        bodyData = {
          product_type: formData.product_type,
          reference: formData.reference,
          ean13: formData.ean13 || null,
          is_active: formData.is_active,
          brand_id: formData.brand_id,
          tax: {
            class_id: formData.tax.class_id,
            included_in_price: formData.tax.included_in_price !== undefined ? formData.tax.included_in_price : true
          },
          price: {
            list: parseFloat(formData.price.list) || 0,
            currency: formData.price.currency || 'EUR',
            discounts: formData.price.discounts || []
          },
          condition: formData.condition,
          categories: formData.categories,
          stock: {
            status: formData.stock.status,
            quantity: parseInt(formData.stock.quantity) || 0
          },
          images: formData.images.map((img, index) => ({
            url: img.url,
            position: index + 1,
            alt: {
              it: formData.translation.title || 'Product image',
              en: formData.translation.title || 'Product image'
            }
          })),
          translations: [
            {
              lang: 'it',
              title: formData.translation.title,
              sub_title: formData.translation.sub_title || '',
              simple_description: formData.translation.simple_description || '',
              meta_description: formData.translation.meta_description || ''
            },
            {
              lang: 'en',
              title: formData.translation.title,
              sub_title: formData.translation.sub_title || '',
              simple_description: formData.translation.simple_description || '',
              meta_description: formData.translation.meta_description || ''
            }
          ],
          variant_attributes: [
            {
              code: 'color',
              translations: [
                { lang: 'it', label: 'Colore' },
                { lang: 'en', label: 'Color' }
              ]
            },
            {
              code: 'storage',
              translations: [
                { lang: 'it', label: 'Memoria' },
                { lang: 'en', label: 'Storage' }
              ]
            }
          ],
          variants: formData.variants.map(v => ({
            reference: v.reference,
            ean13: v.ean13 || null,
            is_active: v.is_active !== undefined ? v.is_active : true,
            condition: v.condition || 'new',
            attributes: v.attributes || {},
            price: {
              list: parseFloat(v.price?.list) || 0,
              currency: 'EUR',
              discounts: []
            },
            stock: {
              status: v.stock?.status || 'in_stock',
              quantity: parseInt(v.stock?.quantity) || 0
            },
            images: v.images || []
          }))
        }
      } else {
        // For create mode - full structure matching API
        bodyData = {
          product_type: formData.product_type,
          reference: formData.reference,
          ean13: formData.ean13 || null,
          is_active: formData.is_active,
          brand_id: formData.brand_id,
          tax: {
            class_id: formData.tax.class_id,
            included_in_price: formData.tax.included_in_price !== undefined ? formData.tax.included_in_price : true
          },
          price: {
            list: parseFloat(formData.price.list) || 0,
            currency: formData.price.currency || 'EUR',
            discounts: formData.price.discounts || []
          },
          condition: formData.condition,
          categories: formData.categories,
          stock: {
            status: formData.stock.status,
            quantity: parseInt(formData.stock.quantity) || 0
          },
          images: formData.images.map((img, index) => ({
            url: img.url,
            position: index + 1,
            alt: {
              it: formData.translation.title || 'Product image',
              en: formData.translation.title || 'Product image'
            }
          })),
          translations: [
            {
              lang: 'it',
              title: formData.translation.title,
              sub_title: formData.translation.sub_title || '',
              simple_description: formData.translation.simple_description || '',
              meta_description: formData.translation.meta_description || ''
            },
            {
              lang: 'en',
              title: formData.translation.title,
              sub_title: formData.translation.sub_title || '',
              simple_description: formData.translation.simple_description || '',
              meta_description: formData.translation.meta_description || ''
            }
          ],
          variant_attributes: [
            {
              code: 'color',
              translations: [
                { lang: 'it', label: 'Colore' },
                { lang: 'en', label: 'Color' }
              ]
            },
            {
              code: 'storage',
              translations: [
                { lang: 'it', label: 'Memoria' },
                { lang: 'en', label: 'Storage' }
              ]
            }
          ],
          variants: formData.variants.map(v => ({
            reference: v.reference,
            ean13: v.ean13 || null,
            is_active: v.is_active !== undefined ? v.is_active : true,
            condition: v.condition || 'new',
            attributes: v.attributes || {},
            price: {
              list: parseFloat(v.price?.list) || 0,
              currency: 'EUR',
              discounts: []
            },
            stock: {
              status: v.stock?.status || 'in_stock',
              quantity: parseInt(v.stock?.quantity) || 0
            },
            images: v.images || []
          }))
        }
      }

      let bodyString
      try {
        bodyString = JSON.stringify(bodyData)
      } catch (jsonError) {
        console.error('JSON stringify error:', jsonError)
        setError('Invalid data format. Please check your inputs.')
        setLoading(false)
        return
      }

      const response = await fetch(url, {
        method,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: bodyString
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(editId ? 'Product updated successfully!' : 'Product created successfully!')
        setTimeout(() => {
          router.push('/apps/ecommerce/products/list')
        }, 1500)
      } else {
        const responseText = await response.text()
        console.error('Error Response Text:', responseText)

        let errorData = {}
        try {
          errorData = JSON.parse(responseText)
        } catch (e) {
          console.error('Could not parse error response as JSON')
        }

        console.error('Error Response:', errorData)
        console.error('Response Status Code:', response.status)

        // Handle validation errors from Pydantic
        let errorMessage = ''
        if (errorData.detail && Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(err => `${err.loc.join(' -> ')}: ${err.msg}`).join('\n')
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else {
          errorMessage = responseText || `HTTP ${response.status}: Failed to ${editId ? 'update' : 'create'} product`
        }

        setError(errorMessage)
      }
    } catch (err) {
      console.error('=== CATCH ERROR ===')
      console.error('Error:', err)
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
      setError(`Network error: ${err.message}`)
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
              {editId ? 'Edit Product' : 'Add a new Product'}
            </Typography>
            <Typography>Manage your product information</Typography>
          </div>
          <div className='flex flex-wrap max-sm:flex-col gap-4'>
            <Button variant='tonal' color='secondary' onClick={() => router.push('/apps/ecommerce/products/list')}>
              Discard
            </Button>
            <Button variant='contained' onClick={handleSaveProduct} disabled={loading}>
              {loading ? (editId ? 'Updating...' : 'Publishing...') : editId ? 'Update Product' : 'Publish Product'}
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
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Basic Information' />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='Reference'
                      placeholder='IPH15-PARENT'
                      value={formData.reference}
                      onChange={e => setFormData({ ...formData, reference: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='EAN13'
                      placeholder='1234567890123 (13 digits)'
                      value={formData.ean13 || ''}
                      onChange={e => setFormData({ ...formData, ean13: e.target.value })}
                      helperText='Must be exactly 13 digits or leave empty'
                      error={formData.ean13 && formData.ean13.length !== 13}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Product Type</InputLabel>
                      <Select
                        value={formData.product_type}
                        label='Product Type'
                        onChange={e => setFormData({ ...formData, product_type: e.target.value })}
                      >
                        <MenuItem value='configurable'>Configurable</MenuItem>
                        <MenuItem value='simple'>Simple</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Condition</InputLabel>
                      <Select
                        value={formData.condition}
                        label='Condition'
                        onChange={e => setFormData({ ...formData, condition: e.target.value })}
                      >
                        <MenuItem value='new'>New</MenuItem>
                        <MenuItem value='used'>Used</MenuItem>
                        <MenuItem value='refurbished'>Refurbished</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Details */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Product Details' />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label='Title'
                      placeholder='Product Title'
                      value={formData.translation.title}
                      onChange={e => handleTranslationChange('title', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={4}
                      label='Sub Title'
                      placeholder='Product Sub Title'
                      value={formData.translation.sub_title}
                      onChange={e => handleTranslationChange('sub_title', e.target.value)}
                      slotProps={{
                        input: {
                          style: { resize: 'vertical', overflow: 'auto' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={10}
                      label='Simple Description'
                      placeholder='Short description'
                      value={formData.translation.simple_description}
                      onChange={e => handleTranslationChange('simple_description', e.target.value)}
                      slotProps={{
                        input: {
                          style: { resize: 'vertical', overflow: 'auto' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={8}
                      label='Meta Description'
                      placeholder='SEO meta description'
                      value={formData.translation.meta_description}
                      onChange={e => handleTranslationChange('meta_description', e.target.value)}
                      slotProps={{
                        input: {
                          style: { resize: 'vertical', overflow: 'auto' }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Images */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title='Product Images'
                action={
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<i className='tabler-upload' />}
                    onClick={() => document.getElementById('product-images-input').click()}
                    disabled={uploadingImage}
                  >
                    Upload Images
                  </Button>
                }
              />
              <CardContent>
                {uploadingImage && (
                  <Box display='flex' alignItems='center' justifyContent='center' gap={2} mb={3}>
                    <CircularProgress size={24} />
                    <Typography variant='body2' color='text.secondary'>
                      Uploading images...
                    </Typography>
                  </Box>
                )}

                {formData.images.length > 0 ? (
                  <Grid container spacing={3}>
                    {formData.images.map((image, index) => (
                      <Grid size={{ xs: 6, sm: 4, md: 6, lg: 4 }} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            overflow: 'hidden',
                            '&:hover .delete-overlay': { opacity: 1 }
                          }}
                        >
                          <Box
                            component='img'
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 150,
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          <Box
                            className='delete-overlay'
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.2s'
                            }}
                          >
                            <IconButton
                              size='small'
                              onClick={() => removeImage(index)}
                              sx={{
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'error.dark' }
                              }}
                            >
                              <i className='tabler-trash' />
                            </IconButton>
                          </Box>
                          {index === 0 && (
                            <Chip
                              label='Main'
                              size='small'
                              color='primary'
                              sx={{ position: 'absolute', top: 8, left: 8 }}
                            />
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                    gap={2}
                    border='2px dashed'
                    borderColor='divider'
                    borderRadius={1}
                    p={4}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => document.getElementById('product-images-input').click()}
                  >
                    <i
                      className='tabler-photo-plus'
                      style={{ fontSize: '4rem', color: 'var(--mui-palette-text-secondary)' }}
                    />
                    <Typography variant='h6' color='text.primary'>
                      No images uploaded
                    </Typography>
                    <Typography variant='body2' color='text.secondary' align='center'>
                      Click to upload multiple images
                      <br />
                      Supported: JPEG, PNG, WEBP (max 5MB each)
                    </Typography>
                  </Box>
                )}

                <input
                  id='product-images-input'
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  multiple
                  hidden
                  onChange={handleMainImageChange}
                  disabled={uploadingImage}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Variant Attributes Definition */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Variant Attributes' />
              <CardContent>
                <Typography variant='body2' color='text.secondary' className='mbe-4'>
                  Define which attributes your variants will have (e.g., color, storage, size)
                </Typography>
                <Alert severity='info' className='mbe-4'>
                  <Typography variant='body2'>
                    <strong>Default attributes:</strong> Color and Storage are pre-configured. Each variant must have
                    these attributes filled.
                  </Typography>
                </Alert>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'action.hover'
                      }}
                    >
                      <Typography variant='subtitle2' className='mbe-1'>
                        Color
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Code: <code>color</code> - Used for variant color identification
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'action.hover'
                      }}
                    >
                      <Typography variant='subtitle2' className='mbe-1'>
                        Storage
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Code: <code>storage</code> - Used for variant storage capacity
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Variants */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title='Product Variants'
                action={
                  <Button size='small' onClick={addVariant} startIcon={<i className='tabler-plus' />}>
                    Add Variant
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={6}>
                  {formData.variants.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                      <Typography color='text.secondary' align='center'>
                        No variants added yet. Click "Add Variant" to create one.
                      </Typography>
                    </Grid>
                  ) : (
                    formData.variants.map((variant, index) => (
                      <Grid size={{ xs: 12 }} key={index}>
                        <Box
                          sx={{
                            p: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            position: 'relative'
                          }}
                        >
                          <IconButton
                            size='small'
                            onClick={() => removeVariant(index)}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          >
                            <i className='tabler-trash' />
                          </IconButton>
                          <Typography variant='h6' className='mbe-4'>
                            Variant #{index + 1}
                          </Typography>
                          <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomTextField
                                fullWidth
                                label='Reference'
                                placeholder='IPH15-BLK-128'
                                value={variant.reference || ''}
                                onChange={e => updateVariant(index, 'reference', e.target.value)}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomTextField
                                fullWidth
                                label='EAN13'
                                placeholder='1234567890123 (13 digits)'
                                value={variant.ean13 || ''}
                                onChange={e => updateVariant(index, 'ean13', e.target.value)}
                                helperText='Must be exactly 13 digits or leave empty'
                                error={variant.ean13 && variant.ean13.length !== 13}
                              />
                            </Grid>

                            {/* Variant Attributes */}
                            <Grid size={{ xs: 12 }}>
                              <Typography variant='subtitle2' className='mbe-2'>
                                Attributes
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomTextField
                                fullWidth
                                label='Color'
                                placeholder='titanium-black'
                                value={variant.attributes?.color || ''}
                                onChange={e =>
                                  updateVariant(index, 'attributes', {
                                    ...variant.attributes,
                                    color: e.target.value
                                  })
                                }
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomTextField
                                fullWidth
                                label='Storage (GB)'
                                placeholder='256'
                                value={variant.attributes?.storage || ''}
                                onChange={e =>
                                  updateVariant(index, 'attributes', {
                                    ...variant.attributes,
                                    storage: e.target.value
                                  })
                                }
                              />
                            </Grid>

                            {/* Price and Stock */}
                            <Grid size={{ xs: 12 }}>
                              <Typography variant='subtitle2' className='mbe-2 mbs-2'>
                                Price & Stock
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomTextField
                                fullWidth
                                label='Price'
                                type='number'
                                value={variant.price?.list || 0}
                                onChange={e =>
                                  updateVariant(index, 'price', {
                                    ...variant.price,
                                    list: parseFloat(e.target.value) || 0
                                  })
                                }
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CustomTextField
                                fullWidth
                                label='Stock Quantity'
                                type='number'
                                value={variant.stock?.quantity || 0}
                                onChange={e =>
                                  updateVariant(index, 'stock', {
                                    ...variant.stock,
                                    quantity: parseInt(e.target.value) || 0
                                  })
                                }
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl fullWidth>
                                <InputLabel>Stock Status</InputLabel>
                                <Select
                                  value={variant.stock?.status || 'in_stock'}
                                  label='Stock Status'
                                  onChange={e =>
                                    updateVariant(index, 'stock', {
                                      ...variant.stock,
                                      status: e.target.value
                                    })
                                  }
                                >
                                  <MenuItem value='in_stock'>In Stock</MenuItem>
                                  <MenuItem value='out_of_stock'>Out of Stock</MenuItem>
                                  <MenuItem value='low_stock'>Low Stock</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl fullWidth>
                                <InputLabel>Condition</InputLabel>
                                <Select
                                  value={variant.condition || 'new'}
                                  label='Condition'
                                  onChange={e => updateVariant(index, 'condition', e.target.value)}
                                >
                                  <MenuItem value='new'>New</MenuItem>
                                  <MenuItem value='used'>Used</MenuItem>
                                  <MenuItem value='refurbished'>Refurbished</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={variant.is_active !== undefined ? variant.is_active : true}
                                    onChange={e => updateVariant(index, 'is_active', e.target.checked)}
                                  />
                                }
                                label='Active'
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    ))
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Right Side */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Grid container spacing={6}>
          {/* Settings */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Settings' />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                      }
                      label='Active Status'
                    />
                    <Typography variant='body2' color='text.secondary' className='mbs-1'>
                      Enable to make this product visible
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Brand */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Brand' />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>Select Brand</InputLabel>
                  <Select
                    value={formData.brand_id || ''}
                    label='Select Brand'
                    onChange={e => setFormData({ ...formData, brand_id: e.target.value })}
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    {Array.isArray(brands) &&
                      brands.map(brand => (
                        <MenuItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Categories */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Categories' />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>Select Categories</InputLabel>
                  <Select
                    multiple
                    value={formData.categories}
                    onChange={e => setFormData({ ...formData, categories: e.target.value })}
                    input={<OutlinedInput label='Select Categories' />}
                    renderValue={selected => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map(value => {
                          const category = Array.isArray(categories) ? categories.find(c => c.id === value) : null
                          return <Chip key={value} label={category?.name || value} />
                        })}
                      </Box>
                    )}
                  >
                    {Array.isArray(categories) &&
                      categories.map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Stock & Price */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title='Stock & Pricing' />
              <CardContent>
                <Grid container spacing={6}>
                  {/* Two price fields side by side */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='Taxes excluded'
                      type='number'
                      value={formData.price.list}
                      onChange={e => {
                        const priceExcluded = parseFloat(e.target.value) || 0
                        setFormData({
                          ...formData,
                          price: { ...formData.price, list: priceExcluded }
                        })
                      }}
                      slotProps={{
                        input: {
                          endAdornment: <Typography sx={{ color: 'text.secondary', ml: 1 }}>€</Typography>
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='Taxes included'
                      type='number'
                      value={
                        formData.tax.class_id
                          ? (
                              formData.price.list *
                              (1 + (taxClasses.find(t => t.id === formData.tax.class_id)?.rate || 0) / 100)
                            ).toFixed(2)
                          : formData.price.list
                      }
                      onChange={e => {
                        const priceIncluded = parseFloat(e.target.value) || 0
                        const taxRate = taxClasses.find(t => t.id === formData.tax.class_id)?.rate || 0
                        const priceExcluded = priceIncluded / (1 + taxRate / 100)
                        setFormData({
                          ...formData,
                          price: { ...formData.price, list: parseFloat(priceExcluded.toFixed(2)) }
                        })
                      }}
                      slotProps={{
                        input: {
                          endAdornment: <Typography sx={{ color: 'text.secondary', ml: 1 }}>€</Typography>
                        }
                      }}
                    />
                  </Grid>

                  {/* VAT Regime dropdown */}
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <InputLabel>VAT Regime</InputLabel>
                      <Select
                        value={taxClasses.find(t => t.id === formData.tax.class_id) ? formData.tax.class_id : ''}
                        label='VAT Regime'
                        onChange={e =>
                          setFormData({
                            ...formData,
                            tax: { ...formData.tax, class_id: e.target.value }
                          })
                        }
                      >
                        <MenuItem value=''>No Tax</MenuItem>
                        {taxClasses.map(tax => (
                          <MenuItem key={tax.id} value={tax.id}>
                            {tax.name.replace(/\s*\d+%/g, '')} ({tax.rate}%)
                          </MenuItem>
                        ))}
                      </Select>
                      {formData.tax.class_id && !taxClasses.find(t => t.id === formData.tax.class_id) && (
                        <Typography variant='caption' color='error' sx={{ mt: 1 }}>
                          Tax class ID {formData.tax.class_id} not found. Please select a valid tax class.
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label='Stock Quantity'
                      type='number'
                      value={formData.stock.quantity}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          stock: { ...formData.stock, quantity: parseInt(e.target.value) || 0 }
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <InputLabel>Stock Status</InputLabel>
                      <Select
                        value={formData.stock.status}
                        label='Stock Status'
                        onChange={e =>
                          setFormData({ ...formData, stock: { ...formData.stock, status: e.target.value } })
                        }
                      >
                        <MenuItem value='in_stock'>In Stock</MenuItem>
                        <MenuItem value='out_of_stock'>Out of Stock</MenuItem>
                        <MenuItem value='low_stock'>Low Stock</MenuItem>
                      </Select>
                    </FormControl>
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

export default ProductsAdd
