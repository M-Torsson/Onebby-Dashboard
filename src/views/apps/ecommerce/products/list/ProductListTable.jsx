'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

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
  getPaginationRowModel,
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

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const API_BASE_URL = 'https://onebby-api.onrender.com/api'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

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

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
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

// Vars
const productCategoryObj = {
  Accessories: { icon: 'tabler-headphones', color: 'error' },
  'Home Decor': { icon: 'tabler-smart-home', color: 'info' },
  Electronics: { icon: 'tabler-device-laptop', color: 'primary' },
  Shoes: { icon: 'tabler-shoe', color: 'success' },
  Office: { icon: 'tabler-briefcase', color: 'warning' },
  Games: { icon: 'tabler-device-gamepad-2', color: 'secondary' }
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

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`https://onebby-api.onrender.com/api/v1/products?active_only=false&limit=100`, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.ok) {
        const result = await response.json()

        // Get products from result.data
        const products = result.data || []

        // Fetch stock data for all products in parallel
        const productsWithStock = await Promise.all(
          products.map(async product => {
            try {
              const stockResponse = await fetch(`https://onebby-api.onrender.com/api/v1/products/${product.id}/stock`, {
                headers: { 'X-API-Key': API_KEY }
              })

              if (stockResponse.ok) {
                const stockData = await stockResponse.json()
                return { ...product, stock_data: stockData }
              }
            } catch (error) {
              console.error(`Failed to fetch stock for product ${product.id}:`, error)
            }
            return product
          })
        )

        // Format products data with stock information
        const formattedData = productsWithStock.map(product => {
          // Get stock quantity from stock_data
          const stockQuantity = product.stock_data?.stock_quantity || 0

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

          return {
            id: product.id,
            productName: productTitle,
            productId: `ID: ${product.id}`,
            image: productImage,
            quantity: stockQuantity,
            reference: product.reference || '',
            type: productType.toUpperCase().replace(/ /g, '_'),
            price: `€${product.price || 0}`,
            isActive: product.is_active !== undefined ? product.is_active : false,
            status: product.is_active ? 'Published' : 'Inactive'
          }
        })

        console.log('Formatted products:', formattedData)

        setData(formattedData)
        setFilteredData(formattedData)
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        setError(errorData.detail || `Failed to load products: ${response.status}`)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Toggle Stock Status
  const handleToggleStock = async product => {
    try {
      const newIsActive = !product.isActive
      console.log('Toggling active status for product:', product.id, 'to', newIsActive)

      // Update active status
      const updateData = {
        is_active: newIsActive
      }

      console.log('Sending update:', updateData)

      // Send PUT request to admin endpoint
      const response = await fetch(`${API_BASE_URL}/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(updateData)
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        console.log('Status updated successfully')
        fetchProducts()
      } else {
        const errorText = await response.text()
        console.error('Failed to update status. Status:', response.status, 'Response:', errorText)
        try {
          const errorData = JSON.parse(errorText)
          alert(`Failed to update status: ${errorData.detail || 'Unknown error'}`)
        } catch {
          alert(`Failed to update status: ${errorText || 'Unknown error'}`)
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err)
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
      console.log('Deleting product:', productToDelete.id)
      const deleteUrl = `https://onebby-api.onrender.com/api/admin/products/${productToDelete.id}`
      console.log('Delete URL:', deleteUrl)

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'X-API-Key': API_KEY }
      })

      console.log('Delete response status:', response.status)

      if (response.ok) {
        console.log('Product deleted successfully, refreshing list...')
        setSuccess('Product deleted successfully!')
        setDeleteDialogOpen(false)
        setProductToDelete(null)
        // Add small delay to ensure backend processes the deletion
        setTimeout(() => {
          console.log('Fetching updated products...')
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
      columnHelper.accessor('type', {
        header: dictionary.common?.type || 'Type',
        cell: ({ row }) => <Typography sx={{ whiteSpace: 'nowrap' }}>{row.original.type}</Typography>
      }),
      columnHelper.accessor('price', {
        header: dictionary.common?.price || 'Price',
        cell: ({ row }) => <Typography>{row.original.price}</Typography>
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
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
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
        <TableFilters setData={setFilteredData} productData={data} dictionary={dictionary} />
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
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
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
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
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
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
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
