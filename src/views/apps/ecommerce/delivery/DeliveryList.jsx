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
const DELIVERY_API_KEY = 'OnebbyAPIKey2025P9mK7xL4rT8nW2qF5vB3cH6jD9zYaXbRcGdTeUf1MwNyQsV'

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

const DeliveryList = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deliveryToDelete, setDeliveryToDelete] = useState(null)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${V1_BASE_URL}/deliveries`, {
        headers: { 'X-API-Key': DELIVERY_API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        const deliveries = result.data || result || []
        setData(deliveries)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || errorData.message || 'Failed to load delivery settings')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDelivery = delivery => {
    setDeliveryToDelete(delivery)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteDelivery = async () => {
    if (!deliveryToDelete) return

    try {
      const response = await fetch(`${V1_BASE_URL}/deliveries/${deliveryToDelete.id}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': DELIVERY_API_KEY }
      })

      if (response.ok) {
        setSuccess('Delivery setting deleted successfully!')
        setDeleteDialogOpen(false)
        setDeliveryToDelete(null)
        
        // Refresh the list after deletion
        await fetchDeliveries()
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || 'Failed to delete delivery setting')
        setDeleteDialogOpen(false)
        setDeliveryToDelete(null)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setDeleteDialogOpen(false)
      setDeliveryToDelete(null)
    }
  }

  const handleEditDelivery = delivery => {
    router.push(`/apps/ecommerce/delivery/add?edit=${delivery.id}`)
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
      columnHelper.accessor('days_from', {
        header: 'Delivery Time',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.days_from} - {row.original.days_to} Days
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Estimated delivery time
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('options', {
        header: 'Options',
        cell: ({ row }) => (
          <Chip
            label={`${row.original.options?.length || 0} option${row.original.options?.length !== 1 ? 's' : ''}`}
            variant='tonal'
            color='info'
            size='small'
          />
        )
      }),
      columnHelper.accessor('is_free_delivery', {
        header: 'Free Delivery',
        cell: ({ row }) => (
          <Chip
            label={row.original.is_free_delivery ? 'Yes' : 'No'}
            variant='tonal'
            color={row.original.is_free_delivery ? 'success' : 'default'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton size='small' onClick={() => handleEditDelivery(row.original)}>
              <i className='tabler-edit text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteDelivery(row.original)}>
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
        <CardHeader title='Delivery Settings' />
        <div className='flex justify-center items-center min-h-[400px]'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader title='Delivery Settings' />
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
            placeholder='Search Delivery Settings'
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
              onClick={() => router.push('/apps/ecommerce/delivery/add')}
              startIcon={<i className='tabler-plus' />}
            >
              Add Delivery Setting
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
                    No delivery settings found
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
        <DialogTitle>Delete Delivery Setting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this delivery setting? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteDelivery} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DeliveryList
