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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import Rating from '@mui/material/Rating'

// Third-party Imports
import { Bold } from '@tiptap/extension-bold'
import { Italic } from '@tiptap/extension-italic'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Strike } from '@tiptap/extension-strike'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import classnames from 'classnames'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomIconButton from '@core/components/mui/IconButton'

// Style Imports
import '@/libs/styles/tiptapEditor.css'

const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

const EditorToolbar = ({ editor }) => {
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) {
        return {
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isStrike: false,
          isLeftAligned: true,
          isCenterAligned: false,
          isRightAligned: false,
          isJustified: false
        }
      }

      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        isUnderline: ctx.editor.isActive('underline') ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        isLeftAligned: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
        isCenterAligned: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
        isRightAligned: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
        isJustified: ctx.editor.isActive({ textAlign: 'justify' }) ?? false
      }
    }
  })

  if (!editor || !editorState) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-4 pbe-4 pli-4'>
      <CustomIconButton
        {...(editorState.isBold && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className={classnames('tabler-bold', { 'text-textSecondary': !editorState.isBold })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isUnderline && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className={classnames('tabler-underline', { 'text-textSecondary': !editorState.isUnderline })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isItalic && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className={classnames('tabler-italic', { 'text-textSecondary': !editorState.isItalic })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isStrike && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className={classnames('tabler-strikethrough', { 'text-textSecondary': !editorState.isStrike })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isLeftAligned && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i className={classnames('tabler-align-left', { 'text-textSecondary': !editorState.isLeftAligned })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isCenterAligned && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i
          className={classnames('tabler-align-center', {
            'text-textSecondary': !editorState.isCenterAligned
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isRightAligned && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i
          className={classnames('tabler-align-right', {
            'text-textSecondary': !editorState.isRightAligned
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isJustified && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i
          className={classnames('tabler-align-justified', {
            'text-textSecondary': !editorState.isJustified
          })}
        />
      </CustomIconButton>
    </div>
  )
}

const ProductsAdd = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [taxClasses, setTaxClasses] = useState([])
  const [expandedCategories, setExpandedCategories] = useState([])

  const [formData, setFormData] = useState({
    product_type: 'configurable',
    reference: '',
    ean: '',
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

  // TipTap editors for rich text fields
  const titleEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        underline: false
      }),
      Placeholder.configure({
        placeholder: 'Product Title'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Bold,
      Italic,
      Strike,
      Underline
    ],
    immediatelyRender: false,
    content: formData.translation.title || '',
    onUpdate: ({ editor }) => {
      handleTranslationChange('title', editor.getText())
    }
  })

  const subTitleEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        underline: false
      }),
      Placeholder.configure({
        placeholder: 'Product Sub Title'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Bold,
      Italic,
      Strike,
      Underline
    ],
    immediatelyRender: false,
    content: formData.translation.sub_title || '',
    onUpdate: ({ editor }) => {
      handleTranslationChange('sub_title', editor.getText())
    }
  })

  const simpleDescEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        underline: false
      }),
      Placeholder.configure({
        placeholder: 'Short description'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Bold,
      Italic,
      Strike,
      Underline
    ],
    immediatelyRender: false,
    content: formData.translation.simple_description || '',
    onUpdate: ({ editor }) => {
      handleTranslationChange('simple_description', editor.getText())
    }
  })

  const metaDescEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        underline: false
      }),
      Placeholder.configure({
        placeholder: 'SEO meta description'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Bold,
      Italic,
      Strike,
      Underline
    ],
    immediatelyRender: false,
    content: formData.translation.meta_description || '',
    onUpdate: ({ editor }) => {
      handleTranslationChange('meta_description', editor.getText())
    }
  })

  // Update editors when formData changes (e.g., when loading existing product)
  useEffect(() => {
    if (titleEditor && formData.translation.title !== titleEditor.getText()) {
      titleEditor.commands.setContent(formData.translation.title || '')
    }
  }, [formData.translation.title, titleEditor])

  useEffect(() => {
    if (subTitleEditor && formData.translation.sub_title !== subTitleEditor.getText()) {
      subTitleEditor.commands.setContent(formData.translation.sub_title || '')
    }
  }, [formData.translation.sub_title, subTitleEditor])

  useEffect(() => {
    if (simpleDescEditor && formData.translation.simple_description !== simpleDescEditor.getText()) {
      simpleDescEditor.commands.setContent(formData.translation.simple_description || '')
    }
  }, [formData.translation.simple_description, simpleDescEditor])

  useEffect(() => {
    if (metaDescEditor && formData.translation.meta_description !== metaDescEditor.getText()) {
      metaDescEditor.commands.setContent(formData.translation.meta_description || '')
    }
  }, [formData.translation.meta_description, metaDescEditor])

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
        headers: { 'X-API-KEY': API_KEY },
        mode: 'cors'
      })
      if (response.ok) {
        const result = await response.json()
        // Handle both { data: [...] } and [...] response formats
        const data = result.data || result
        setBrands(Array.isArray(data) ? data : [])
      } else {
        setBrands([])
        // Don't show error to user, just log it
      }
    } catch (err) {
      setBrands([])
      // Don't show error to user
    }
  }

  const fetchCategories = async () => {
    try {
      // Use the v1 endpoint to get all categories (parent + children)
      const response = await fetch(`${API_BASE_URL}/api/v1/categories?lang=en`, {
        headers: { 'X-API-KEY': API_KEY },
        mode: 'cors'
      })
      if (response.ok) {
        const result = await response.json()
        // Handle both { data: [...] } and [...] response formats
        const data = result.data || result

        // Sort categories: parents first, then children
        const sortedCategories = Array.isArray(data)
          ? data.sort((a, b) => {
              // Parents (null parent_id) come first
              if (a.parent_id === null && b.parent_id !== null) return -1
              if (a.parent_id !== null && b.parent_id === null) return 1
              // If both are parents or both are children, sort by name
              return (a.name || '').localeCompare(b.name || '')
            })
          : []

        setCategories(sortedCategories)
      } else {
        // Set empty categories array to prevent errors
        setCategories([])
        // Don't show error to user, just log it
      }
    } catch (err) {
      // Set empty categories array to prevent errors
      setCategories([])
      // Don't show error to user
    }
  }

  const fetchTaxClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tax-classes`, {
        headers: { 'X-API-KEY': API_KEY },
        mode: 'cors'
      })
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        setTaxClasses(Array.isArray(data) ? data : [])
      } else {
        setTaxClasses([])
      }
    } catch (err) {
      setTaxClasses([])
    }
  }

  const fetchProductData = async () => {
    try {
      setFetchingData(true)
      setError('')

      // Try fetching individual product first
      let response = await fetch(`${API_BASE_URL}/api/v1/products/${editId}`, {
        headers: { 'X-API-KEY': API_KEY }
      })

      // If 404, try fetching from list with active_only=false (for inactive products)
      if (response.status === 404) {
        const listResponse = await fetch(`${API_BASE_URL}/api/v1/products?active_only=false&limit=100`, {
          headers: { 'X-API-KEY': API_KEY }
        })

        if (listResponse.ok) {
          const listResult = await listResponse.json()
          const products = listResult.data || []
          const product = products.find(p => p.id === parseInt(editId))

          if (product) {
            // Create a mock response with the product data
            response = {
              ok: true,
              json: async () => product
            }
          } else {
          }
        }
      }

      if (response.ok) {
        const result = await response.json()
        const product = result.data || result

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
          ean: product.ean || product.ean13 || '',
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
            ean: v.ean || v.ean13 || '',
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

        if (response.status === 404) {
          setError(`Product ID ${editId} not found. It may have been deleted or does not exist.`)
        } else {
          setError(`Failed to load product: ${errorData.detail || response.statusText}`)
        }
      }
    } catch (err) {
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
        headers: { 'X-API-KEY': API_KEY },
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
      ean: '',
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

      // Validate required fields: EAN and Title
      if (!formData.ean || !formData.translation.title) {
        setError('EAN and Title are required')
        setLoading(false)
        return
      }

      // Validate EAN length
      if (formData.ean && formData.ean.length > 255) {
        setError('EAN must not exceed 255 characters')
        setLoading(false)
        return
      }

      // Validate variants EAN
      for (let i = 0; i < formData.variants.length; i++) {
        const variant = formData.variants[i]
        if (variant.ean && variant.ean.length > 255) {
          setError(`Variant #${i + 1}: EAN must not exceed 255 characters`)
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
        // Note: reference is auto-populated by backend from EAN
        bodyData = {
          product_type: formData.product_type,
          ean: formData.ean || null,
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
            ean: v.ean || null,
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
        // Note: reference is auto-populated by backend from EAN
        bodyData = {
          product_type: formData.product_type,
          ean: formData.ean || null,
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
            ean: v.ean || null,
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
        setError('Invalid data format. Please check your inputs.')
        setLoading(false)
        return
      }

      const response = await fetch(url, {
        method,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
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

        let errorData = {}
        try {
          errorData = JSON.parse(responseText)
        } catch (e) {}

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
              {editId
                ? dictionary.common?.editProduct || 'Edit Product'
                : dictionary.common?.addNewProduct || 'Add a new Product'}
            </Typography>
            <Typography>{dictionary.common?.manageProductInfo || 'Manage your product information'}</Typography>
          </div>
          <div className='flex flex-wrap max-sm:flex-col gap-4'>
            <Button variant='tonal' color='secondary' onClick={() => router.push('/apps/ecommerce/products/list')}>
              {dictionary.common?.discard || 'Discard'}
            </Button>
            <Button variant='outlined' onClick={() => setPreviewOpen(true)}>
              {dictionary.common?.preview || 'Preview'}
            </Button>
            <Button variant='contained' onClick={handleSaveProduct} disabled={loading}>
              {loading
                ? editId
                  ? dictionary.common?.updating || 'Updating...'
                  : dictionary.common?.publishing || 'Publishing...'
                : editId
                  ? dictionary.common?.updateProduct || 'Update Product'
                  : dictionary.common?.publishProduct || 'Publish Product'}
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
          {/* Product Name (Title) - Moved to Top */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <CustomTextField
                  fullWidth
                  label={dictionary.common?.productName || 'Product Name'}
                  placeholder={dictionary.common?.productName || 'Product Name'}
                  value={formData.translation.title}
                  onChange={e => handleTranslationChange('title', e.target.value)}
                  required
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.basicInformation || 'Basic Information'} />
              <CardContent>
                <Grid container spacing={6}>
                  {/* Reference field removed - auto-populated by backend from EAN */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField
                      fullWidth
                      label='EAN'
                      placeholder='Product EAN code'
                      value={formData.ean || ''}
                      onChange={e => setFormData({ ...formData, ean: e.target.value })}
                      helperText={dictionary.common?.eanHelper || 'Enter product EAN code (max 255 characters)'}
                      error={formData.ean && formData.ean.length > 255}
                    />
                  </Grid>
                  {/* <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>{dictionary.common?.productType || 'Product Type'}</InputLabel>
                      <Select
                        value={formData.product_type}
                        label={dictionary.common?.productType || 'Product Type'}
                        onChange={e => setFormData({ ...formData, product_type: e.target.value })}
                      >
                        <MenuItem value='configurable'>{dictionary.common?.configurable || 'Configurable'}</MenuItem>
                        <MenuItem value='simple'>{dictionary.common?.simple || 'Simple'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid> */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField
                      select
                      fullWidth
                      label={dictionary.common?.condition || 'Condition'}
                      value={formData.condition}
                      onChange={e => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <MenuItem value='new'>{dictionary.common?.new || 'New'}</MenuItem>
                      <MenuItem value='used'>{dictionary.common?.used || 'Used'}</MenuItem>
                      <MenuItem value='refurbished'>{dictionary.common?.refurbished || 'Refurbished'}</MenuItem>
                    </CustomTextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Details */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.productDetails || 'Product Details'} />
              <CardContent>
                <Grid container spacing={6}>
                  {/* Sub Title Field */}
                  <Grid size={{ xs: 12 }}>
                    <Typography className='mbe-2' sx={{ fontWeight: 500 }}>
                      {dictionary.common?.subTitle || 'Sub Title'}
                    </Typography>
                    <Card className='p-0 border shadow-none'>
                      <CardContent className='p-0'>
                        <EditorToolbar editor={subTitleEditor} />
                        <Divider />
                        <EditorContent
                          editor={subTitleEditor}
                          className='min-bs-[60px] max-bs-[200px] overflow-y-auto flex resize-y'
                          style={{ resize: 'vertical' }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Simple Description Field */}
                  <Grid size={{ xs: 12 }}>
                    <Typography className='mbe-2' sx={{ fontWeight: 500 }}>
                      {dictionary.common?.simpleDescription || 'Simple Description'}
                    </Typography>
                    <Card className='p-0 border shadow-none'>
                      <CardContent className='p-0'>
                        <EditorToolbar editor={simpleDescEditor} />
                        <Divider />
                        <EditorContent
                          editor={simpleDescEditor}
                          className='min-bs-[100px] max-bs-[400px] overflow-y-auto flex resize-y'
                          style={{ resize: 'vertical' }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Meta Description Field */}
                  <Grid size={{ xs: 12 }}>
                    <Typography className='mbe-2' sx={{ fontWeight: 500 }}>
                      {dictionary.common?.metaDescription || 'Meta Description'}
                    </Typography>
                    <Card className='p-0 border shadow-none'>
                      <CardContent className='p-0'>
                        <EditorToolbar editor={metaDescEditor} />
                        <Divider />
                        <EditorContent
                          editor={metaDescEditor}
                          className='min-bs-[80px] max-bs-[300px] overflow-y-auto flex resize-y'
                          style={{ resize: 'vertical' }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Images */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader
                title={dictionary.common?.productImages || 'Product Images'}
                action={
                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<i className='tabler-upload' />}
                    onClick={() => document.getElementById('product-images-input').click()}
                    disabled={uploadingImage}
                  >
                    {dictionary.common?.uploadImages || 'Upload Images'}
                  </Button>
                }
              />
              <CardContent>
                {uploadingImage && (
                  <Box display='flex' alignItems='center' justifyContent='center' gap={2} mb={3}>
                    <CircularProgress size={24} />
                    <Typography variant='body2' color='text.secondary'>
                      {dictionary.common?.uploadingImages || 'Uploading images...'}
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
                              height: 'auto',
                              aspectRatio: '1',
                              objectFit: 'contain',
                              display: 'block',
                              bgcolor: 'background.paper'
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
                      {dictionary.common?.noImagesUploaded || 'No images uploaded'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' align='center'>
                      {dictionary.common?.clickToUploadImages || 'Click to upload multiple images'}
                      <br />
                      {dictionary.common?.supportedFormats || 'Supported: JPEG, PNG, WEBP (max 5MB each)'}
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
              <CardHeader title={dictionary.common?.variantAttributes || 'Variant Attributes'} />
              <CardContent>
                <Typography variant='body2' color='text.secondary' className='mbe-4'>
                  {dictionary.common?.variantAttributesDesc ||
                    'Define which attributes your variants will have (e.g., color, storage, size)'}
                </Typography>
                <Alert severity='info' className='mbe-4'>
                  <Typography variant='body2'>
                    <strong>{dictionary.common?.defaultAttributes || 'Default attributes'}:</strong>{' '}
                    {dictionary.common?.colorStoragePreConfig ||
                      'Color and Storage are pre-configured. Each variant must have these attributes filled.'}
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
                        {dictionary.common?.color || 'Color'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {dictionary.common?.colorCodeDesc || 'Code:'} <code>color</code> -{' '}
                        {dictionary.common?.usedForColorId || 'Used for variant color identification'}
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
                        {dictionary.common?.storage || 'Storage'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {dictionary.common?.colorCodeDesc || 'Code:'} <code>storage</code> -{' '}
                        {dictionary.common?.usedForStorageCapacity || 'Used for variant storage capacity'}
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
                title={dictionary.common?.productVariants || 'Product Variants'}
                action={
                  <Button size='small' onClick={addVariant} startIcon={<i className='tabler-plus' />}>
                    {dictionary.common?.addVariant || 'Add Variant'}
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={6}>
                  {formData.variants.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                      <Typography color='text.secondary' align='center'>
                        {dictionary.common?.noVariantsMessage ||
                          'No variants added yet. Click "Add Variant" to create one.'}
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
                                label='EAN'
                                placeholder='Product EAN code'
                                value={variant.ean || ''}
                                onChange={e => updateVariant(index, 'ean', e.target.value)}
                                helperText='Enter product EAN code (max 255 characters)'
                                error={variant.ean && variant.ean.length > 255}
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
                                placeholder='0'
                                value={(variant.price?.list || 0) === 0 ? '' : variant.price?.list || 0}
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
                                placeholder='0'
                                value={(variant.stock?.quantity || 0) === 0 ? '' : variant.stock?.quantity || 0}
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
              <CardHeader title={dictionary.common?.settings || 'Settings'} />
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
              <CardHeader title={dictionary.common?.brand || 'Brand'} />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>{dictionary.common?.selectBrand || 'Select Brand'}</InputLabel>
                  <Select
                    value={formData.brand_id || ''}
                    label={dictionary.common?.selectBrand || 'Select Brand'}
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
              <CardHeader title={dictionary.common?.categories || 'Categories'} />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>{dictionary.common?.selectCategories || 'Select Categories'}</InputLabel>
                  <Select
                    multiple
                    value={formData.categories}
                    onChange={e => setFormData({ ...formData, categories: e.target.value })}
                    input={<OutlinedInput label={dictionary.common?.selectCategories || 'Select Categories'} />}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 400
                        }
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
                          const category = Array.isArray(categories) ? categories.find(c => c.id === value) : null
                          return (
                            <Chip
                              key={value}
                              label={category?.name || value}
                              size='small'
                              onDelete={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                const newCategories = formData.categories.filter(id => id !== value)
                                setFormData({ ...formData, categories: newCategories })
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
                                    const newCategories = formData.categories.filter(id => id !== value)
                                    setFormData({ ...formData, categories: newCategories })
                                  }}
                                />
                              }
                            />
                          )
                        })}
                      </Box>
                    )}
                  >
                    {Array.isArray(categories) &&
                      categories
                        .filter(cat => cat.parent_id === null)
                        .map(parentCategory => {
                          const isExpanded = expandedCategories.includes(parentCategory.id)
                          const children = categories.filter(c => c.parent_id === parentCategory.id)

                          return [
                            <MenuItem
                              key={parentCategory.id}
                              value={parentCategory.id}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              {children.length > 0 && (
                                <IconButton
                                  size='small'
                                  onClick={e => {
                                    e.stopPropagation()
                                    setExpandedCategories(prev =>
                                      prev.includes(parentCategory.id)
                                        ? prev.filter(id => id !== parentCategory.id)
                                        : [...prev, parentCategory.id]
                                    )
                                  }}
                                  sx={{ p: 0, minWidth: 20 }}
                                >
                                  <i
                                    className={isExpanded ? 'tabler-chevron-down' : 'tabler-chevron-right'}
                                    style={{ fontSize: '1rem' }}
                                  />
                                </IconButton>
                              )}
                              {children.length === 0 && <Box sx={{ width: 20 }} />}
                              {parentCategory.name}
                            </MenuItem>,

                            ...(isExpanded
                              ? children.map(child => (
                                  <MenuItem
                                    key={child.id}
                                    value={child.id}
                                    sx={{
                                      pl: 6,
                                      fontWeight: 400,
                                      fontSize: '0.875rem',
                                      color: 'text.secondary'
                                    }}
                                  >
                                    {child.name}
                                  </MenuItem>
                                ))
                              : [])
                          ]
                        })
                        .flat()}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Stock & Price */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title={dictionary.common?.stockAndPricing || 'Stock & Pricing'} />
              <CardContent>
                <Grid container spacing={6}>
                  {/* Two price fields side by side */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomTextField
                      fullWidth
                      label={dictionary.common?.taxesExcluded || 'Taxes excluded'}
                      type='number'
                      placeholder='0'
                      value={formData.price.list === 0 ? '' : formData.price.list}
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
                      label={dictionary.common?.taxesIncluded || 'Taxes included'}
                      type='number'
                      placeholder='0'
                      value={
                        formData.tax.class_id
                          ? (() => {
                              const calculated = (
                                formData.price.list *
                                (1 + (taxClasses.find(t => t.id === formData.tax.class_id)?.rate || 0) / 100)
                              ).toFixed(2)
                              return calculated === '0.00' ? '' : calculated
                            })()
                          : formData.price.list === 0
                            ? ''
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
                      <InputLabel>{dictionary.common?.vatRegime || 'VAT Regime'}</InputLabel>
                      <Select
                        value={taxClasses.find(t => t.id === formData.tax.class_id) ? formData.tax.class_id : ''}
                        label={dictionary.common?.vatRegime || 'VAT Regime'}
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
                      label={dictionary.common?.stockQuantity || 'Stock Quantity'}
                      type='number'
                      placeholder='0'
                      value={formData.stock.quantity === 0 ? '' : formData.stock.quantity}
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
                      <InputLabel>{dictionary.common?.stockStatus || 'Stock Status'}</InputLabel>
                      <Select
                        value={formData.stock.status}
                        label={dictionary.common?.stockStatus || 'Stock Status'}
                        onChange={e =>
                          setFormData({ ...formData, stock: { ...formData.stock, status: e.target.value } })
                        }
                      >
                        <MenuItem value='in_stock'>{dictionary.common?.inStock || 'In Stock'}</MenuItem>
                        <MenuItem value='out_of_stock'>{dictionary.common?.outOfStock || 'Out of Stock'}</MenuItem>
                        <MenuItem value='low_stock'>{dictionary.common?.lowStock || 'Low Stock'}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Preview Drawer */}
      <Drawer
        anchor='right'
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '500px', md: '600px' },
            maxWidth: '100%'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 4,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            Product Preview
          </Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
          {!formData.translation.title ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant='h6' color='text.secondary' sx={{ mb: 1 }}>
                📝 No Product Data
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Fill in product details to see preview
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Main Image with Navigation */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: '300px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: 'divider',
                    position: 'relative'
                  }}
                >
                  {formData.images.length > 0 ? (
                    <>
                      <img
                        src={formData.images[selectedImageIndex]?.url || formData.images[selectedImageIndex]}
                        alt={formData.translation.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />

                      {/* Navigation Arrows */}
                      {formData.images.length > 1 && (
                        <>
                          <IconButton
                            onClick={() =>
                              setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : formData.images.length - 1))
                            }
                            sx={{
                              position: 'absolute',
                              left: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              '&:hover': { backgroundColor: 'white' },
                              boxShadow: 2
                            }}
                          >
                            <i className='tabler-chevron-left' />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              setSelectedImageIndex(prev => (prev < formData.images.length - 1 ? prev + 1 : 0))
                            }
                            sx={{
                              position: 'absolute',
                              right: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              '&:hover': { backgroundColor: 'white' },
                              boxShadow: 2
                            }}
                          >
                            <i className='tabler-chevron-right' />
                          </IconButton>

                          {/* Image Counter */}
                          <Chip
                            label={`${selectedImageIndex + 1} / ${formData.images.length}`}
                            size='small'
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'white'
                            }}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h4' sx={{ mb: 1 }}>
                        📷
                      </Typography>
                      <Typography color='text.secondary'>No Image</Typography>
                    </Box>
                  )}
                </Box>

                {/* Thumbnail Gallery */}
                {formData.images.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                    {formData.images.map((img, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        sx={{
                          minWidth: '60px',
                          width: '60px',
                          height: '60px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: idx === selectedImageIndex ? '3px solid' : '2px solid',
                          borderColor: idx === selectedImageIndex ? 'primary.main' : 'divider',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <img
                          src={img.url || img}
                          alt={`thumb-${idx}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Product Name */}
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                {formData.translation.title}
              </Typography>

              {/* Sub Title */}
              {formData.translation.sub_title && (
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  {formData.translation.sub_title}
                </Typography>
              )}

              {/* Brand */}
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Brand:{' '}
                {formData.brand_id ? brands.find(b => b.id === formData.brand_id)?.name || 'No brand' : 'No brand'}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={4.5} precision={0.5} readOnly size='small' />
                <Typography variant='caption' color='text.secondary'>
                  4.5 (128 reviews)
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Price */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Typography variant='h4' sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {formData.price.list !== null && formData.price.list !== undefined
                      ? `€${formData.price.list}`
                      : 'Price not available'}
                  </Typography>
                  {formData.tax?.included_in_price && (
                    <Chip label='Tax Included' size='small' variant='outlined' color='success' />
                  )}
                </Box>
                {/* Price without tax */}
                {formData.price.list && formData.tax?.included_in_price && (
                  <Typography variant='body2' sx={{ color: 'error.main', fontWeight: 500 }}>
                    €{(parseFloat(formData.price.list) * 0.82).toFixed(2)} (excl. tax)
                  </Typography>
                )}
              </Box>

              {/* Stock & Condition */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={formData.stock.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                  color={formData.stock.status === 'in_stock' ? 'success' : 'error'}
                  size='small'
                />
                {formData.stock.quantity > 0 && (
                  <Chip label={`${formData.stock.quantity} available`} size='small' variant='outlined' />
                )}
                {formData.condition && (
                  <Chip
                    label={formData.condition.charAt(0).toUpperCase() + formData.condition.slice(1)}
                    size='small'
                    variant='outlined'
                  />
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button variant='contained' fullWidth size='large' sx={{ fontWeight: 600 }}>
                  🛒 Add to Cart
                </Button>
                <Button variant='outlined' size='large'>
                  ♡
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Description */}
              {formData.translation.simple_description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                    📝 Description
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.7 }}>
                    {formData.translation.simple_description}
                  </Typography>
                </Box>
              )}

              {/* Meta Description */}
              {formData.translation.meta_description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                    🔍 Meta Description (SEO)
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.7, fontStyle: 'italic' }}>
                    {formData.translation.meta_description.substring(0, 160)}
                    {formData.translation.meta_description.length > 160 ? '...' : ''}
                  </Typography>
                </Box>
              )}

              {/* Categories */}
              {formData.categories.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                    🏷️ Categories
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {formData.categories.map(catId => {
                      const category = categories.find(c => c.id === catId)
                      return category ? (
                        <Chip key={catId} label={category.name} size='small' sx={{ fontWeight: 500 }} />
                      ) : null
                    })}
                  </Box>
                </Box>
              )}

              {/* Additional Info */}
              <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, mt: 2 }}>
                <Grid container spacing={2}>
                  {formData.reference && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Reference
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {formData.reference}
                      </Typography>
                    </Grid>
                  )}
                  {formData.ean && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant='caption' color='text.secondary'>
                        EAN
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {formData.ean}
                      </Typography>
                    </Grid>
                  )}
                  {/* <Grid size={{ xs: 6 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Product Type
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {formData.product_type.charAt(0).toUpperCase() + formData.product_type.slice(1)}
                    </Typography>
                  </Grid> */}
                  <Grid size={{ xs: 6 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Status
                    </Typography>
                    <Chip
                      label={formData.is_active ? 'Active' : 'Inactive'}
                      color={formData.is_active ? 'success' : 'error'}
                      size='small'
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </Grid>
  )
}

export default ProductsAdd
