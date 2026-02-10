// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import MenuItem from '@mui/material/MenuItem'
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
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import { API_BASE_URL, API_KEY } from '@/configs/apiConfig'

const V1_BASE_URL = `${API_BASE_URL}/api/admin`
const WARRANTY_API_KEY = 'OnebbyAPIKey2025P9mK7xL4rT8nW2qF5vB3cH6jD9zYaXbRcGdTeUf1MwNyQsV'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
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

const columnHelper = createColumnHelper()

const WarrantyList = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [warrantyToDelete, setWarrantyToDelete] = useState(null)

  useEffect(() => {
    fetchWarranties()
  }, [])

  const fetchWarranties = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${V1_BASE_URL}/warranties?skip=0&limit=500&active_only=false`, {
        headers: { 'X-API-Key': WARRANTY_API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        const warranties = result.data || result || []
        setData(warranties)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || errorData.message || 'Failed to load warranties')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWarranty = warranty => {
    setWarrantyToDelete(warranty)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteWarranty = async () => {
    if (!warrantyToDelete) return

    try {
      const response = await fetch(`${V1_BASE_URL}/warranties/${warrantyToDelete.id}?soft_delete=true`, {
        method: 'DELETE',
        headers: { 'X-API-Key': WARRANTY_API_KEY }
      })

      if (response.ok) {
        setSuccess('Warranty deleted successfully!')
        setDeleteDialogOpen(false)
        setWarrantyToDelete(null)
        
        // Refresh the list after deletion
        await fetchWarranties()
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || 'Failed to delete warranty')
        setDeleteDialogOpen(false)
        setWarrantyToDelete(null)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setDeleteDialogOpen(false)
      setWarrantyToDelete(null)
    }
  }

  const handleEditWarranty = warranty => {
    router.push(`/apps/ecommerce/warranty/add?edit=${warranty.id}`)
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
      columnHelper.accessor('title', {
        header: 'Warranty',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {row.original.image && (
              <img
                src={row.original.image}
                alt={row.original.title}
                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
              />
            )}
            <div className='flex flex-col' style={{ maxWidth: '300px' }}>
              <Typography color='text.primary' className='font-medium' noWrap>
                {row.original.title || 'Untitled'}
              </Typography>
              <Typography variant='body2' color='text.secondary' noWrap>
                {row.original.subtitle || 'No subtitle'}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ row }) => {
          const price = row.original.price || 0
          const priceInEuros = price / 100
          return (
            <Typography className='font-medium'>
              €{priceInEuros.toFixed(2)}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('features', {
        header: 'Features',
        cell: ({ row }) => (
          <Chip
            label={`${row.original.features?.length || 0} feature${row.original.features?.length !== 1 ? 's' : ''}`}
            variant='tonal'
            color='info'
            size='small'
          />
        )
      }),
      columnHelper.accessor('categories', {
        header: 'Categories',
        cell: ({ row }) => (
          <Chip
            label={`${row.original.categories?.length || 0} categor${row.original.categories?.length !== 1 ? 'ies' : 'y'}`}
            variant='tonal'
            color='primary'
            size='small'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton size='small' onClick={() => handleEditWarranty(row.original)}>
              <i className='tabler-edit text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteWarranty(row.original)}>
              <i className='tabler-trash text-[22px] text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [dictionary]
  )

  const table = useReactTable({
    data,
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
    enableRowSelection: true,
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

  if (loading) {
    return (
      <Card>
        <CardHeader title='Warranty Settings' />
        <div className='flex justify-center items-center min-h-[400px]'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader title='Warranty Settings' />
        {error && (
          <Alert severity='error' onClose={() => setError('')} className='m-6'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' onClose={() => setSuccess('')} className='m-6'>
            {success}
          </Alert>
        )}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Warranties'
            className='is-full sm:is-auto'
          />
          <div className='flex gap-4'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
            <Button
              variant='contained'
              onClick={() => router.push('/apps/ecommerce/warranty/add')}
              startIcon={<i className='tabler-plus' />}
            >
              Add Warranty
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
                    No warranties found
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
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
        <TablePaginationComponent table={table} />
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Warranty</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this warranty? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteWarranty} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default WarrantyList
