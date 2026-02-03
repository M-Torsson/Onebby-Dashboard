// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_BASE_URL, API_KEY } from '@/configs/apiConfig'
import tableStyles from '@core/styles/table.module.css'

const ADMIN_BASE_URL = `${API_BASE_URL}/api/admin`

const BRANDS_FETCH_LIMIT = 500
// Safety cap to avoid loading an unexpectedly huge dataset in the browser.
const MAX_BRANDS_TO_LOAD = 20000

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const brandGlobalFilter = (row, _columnId, value) => {
  const query = String(value ?? '')
    .trim()
    .toLowerCase()

  if (!query) return true

  const original = row.original || {}
  const haystack = [
    String(original.id ?? ''),
    String(original.brandName ?? ''),
    String(original.brandSlug ?? '')
  ].map(v => v.toLowerCase())

  return haystack.some(v => v.includes(query))
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)
    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const brandStatusObj = {
  Active: { title: 'Publish', color: 'success' },
  Inactive: { title: 'Inactive', color: 'error' }
}

const columnHelper = createColumnHelper()

const BrandsList = ({ dictionary = { navigation: {}, common: {} } }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState(null)

  const debugEnabled = process.env.NODE_ENV !== 'production'

  const { lang: locale } = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch brands in batches, then do filtering + pagination client-side (same approach as Categories)
      let skip = 0
      let total = Infinity
      const allBrands = []

      while (skip < MAX_BRANDS_TO_LOAD && allBrands.length < total) {
        const response = await fetch(`${ADMIN_BASE_URL}/brands?skip=${skip}&limit=${BRANDS_FETCH_LIMIT}`, {
          headers: { 'X-API-KEY': API_KEY }
        })

        if (!response.ok) {
          console.error('Failed to fetch brands:', response.status)
          setError(`Failed to load brands (${response.status})`)
          setData([])
          return
        }

        const result = await response.json()
        const batch = (result?.data ?? result ?? [])
        const normalizedBatch = Array.isArray(batch) ? batch : []

        total = result?.meta?.total ?? total

        if (normalizedBatch.length === 0) break

        allBrands.push(...normalizedBatch)
        skip += BRANDS_FETCH_LIMIT

        if (normalizedBatch.length < BRANDS_FETCH_LIMIT) break
      }

      const formattedData = allBrands.slice(0, MAX_BRANDS_TO_LOAD).map(brand => ({
        id: brand.id,
        brandName: brand.name,
        brandSlug: brand.slug,
        image: brand.image,
        stock: brand.is_active,
        sortOrder: brand.sort_order,
        status: brand.is_active ? 'Active' : 'Inactive',
        createdAt: brand.created_at
      }))

      setData(formattedData)
    } catch (err) {
      console.error('Network error:', err)
      setError('Network error. Please try again.')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // Toggle Active Status
  const handleToggleActive = async brand => {
    try {
      const response = await fetch(`${ADMIN_BASE_URL}/brands/${brand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY
        },
        body: JSON.stringify({
          id: brand.id,
          name: brand.brandName,
          slug: brand.brandSlug,
          image: brand.image,
          is_active: !brand.stock,
          sort_order: brand.sortOrder,
          created_at: brand.createdAt,
          updated_at: null
        })
      })

      if (response.ok) {
        fetchBrands()
      }
    } catch (err) {}
  }

  // Delete Brand
  const handleDeleteBrand = brand => {
    setBrandToDelete(brand)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteBrand = async () => {
    try {
      const response = await fetch(`${ADMIN_BASE_URL}/brands/${brandToDelete.id}`, {
        method: 'DELETE',
        headers: { 'X-API-KEY': API_KEY }
      })

      if (response.ok) {
        setSuccess('Brand deleted successfully!')
        setDeleteDialogOpen(false)
        fetchBrands()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to delete brand')
      }
    } catch (err) {
      setError('Network error. Please try again.')
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
      columnHelper.accessor('brandName', {
        header: dictionary.common?.brand || 'Brand',
        cell: ({ row }) => (
          <div className='flex items-center gap-4' style={{ paddingRight: '200px' }}>
            {row.original.image ? (
              <img
                src={row.original.image}
                width={38}
                height={38}
                className='rounded bg-actionHover'
                alt={row.original.brandName}
              />
            ) : (
              <div
                className='rounded bg-actionHover flex items-center justify-center'
                style={{ width: 38, height: 38, backgroundColor: '#f0f0f0' }}
              >
                <i className='tabler-photo text-2xl' style={{ color: '#999' }} />
              </div>
            )}
            <div
              className='flex flex-col'
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(getLocalizedUrl(`/apps/ecommerce/brands/add?edit=${row.original.id}`, locale))}
              onMouseEnter={e => {
                e.currentTarget.querySelector('.brand-name').style.color = 'var(--mui-palette-primary-main)'
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelector('.brand-name').style.color = ''
              }}
            >
              <Typography className='font-medium brand-name' color='text.primary'>
                {row.original.brandName}
              </Typography>
              <Typography variant='body2'>{row.original.brandSlug}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('stock', {
        header: dictionary.common?.stock || 'Stock',
        cell: ({ row }) => (
          <div style={{ paddingRight: '150px' }}>
            <Switch checked={row.original.stock} onChange={() => handleToggleActive(row.original)} />
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('sortOrder', {
        header: dictionary.common?.sortOrder || 'Sort Order',
        cell: ({ row }) => (
          <div style={{ paddingRight: '150px' }}>
            <Typography>{row.original.sortOrder}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: dictionary.common?.status || 'Status',
        cell: ({ row }) => (
          <div style={{ paddingRight: '160px' }}>
            <Chip
              label={brandStatusObj[row.original.status].title}
              variant='tonal'
              color={brandStatusObj[row.original.status].color}
              size='small'
            />
          </div>
        )
      }),
      columnHelper.accessor('actions', {
        header: dictionary.common?.actions || 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <Link
                href={getLocalizedUrl(`/apps/ecommerce/brands/add?edit=${row.original.id}`, locale)}
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
                    onClick: () => handleDeleteBrand(row.original)
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
    [data, locale]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      rowSelection,
      globalFilter,
      pagination
    },
    onPaginationChange: setPagination,
    enableRowSelection: true,
    globalFilterFn: brandGlobalFilter,
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

  useEffect(() => {
    if (!debugEnabled) return

    const state = table.getState()
    const filteredCount = table.getFilteredRowModel().rows.length
    const pagedCount = table.getPaginationRowModel().rows.length
    const firstRow = table.getPaginationRowModel().rows[0]?.original

    // eslint-disable-next-line no-console
    console.debug('[BrandsList][debug]', {
      globalFilter,
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
      dataCount: data.length,
      filteredCount,
      pagedCount,
      firstRowId: firstRow?.id,
      firstRowName: firstRow?.brandName
    })
  }, [debugEnabled, data.length, globalFilter, pagination.pageIndex, pagination.pageSize])

  if (loading) {
    return (
      <Card>
        <div className='flex justify-center items-center' style={{ minHeight: '400px' }}>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <>
      {error && (
        <Alert severity='error' onClose={() => setError('')} className='mbe-4'>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity='success' onClose={() => setSuccess('')} className='mbe-4'>
          {success}
        </Alert>
      )}

      <Card>
        <CardHeader title={dictionary.common?.filters || 'Filters'} />
        <Divider />
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => {
              const searchValue = String(value)
              setGlobalFilter(searchValue)
              table.setPageIndex(0)
            }}
            placeholder={dictionary.common?.searchBrand || 'Search Brand'}
            className='max-sm:is-full'
          />
          <div className='flex flex-wrap items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
                table.setPageIndex(0)
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
              href={getLocalizedUrl('/apps/ecommerce/brands/add', locale)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary.common?.addBrand || 'Add Brand'}
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
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
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No brands available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getPaginationRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, newPage) => {
            table.setPageIndex(newPage)
          }}
          onRowsPerPageChange={e => {
            table.setPageSize(parseInt(e.target.value, 10))
            table.setPageIndex(0)
          }}
        />
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the brand "{brandToDelete?.brandName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteBrand} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BrandsList
