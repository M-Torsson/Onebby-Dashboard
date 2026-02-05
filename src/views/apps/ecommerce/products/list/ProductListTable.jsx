// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

'use client'

// React Imports
import { useEffect, useMemo, useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import TableFilters from './TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Config Imports
import { API_BASE_URL, API_KEY } from '@/configs/apiConfig'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const ADMIN_BASE_URL = `${API_BASE_URL}/api/admin`
const CATEGORIES_BASE_URL = `${API_BASE_URL}/api/v1/categories`

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Custom global filter function that searches by name or ID
const productGlobalFilter = (row, _columnId, value) => {
  const query = String(value ?? '')
    .trim()
    .toLowerCase()

  // If no search query, return all rows
  if (!query) return true

  const original = row.original || {}

  // Search in: ID, product name, and product ID field
  const searchFields = [
    String(original.id ?? ''),
    String(original.productName ?? ''),
    String(original.productId ?? '')
  ].map(v => v.toLowerCase())

  // Return true if any field contains the search query
  return searchFields.some(field => field.includes(query))
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 250, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const productStatusObj = {
  Scheduled: { title: 'Scheduled', color: 'warning' },
  Published: { title: 'Publish', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper()

const ProductListTable = ({ productData, dictionary = { navigation: {}, common: {} } }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // Server-side pagination states
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Category filter
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')

  // Extra filters (client-side)
  const [statusFilter, setStatusFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()

  // Cache for fast text search across large product catalogs
  const allProductsTotalRef = useRef(null)
  const productPageCacheRef = useRef(new Map()) // pageIndex -> { ts: number, products: any[] }
  const nameSearchAbortRef = useRef(null)

  const PAGE_CACHE_TTL_MS = 60 * 1000

  const getCachedPage = pageIndex => {
    const entry = productPageCacheRef.current.get(pageIndex)

    if (!entry) {
      return null
    }

    if (!entry.ts || Date.now() - entry.ts > PAGE_CACHE_TTL_MS) {
      productPageCacheRef.current.delete(pageIndex)

      return null
    }

    return entry.products
  }

  const setCachedPage = (pageIndex, products) => {
    productPageCacheRef.current.set(pageIndex, { ts: Date.now(), products: Array.isArray(products) ? products : [] })
  }

  useEffect(() => {
    allProductsTotalRef.current = null
    productPageCacheRef.current = new Map()

    if (nameSearchAbortRef.current) {
      try {
        nameSearchAbortRef.current.abort()
      } catch {
        // ignore
      }
      nameSearchAbortRef.current = null
    }
  }, [locale, categoryId])

  useEffect(() => {
    let cancelled = false

    const getCategoryNameForLocale = (c, lang) => {
      const translations = Array.isArray(c?.translations) ? c.translations : []
      const want = String(lang || '').toLowerCase()
      const exact = translations.find(t => String(t?.lang || '').toLowerCase() === want)
      if (exact?.name) return String(exact.name)

      const en = translations.find(t => String(t?.lang || '').toLowerCase() === 'en')
      if (en?.name) return String(en.name)

      return String(c?.name ?? '').trim()
    }

    const fetchAllCategories = async () => {
      try {
        const langParam = encodeURIComponent(locale || 'it')
        const limit = 500
        let skip = 0
        let all = []

        for (let i = 0; i < 10; i++) {
          const url = `${CATEGORIES_BASE_URL}?skip=${skip}&limit=${limit}&lang=${langParam}&active_only=false&parent_only=false`
          const response = await fetch(url)
          if (!response.ok) break

          const result = await response.json().catch(() => ({}))
          const items = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : []
          const meta = result?.meta || {}

          all = all.concat(items)

          const hasNext = Boolean(meta?.has_next)
          const total = typeof meta?.total === 'number' ? meta.total : null

          if (hasNext) {
            skip += limit
            continue
          }

          if (total != null && all.length < total) {
            skip += limit
            continue
          }

          break
        }

        const normalized = all
          .filter(c => c && c.id != null)
          .map(c => ({
            ...c,
            id: c.id,
            parent_id: c.parent_id ?? null,
            name: getCategoryNameForLocale(c, locale || 'it')
          }))

        if (!cancelled) setCategories(normalized)
      } catch {
        if (!cancelled) setCategories([])
      }
    }

    fetchAllCategories()

    return () => {
      cancelled = true
    }
  }, [locale])

  // Fetch products from API with SMART server-side search
  const fetchProducts = async (currentPage = 0, currentPageSize = 10, searchQuery = '') => {
    try {
      setLoading(true)
      setError('')

      const query = (searchQuery ?? '').trim()
      const langParam = encodeURIComponent(locale || 'it')
      const searchLangParam = encodeURIComponent('en')
      const headers = { 'X-API-KEY': API_KEY }
      const categoryParam = categoryId ? `&category_id=${encodeURIComponent(categoryId)}` : ''

      const getProductTitleForSearch = product => {
        const directTitle = String(product?.title ?? product?.name ?? '')
        if (directTitle) return directTitle

        const translations = Array.isArray(product?.translations) ? product.translations : []
        if (!translations.length) return ''

        const localeTranslation = translations.find(t => t?.lang === (locale || 'it'))
        if (localeTranslation?.title) return String(localeTranslation.title)

        const enTranslation = translations.find(t => t?.lang === 'en')
        if (enTranslation?.title) return String(enTranslation.title)

        const anyTitle = translations.find(t => t?.title)

        return anyTitle?.title ? String(anyTitle.title) : ''
      }

      const tryBackendSearch = async () => {
        const url = `${API_BASE_URL}/api/v1/products?active_only=false&skip=0&limit=${Math.max(10, currentPageSize)}&lang=${searchLangParam}&search=${encodeURIComponent(query)}${categoryParam}`
        const response = await fetch(url, { headers })

        if (!response.ok) return null

        const result = await response.json().catch(() => ({}))
        const items = Array.isArray(result?.data) ? result.data : []
        const total = result?.meta?.total

        if (!items.length && !(typeof total === 'number' && total > 0)) return null

        const formattedResult = { data: items, meta: { total: typeof total === 'number' ? total : items.length } }

        return { ok: true, json: async () => formattedResult }
      }

      const tryAdminTitleSearchEndpoint = async () => {
        // This endpoint exists per OpenAPI and is NOT shadowed by /products/{product_id}.
        // Requires X-API-KEY.
        const localeLang = String(locale || 'it').toLowerCase()
        const supportedLang = ['it', 'en', 'fr', 'de', 'ar'].includes(localeLang) ? localeLang : 'en'

        const doRequest = async lang => {
          const url = `${API_BASE_URL}/api/admin/products/search-by-title?title=${encodeURIComponent(query)}&lang=${encodeURIComponent(lang)}&limit=50`
          const response = await fetch(url, { headers: { 'X-API-KEY': API_KEY } })
          if (!response.ok) return null
          return await response.json().catch(() => ({}))
        }

        let result = await doRequest(supportedLang)
        if (!result) return null

        let raw =
          (Array.isArray(result?.data) && result.data) ||
          (Array.isArray(result?.results) && result.results) ||
          (Array.isArray(result?.items) && result.items) ||
          (Array.isArray(result) && result) ||
          []

        // If locale search returns nothing, retry in English (many records only have EN titles).
        if (!raw.length && supportedLang !== 'en') {
          const enResult = await doRequest('en')
          if (enResult) {
            result = enResult
            raw =
              (Array.isArray(result?.data) && result.data) ||
              (Array.isArray(result?.results) && result.results) ||
              (Array.isArray(result?.items) && result.items) ||
              (Array.isArray(result) && result) ||
              []
          }
        }

        if (!raw.length) return null

        // Normalize into the shape expected by processProducts (it can handle extra fields too).
        const normalized = raw
          .map(item => {
            const priceList =
              typeof item?.price_list === 'number'
                ? item.price_list
                : typeof item?.price?.list === 'number'
                  ? item.price.list
                  : null

            const currency = item?.currency || item?.price?.currency || 'EUR'
            const stockQuantity =
              typeof item?.stock_quantity === 'number'
                ? item.stock_quantity
                : typeof item?.stock?.quantity === 'number'
                  ? item.stock.quantity
                  : 0

            return {
              ...item,
              id: item?.id,
              reference: item?.reference || '',
              ean: item?.ean || item?.ean13 || '',
              title: item?.title || '',
              is_active: item?.is_active,
              stock: item?.stock || { quantity: stockQuantity },
              price:
                typeof priceList === 'number'
                  ? {
                      list: priceList,
                      currency
                    }
                  : item?.price ?? null
            }
          })
          .filter(p => p?.id !== undefined && p?.id !== null)

        if (!normalized.length) return null

        // Client-side slice for pagination (endpoint returns at most 50)
        const start = currentPage * currentPageSize
        const pageItems = normalized.slice(start, start + currentPageSize)

        const total =
          typeof result?.total === 'number'
            ? result.total
            : typeof result?.meta?.total === 'number'
              ? result.meta.total
              : normalized.length

        const formattedResult = {
          data: pageItems,
          meta: {
            total
          }
        }

        return { ok: true, json: async () => formattedResult }
      }

      const fetchAllProductsTotal = async () => {
        if (typeof allProductsTotalRef.current === 'number') return allProductsTotalRef.current

        const response = await fetch(
          `${API_BASE_URL}/api/v1/products?active_only=false&skip=0&limit=1&lang=${langParam}`,
          { headers }
        )

        if (!response.ok) {
          allProductsTotalRef.current = 0
          return 0
        }

        const result = await response.json().catch(() => ({}))
        const total = result?.meta?.total
        allProductsTotalRef.current = typeof total === 'number' ? total : 0

        return allProductsTotalRef.current
      }

      const buildAlternatingPageOrder = maxPages => {
        const order = []
        let left = 0
        let right = maxPages - 1

        while (left <= right) {
          order.push(left)
          if (left !== right) order.push(right)
          left += 1
          right -= 1
        }

        return order
      }

      if (query) {
        const isNumericSearch = /^\d+$/.test(query)

        // Avoid expensive full-catalog scans for very short text queries
        if (!isNumericSearch && query.length < 3) {
          setData([])
          setFilteredData([])
          setTotalCount(0)
          setLoading(false)
          return
        }

        // Direct ID search (fast path)
        if (isNumericSearch) {
          const response = await fetch(`${API_BASE_URL}/api/v1/products/${query}?lang=${langParam}`, {
            headers
          })

          if (response.ok) {
            const result = await response.json()
            const product = result.data || result
            const formattedResult = { data: [product], meta: { total: 1 } }
            const mockResponse = { ok: true, json: async () => formattedResult }

            return await processProducts(mockResponse, 0, currentPageSize, '', false)
          }
          // If 404: it might be a reference/EAN (numeric) not a product id; fall back to the scan below.
        }

        // Try backend search param first (fast path when supported by API)
        const backendSearchResponse = await tryBackendSearch()
        if (backendSearchResponse) {
          return await processProducts(backendSearchResponse, currentPage, currentPageSize, '', false)
        }

        // Fast title search endpoint (case-insensitive partial match)
        const adminTitleSearchResponse = await tryAdminTitleSearchEndpoint()
        if (adminTitleSearchResponse) {
          return await processProducts(adminTitleSearchResponse, currentPage, currentPageSize, '', false)
        }

        // Text search (name/reference) across large catalog: progressive scan with caching.
        // This avoids fetching thousands of products on every keystroke.
        if (nameSearchAbortRef.current) {
          try {
            nameSearchAbortRef.current.abort()
          } catch {
            // ignore
          }
        }

        const controller = new AbortController()
        nameSearchAbortRef.current = controller

        const batchSize = 500
        const totalProducts = await fetchAllProductsTotal()
        const maxPages = Math.max(1, Math.ceil(totalProducts / batchSize))
        const order = buildAlternatingPageOrder(maxPages)

        const q = query.toLowerCase()
        const neededCount = (currentPage + 1) * currentPageSize
        const matches = []

        const maxScanPages = 10
        const maxScanMs = 12_000
        const scanStart = Date.now()
        let scannedPages = 0

        for (const pageIndex of order) {
          if (controller.signal.aborted) {
            setLoading(false)

            return
          }

          if (Date.now() - scanStart > maxScanMs || scannedPages >= maxScanPages) {
            break
          }

          const forceRefresh = pageIndex === 0 || pageIndex === maxPages - 1

          // Fetch page if not cached (or cache expired)
          if (forceRefresh || !getCachedPage(pageIndex)) {
            const skip = pageIndex * batchSize
            const response = await fetch(
              `${API_BASE_URL}/api/v1/products?active_only=false&skip=${skip}&limit=${batchSize}&lang=${searchLangParam}`,
              { headers, signal: controller.signal }
            )

            scannedPages += 1

            if (!response.ok) {
              setCachedPage(pageIndex, [])
            } else {
              const result = await response.json().catch(() => ({}))
              setCachedPage(pageIndex, Array.isArray(result?.data) ? result.data : [])
            }
          }

          const products = getCachedPage(pageIndex) || []

          for (const p of products) {
            const title = getProductTitleForSearch(p).toLowerCase()
            const reference = String(p?.reference ?? '').toLowerCase()
            const ean = String(p?.ean ?? p?.ean13 ?? '').toLowerCase()
            const idStr = String(p?.id ?? '').toLowerCase()

            if (title.includes(q) || reference.includes(q) || ean.includes(q) || idStr.includes(q)) {
              matches.push(p)
            }
          }

          // Stop early once we have enough to render the requested page
          if (matches.length >= neededCount) break
        }

        const start = currentPage * currentPageSize
        const pageItems = matches.slice(start, start + currentPageSize)

        if (!pageItems.length) {
          setData([])
          setFilteredData([])
          setTotalCount(0)
          setLoading(false)

          setError(
            dictionary.common?.nameSearchLimited ||
              'Name search can be slow/limited due to API constraints. Try searching by ID or Reference/EAN instead.'
          )

          return
        }

        // We don't know the real total matches without scanning all pages.
        // Provide an approximate total that enables pagination while we scan more on demand.
        const scannedAllPages = productPageCacheRef.current.size >= maxPages
        const hasMore = !scannedAllPages && matches.length >= neededCount
        const approxTotal = hasMore ? start + pageItems.length + 1 : matches.length

        const mockResult = { data: pageItems, meta: { total: approxTotal } }
        const mockResponse = { ok: true, json: async () => mockResult }

        return await processProducts(mockResponse, currentPage, currentPageSize, '', false)
      }

      // Normal pagination
      const skip = currentPage * currentPageSize
      const apiUrl = `${API_BASE_URL}/api/v1/products?active_only=false&skip=${skip}&limit=${currentPageSize}&lang=${langParam}${categoryParam}`
      const response = await fetch(apiUrl, { headers })

      return await processProducts(response, currentPage, currentPageSize, '', false)
    } catch (err) {
      // Aborts are expected when the user types quickly (we cancel the previous in-flight search).
      // Don't surface them as errors.
      if (err?.name === 'AbortError' || String(err?.message || '').toLowerCase().includes('aborted')) {
        setLoading(false)

        return
      }

      setError(`Network error: ${err.message}`)
      setLoading(false)
    }
  }

  // Process products helper function
  const processProducts = async (response, currentPage, currentPageSize, searchQuery, fetchAllProducts) => {
    try {
      if (response.ok) {
        const result = await response.json()

        // Get products and total count from result
        const products = result.data || []
        const total = result.meta?.total || products.length

        // Only fetch stock for displayed products, not all products
        const productsToProcess = products

        // Fetch stock data only for products that will be displayed
        const productsWithStock = await Promise.all(
          productsToProcess.map(async product => {
            // Skip stock fetch when searching - will fetch later for displayed items only
            if (fetchAllProducts) {
              return product
            }

            // List endpoint usually includes stock; avoid extra network calls when present
            if (product?.stock && typeof product.stock.quantity === 'number') {
              return product
            }

            try {
              const stockResponse = await fetch(`${API_BASE_URL}/api/v1/products/${product.id}/stock`, {
                headers: { 'X-API-KEY': API_KEY }
              })

              if (stockResponse.ok) {
                const stockData = await stockResponse.json()
                return { ...product, stock_data: stockData }
              }
            } catch (error) {
              // Error fetching stock
            }
            return product
          })
        )

        // Format products data with stock information
        const formattedData = productsWithStock.map(product => {
          // Get stock quantity from stock_data or stock object
          let stockQuantity = 0
          if (product.stock_data?.stock_quantity !== undefined) {
            stockQuantity = product.stock_data.stock_quantity
          } else if (product.stock?.quantity !== undefined) {
            stockQuantity = product.stock.quantity
          }

          // Get image
          let productImage = '/images/misc/no-image.png'
          if (product.image) {
            productImage = product.image
          } else if (product.images && product.images.length > 0) {
            productImage = product.images[0].url || product.images[0]
          }

          // Get title from translations or direct title
          let productTitle = product.title || product.name || 'N/A'
          if (product.translations && product.translations.length > 0) {
            const enTranslation = product.translations.find(t => t.lang === 'en')
            productTitle = enTranslation?.title || product.translations[0].title || productTitle
          }

          // Get product_type from API
          const productType = product.product_type || 'N/A'

          // Get price with NULL handling
          // API returns price as object { list: number, currency: string } or direct number
          let productPrice = 'Price not available'
          if (product.price !== null && product.price !== undefined) {
            if (typeof product.price === 'object' && product.price.list !== undefined) {
              productPrice = `€${product.price.list}`
            } else if (typeof product.price === 'number') {
              productPrice = `€${product.price}`
            }
          }

          // Get brand with NULL handling
          // API returns brand as object { id, name } or brand_id separately
          let brandName = 'No brand'
          if (product.brand && product.brand.name) {
            brandName = product.brand.name
          } else if (product.brand_name) {
            brandName = product.brand_name
          }

          return {
            id: product.id,
            productName: productTitle,
            productId: `ID: ${product.id}`,
            image: productImage,
            quantity: stockQuantity,
            reference: product.reference || '',
            type: productType.toUpperCase().replace(/ /g, '_'),
            price: productPrice,
            brand: brandName,
            isActive: product.is_active !== undefined ? product.is_active : false,
            status: product.is_active ? 'Published' : 'Inactive'
          }
        })

        const productStockObj = {
          'In Stock': true,
          'Out of Stock': false
        }

        const finalData = formattedData.filter(item => {
          if (statusFilter && String(item.status) !== String(statusFilter)) return false

          if (stockFilter) {
            const wantInStock = productStockObj[String(stockFilter)]
            const isInStock = Number(item.quantity || 0) > 0
            if (wantInStock === true && !isInStock) return false
            if (wantInStock === false && isInStock) return false
          }

          return true
        })

        setTotalCount(total)
        setData(finalData)
        setFilteredData(finalData)
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))

        // Handle error - could be string, object, or array
        let errorMessage = 'Failed to load products'
        if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.detail) {
          // Handle {detail: "message"} format
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else if (Array.isArray(errorData.detail)) {
            // Handle array of error objects
            errorMessage = errorData.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
          } else {
            errorMessage = JSON.stringify(errorData.detail)
          }
        } else if (Array.isArray(errorData)) {
          // Handle array of errors directly
          errorMessage = errorData.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
        } else if (errorData.message) {
          errorMessage = errorData.message
        }

        setError(`${errorMessage} (Status: ${response.status})`)
      }
    } catch (err) {
      console.error('Process error:', err)
      setError(`Error processing products: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(page, pageSize, globalFilter)
  }, [page, pageSize, globalFilter, categoryId])

  useEffect(() => {
    setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  // Toggle Stock Status
  const handleToggleStock = async product => {
    try {
      const newIsActive = !product.isActive

      // Update active status
      const updateData = {
        is_active: newIsActive
      }

      // Send PUT request to admin endpoint
      const response = await fetch(`${ADMIN_BASE_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        fetchProducts()
      } else {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          alert(`Failed to update status: ${errorData.detail || 'Unknown error'}`)
        } catch {
          alert(`Failed to update status: ${errorText || 'Unknown error'}`)
        }
      }
    } catch (err) {
      alert(`Network error: ${err.message}`)
    }
  }

  // Delete Product
  const handleDeleteProduct = product => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      const deleteUrl = `${API_BASE_URL}/api/admin/products/${productToDelete.id}`

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'X-API-KEY': API_KEY }
      })

      if (response.ok) {
        setSuccess('Product deleted successfully!')
        setDeleteDialogOpen(false)
        setProductToDelete(null)
        // Add small delay to ensure backend processes the deletion
        setTimeout(() => {
          fetchProducts()
        }, 500)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || errorData.message || 'Failed to delete product')
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('productName', {
        header: dictionary.common?.product || 'Product',
        cell: ({ row }) => (
          <div className='flex items-center gap-4' style={{ minWidth: '200px', maxWidth: '280px' }}>
            <div
              className='flex items-center justify-center bg-actionHover rounded'
              style={{ width: '38px', height: '38px', flexShrink: 0 }}
            >
              <i className='tabler-photo text-2xl text-textSecondary' />
            </div>
            <div
              className='flex flex-col'
              style={{ cursor: 'pointer', overflow: 'hidden', flex: 1 }}
              onClick={() =>
                router.push(getLocalizedUrl(`/apps/ecommerce/products/add?edit=${row.original.id}`, locale))
              }
              onMouseEnter={e => {
                e.currentTarget.querySelector('.product-name').style.color = 'var(--mui-palette-primary-main)'
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelector('.product-name').style.color = ''
              }}
            >
              <Typography
                className='font-medium product-name'
                color='text.primary'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
                title={row.original.productName}
              >
                {row.original.productName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {row.original.productId}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('quantity', {
        header: dictionary.common?.quantity || 'Quantity',
        cell: ({ row }) => (
          <Typography
            sx={{
              whiteSpace: 'nowrap',
              color: 'success.main',
              fontWeight: 500
            }}
          >
            {row.original.quantity}
          </Typography>
        )
      }),
      columnHelper.accessor('reference', {
        header: dictionary.common?.reference || 'Reference',
        cell: ({ row }) => (
          <Typography
            color='text.secondary'
            sx={{
              maxWidth: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={row.original.reference}
          >
            {row.original.reference}
          </Typography>
        )
      }),
      // columnHelper.accessor('type', {
      //   header: dictionary.common?.type || 'Type',
      //   cell: ({ row }) => <Typography sx={{ whiteSpace: 'nowrap' }}>{row.original.type}</Typography>
      // }),
      columnHelper.accessor('brand', {
        header: dictionary.common?.brand || 'Brand',
        cell: ({ row }) => (
          <Typography
            color={row.original.brand === 'No brand' ? 'text.secondary' : 'text.primary'}
            sx={{ fontStyle: row.original.brand === 'No brand' ? 'italic' : 'normal' }}
          >
            {row.original.brand}
          </Typography>
        )
      }),
      columnHelper.accessor('price', {
        header: dictionary.common?.price || 'Price',
        cell: ({ row }) => (
          <Typography
            color={row.original.price === 'Price not available' ? 'text.secondary' : 'text.primary'}
            sx={{ fontStyle: row.original.price === 'Price not available' ? 'italic' : 'normal' }}
          >
            {row.original.price}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: dictionary.common?.status || 'Status',
        cell: ({ row }) => (
          <Chip
            label={productStatusObj[row.original.status].title}
            variant='tonal'
            color={productStatusObj[row.original.status].color}
            size='small'
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: dictionary.common?.actions || 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <Link
                href={getLocalizedUrl(`/apps/ecommerce/products/add?edit=${row.original.id}`, locale)}
                className='flex'
              >
                <i className='tabler-edit text-textSecondary' />
              </Link>
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: dictionary.common?.delete || 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => handleDeleteProduct(row.original)
                  }
                },
                { text: dictionary.common?.duplicate || 'Duplicate', icon: 'tabler-copy' }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: page,
        pageSize: pageSize
      }
    },
    pageCount: Math.ceil(totalCount / pageSize),
    manualPagination: true,
    manualFiltering: true, // Enable manual filtering since we handle it server-side
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: page, pageSize: pageSize })
        setPage(newState.pageIndex)
        setPageSize(newState.pageSize)
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: value => {
      setGlobalFilter(value)
      setPage(0) // Reset to first page when searching
    },
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <>
      <Card>
        <CardHeader title={dictionary.common?.filters || 'Filters'} />
        {/* Alerts */}
        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mx: 6, mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' onClose={() => setSuccess('')} sx={{ mx: 6, mt: 2 }}>
            {success}
          </Alert>
        )}
        <TableFilters
          dictionary={dictionary}
          categories={categories}
          categoryId={categoryId}
          onCategoryChange={value => setCategoryId(String(value || ''))}
          status={statusFilter}
          onStatusChange={value => setStatusFilter(String(value || ''))}
          stock={stockFilter}
          onStockChange={value => setStockFilter(String(value || ''))}
        />
        <Divider />
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder={dictionary.common?.searchProduct || 'Search Product'}
            className='max-sm:is-full'
          />
          <div className='flex flex-wrap items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <CustomTextField
              select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
                setPage(0) // Reset to first page when changing page size
              }}
              className='flex-auto is-[70px] max-sm:is-full'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
            <Button
              color='secondary'
              variant='tonal'
              className='max-sm:is-full is-auto'
              startIcon={<i className='tabler-upload' />}
            >
              {dictionary.common?.export || 'Export'}
            </Button>
            <Button
              variant='contained'
              component={Link}
              className='max-sm:is-full is-auto'
              href={getLocalizedUrl('/apps/ecommerce/products/add', locale)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary.common?.addProduct || 'Add Product'}
            </Button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={tableStyles.table} style={{ minWidth: '100%', width: 'max-content' }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='tabler-chevron-up text-xl' />,
                              desc: <i className='tabler-chevron-down text-xl' />
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <CircularProgress sx={{ my: 4 }} />
                  </td>
                </tr>
              </tbody>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} totalCount={totalCount} />}
          count={totalCount}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, newPage) => {
            setPage(newPage)
          }}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{productToDelete?.productName}"?</Typography>
          <Typography variant='body2' color='text.secondary' className='mbs-2'>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteProduct} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductListTable
