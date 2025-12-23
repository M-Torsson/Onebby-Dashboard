'use client'

// React Imports
import React, { useEffect, useMemo, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
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
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import AddTaxDrawer from './AddTaxDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

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

const TaxClassTable = ({ dictionary = { common: {} } }) => {
  const { lang: locale } = useParams()
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taxToDelete, setTaxToDelete] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTax, setSelectedTax] = useState(null)

  useEffect(() => {
    fetchTaxClasses()
  }, [])

  const fetchTaxClasses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${API_BASE_URL}/api/admin/tax-classes`, {
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError('Failed to load tax classes')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTax = tax => {
    setTaxToDelete(tax)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTax = async () => {
    if (!taxToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tax-classes/${taxToDelete.id}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': API_KEY }
      })

      if (response.ok) {
        setSuccess('Tax class deleted successfully!')
        fetchTaxClasses()
        setDeleteDialogOpen(false)
        setTaxToDelete(null)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log('Delete error:', response.status, errorData)
        let errorMessage = 'Failed to delete tax class'

        // Check if error is related to products using this tax class
        if (response.status === 500 || response.status === 400 || response.status === 409) {
          const errorDetail = JSON.stringify(errorData).toLowerCase()
          if (
            errorDetail.includes('tax_class_id') ||
            errorDetail.includes('constraint') ||
            errorDetail.includes('products') ||
            errorDetail.includes('integrity')
          ) {
            errorMessage =
              'Cannot delete this tax class because it is currently assigned to one or more products. Please change the tax class for those products first, then try again.'
          } else if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        }

        setError(errorMessage)
        setDeleteDialogOpen(false)
      }
    } catch (err) {
      console.log('Delete exception:', err)
      setError('Network error. Please try again.')
      setDeleteDialogOpen(false)
    }
  }

  const handleEditTax = tax => {
    setSelectedTax(tax)
    setDrawerOpen(true)
  }

  const handleAddTax = () => {
    setSelectedTax(null)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedTax(null)
  }

  const handleDrawerSuccess = () => {
    fetchTaxClasses()
    handleCloseDrawer()
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
      columnHelper.accessor('name', {
        header: dictionary.common?.taxName || 'Tax Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.name}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('rate', {
        header: dictionary.common?.taxRate || 'Tax Rate (%)',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.rate}%</Typography>
      }),
      columnHelper.accessor('is_active', {
        header: dictionary.common?.status || 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              label={
                row.original.is_active
                  ? dictionary.common?.active || 'Active'
                  : dictionary.common?.inactive || 'Inactive'
              }
              variant='tonal'
              color={row.original.is_active ? 'success' : 'error'}
              size='small'
            />
          </div>
        )
      }),
      columnHelper.accessor('created_at', {
        header: dictionary.common?.createdAt || 'Created At',
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: dictionary.common?.action || 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditTax(row.original)}>
              <i className='tabler-edit text-[22px] text-textSecondary' />
            </IconButton>
            <IconButton onClick={() => handleDeleteTax(row.original)}>
              <i className='tabler-trash text-[22px] text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data: data,
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
        <CardHeader title={dictionary.common?.taxClasses || 'Tax Classes'} />
        <div className='flex justify-center items-center min-h-[400px]'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader title={dictionary.common?.taxClasses || 'Tax Classes'} />
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
            placeholder={dictionary.common?.searchTaxClasses || 'Search Tax Classes'}
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
            <Button variant='contained' onClick={handleAddTax} startIcon={<i className='tabler-plus' />}>
              {dictionary.common?.addTaxClass || 'Add Tax Class'}
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
                    {dictionary.common?.noTaxClassesAvailable || 'No tax classes available'}
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
        <TablePaginationComponent table={table} />
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Tax Class</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the tax class "{taxToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={confirmDeleteTax} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Drawer */}
      <AddTaxDrawer
        open={drawerOpen}
        handleClose={handleCloseDrawer}
        taxData={selectedTax}
        onSuccess={handleDrawerSuccess}
      />
    </>
  )
}

export default TaxClassTable
