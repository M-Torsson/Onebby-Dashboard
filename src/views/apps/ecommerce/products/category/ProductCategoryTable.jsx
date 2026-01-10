'use client'

// React Imports
import React, { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

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
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'X9$eP!7wQ@3nZ8^tF#uL2rC6*mH1yB0_dV4+KpS%aGfJ5$qWzR!N7sT#hU9&bE'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const categoryGlobalFilter = (row, _columnId, value) => {
  const query = String(value ?? '')
    .trim()
    .toLowerCase()
  if (!query) return true

  const original = row.original || {}
  const haystack = [original.id, original.name, original.slug].map(v => String(v ?? '').toLowerCase())

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

const columnHelper = createColumnHelper()

const ProductCategoryTable = ({ dictionary = { common: {} } }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [deleteWithChildren, setDeleteWithChildren] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [childrenData, setChildrenData] = useState({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')
      // Fetch all categories once, then do pagination + search client-side.
      // NOTE: /api/v1/categories includes the categories created via the dashboard.
      const response = await fetch(`${API_BASE_URL}/api/v1/categories?lang=en&parent_only=false&skip=0&limit=500`, {
        headers: { 'X-API-KEY': API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        const categories = result.data || []
        setData(categories)
      } else {
        setError('Failed to load categories')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchChildren = async parentId => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${parentId}/children?lang=en`, {
        headers: { 'X-API-KEY': API_KEY }
      })

      if (response.ok) {
        const result = await response.json()
        setChildrenData(prev => ({ ...prev, [parentId]: result.data }))
      }
    } catch (err) {}
  }

  const handleToggleExpand = (categoryId, hasChildren) => {
    if (!hasChildren) return

    const newExpanded = { ...expanded, [categoryId]: !expanded[categoryId] }
    setExpanded(newExpanded)

    // Fetch children if not already loaded
    if (!childrenData[categoryId] && !expanded[categoryId]) {
      fetchChildren(categoryId)
    }
  }

  const handleDeleteCategory = async category => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      const url = deleteWithChildren
        ? `${API_BASE_URL}/api/admin/categories/${categoryToDelete.id}?force=true`
        : `${API_BASE_URL}/api/admin/categories/${categoryToDelete.id}`

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'X-API-KEY': API_KEY }
      })

      if (response.ok) {
        // Clear children data for deleted category
        if (categoryToDelete.id) {
          setChildrenData(prev => {
            const newData = { ...prev }
            delete newData[categoryToDelete.id]
            return newData
          })
        }

        setSuccess('Category deleted successfully!')
        fetchCategories()
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
        setDeleteWithChildren(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || errorData.message || 'Failed to delete category')
        setDeleteDialogOpen(false)
        setDeleteWithChildren(false)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setDeleteDialogOpen(false)
      setDeleteWithChildren(false)
    }
  }

  const handleEditCategory = category => {
    router.push(getLocalizedUrl(`/apps/ecommerce/category/add?edit=${category.id}`, locale))
  }

  const handleAddSubcategory = category => {
    router.push(getLocalizedUrl(`/apps/ecommerce/category/add?parent=${category.id}`, locale))
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
        header: dictionary.common?.category || 'Category',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {row.original.has_children && (
              <IconButton size='small' onClick={() => handleToggleExpand(row.original.id, row.original.has_children)}>
                <i className={expanded[row.original.id] ? 'tabler-chevron-down' : 'tabler-chevron-right'} />
              </IconButton>
            )}
            {(row.original.image || row.original.icon) && (
              <img
                src={row.original.image || row.original.icon}
                width={38}
                height={38}
                className='rounded bg-actionHover'
                alt={row.original.name}
              />
            )}
            <div
              className='flex flex-col items-start'
              style={{ cursor: 'pointer' }}
              onClick={() => handleEditCategory(row.original)}
              onMouseEnter={e => {
                e.currentTarget.querySelector('.category-name').style.color = 'var(--mui-palette-primary-main)'
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelector('.category-name').style.color = ''
              }}
            >
              <Typography className='font-medium category-name' color='text.primary'>
                {row.original.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {row.original.slug}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('sort_order', {
        header: dictionary.common?.sortOrder || 'Sort Order',
        cell: ({ row }) => <Typography>{row.original.sort_order}</Typography>
      }),
      columnHelper.accessor('is_active', {
        header: dictionary.common?.status || 'Status',
        cell: ({ row }) => (
          <Chip
            label={
              row.original.is_active ? dictionary.common?.active || 'Active' : dictionary.common?.inactive || 'Inactive'
            }
            color={row.original.is_active ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('has_children', {
        header: dictionary.common?.subCategories || 'Sub Categories',
        cell: ({ row }) => (
          <Chip
            label={row.original.has_children ? dictionary.common?.yes || 'Yes' : dictionary.common?.no || 'No'}
            color={row.original.has_children ? 'primary' : 'default'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: dictionary.common?.actions || 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditCategory(row.original)}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: dictionary.common?.addSubcategory || 'Add Subcategory',
                  icon: 'tabler-plus',
                  menuItemProps: { onClick: () => handleAddSubcategory(row.original) }
                },
                {
                  text: dictionary.common?.delete || 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: { onClick: () => handleDeleteCategory(row.original) }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [expanded, childrenData]
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
    globalFilterFn: categoryGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

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
      <Card>
        <CardHeader title={dictionary.common?.productCategories || 'Product Categories'} className='pbe-4' />

        {error && (
          <Alert severity='error' onClose={() => setError('')} sx={{ mx: 4, mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' onClose={() => setSuccess('')} sx={{ mx: 4, mb: 2 }}>
            {success}
          </Alert>
        )}

        <div className='flex justify-between gap-4 p-6 flex-col items-start sm:flex-row sm:items-center'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => {
              setGlobalFilter(String(value))
              table.setPageIndex(0)
            }}
            placeholder={dictionary.common?.searchCategory || 'Search Category'}
            className='max-sm:is-full min-is-[200px]'
          />
          <div className='flex items-center gap-4 max-sm:flex-col max-sm:is-full is-auto'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
                table.setPageIndex(0)
              }}
              className='is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
            <Button
              variant='tonal'
              color='secondary'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full is-auto'
            >
              {dictionary.common?.export || 'Export'}
            </Button>
            <Button
              variant='contained'
              component={Link}
              className='max-sm:is-full is-auto'
              href={getLocalizedUrl('/apps/ecommerce/category/add', locale)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary.common?.addCategory || 'Add Category'}
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
                    No categories found
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id}>
                    <tr className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                    {/* Children rows */}
                    {expanded[row.original.id] && childrenData[row.original.id] && (
                      <>
                        {childrenData[row.original.id].map(child => (
                          <tr key={`child-${child.id}`} style={{ backgroundColor: '#f5f5f5' }}>
                            <td></td>
                            <td>
                              <div className='flex items-center gap-3'>
                                <div style={{ width: '40px' }}></div>
                                {(child.image || child.icon) && (
                                  <img
                                    src={child.image || child.icon}
                                    width={32}
                                    height={32}
                                    className='rounded bg-actionHover'
                                    alt={child.name}
                                  />
                                )}
                                <div
                                  className='flex flex-col items-start'
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleEditCategory(child)}
                                  onMouseEnter={e => {
                                    e.currentTarget.querySelector('.child-name').style.color =
                                      'var(--mui-palette-primary-main)'
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.querySelector('.child-name').style.color = ''
                                  }}
                                >
                                  <Typography variant='body2' className='font-medium child-name'>
                                    {child.name}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {child.slug}
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Typography variant='body2'>{child.sort_order}</Typography>
                            </td>
                            <td>
                              <Chip
                                label={child.is_active ? 'Active' : 'Inactive'}
                                color={child.is_active ? 'success' : 'error'}
                                size='small'
                                variant='tonal'
                              />
                            </td>
                            <td>
                              <Chip label='No' color='default' size='small' variant='tonal' />
                            </td>
                            <td>
                              <div className='flex items-center'>
                                <IconButton onClick={() => handleEditCategory(child)}>
                                  <i className='tabler-edit text-textSecondary' />
                                </IconButton>
                                <OptionMenu
                                  iconButtonProps={{ size: 'medium' }}
                                  iconClassName='text-textSecondary'
                                  options={[
                                    {
                                      text: 'Delete',
                                      icon: 'tabler-trash',
                                      menuItemProps: { onClick: () => handleDeleteCategory(child) }
                                    }
                                  ]}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            )}
          </table>
        </div>
        <TablePaginationComponent table={table} />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeleteWithChildren(false)
        }}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
          {categoryToDelete?.has_children && (
            <>
              <Alert severity='warning' sx={{ mt: 2, mb: 2 }}>
                ⚠️ This category has subcategories!
              </Alert>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={deleteWithChildren}
                    onChange={e => setDeleteWithChildren(e.target.checked)}
                    color='error'
                  />
                }
                label='Delete all subcategories as well'
              />
              {!deleteWithChildren && (
                <Typography variant='caption' color='error' display='block' sx={{ mt: 1 }}>
                  Note: You must check this option to delete a category with subcategories.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              setDeleteWithChildren(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteCategory}
            variant='contained'
            color='error'
            disabled={categoryToDelete?.has_children && !deleteWithChildren}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductCategoryTable
