// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
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
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

export const paymentStatus = {
  1: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  2: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  3: { text: 'Cancelled', color: 'secondary', colorClassName: 'text-secondary' },
  4: { text: 'Failed', color: 'error', colorClassName: 'text-error' },
  5: { text: 'Refunded', color: 'info', colorClassName: 'text-info' }
}

// Map status values to display text and colors
export const statusConfig = {
  delivered: { text: 'Delivered', color: 'success' },
  shipped: { text: 'Out for Delivery', color: 'primary' },
  pending: { text: 'Pending', color: 'info' },
  cancelled: { text: 'Cancelled', color: 'error' },
  processing: { text: 'Processing', color: 'warning' },
  confirmed: { text: 'Confirmed', color: 'success' },
  'ready-to-pickup': { text: 'Ready to Pickup', color: 'info' }
}

// Helper to get status display text
const getStatusDisplay = status => {
  return statusConfig[status]?.text || status.charAt(0).toUpperCase() + status.slice(1)
}

// Helper to get status color
const getStatusColor = status => {
  return statusConfig[status]?.color || 'default'
}

// Helper function to convert API data to table format
const convertApiDataToTableFormat = apiOrders => {
  if (!apiOrders || !Array.isArray(apiOrders)) return []

  return apiOrders.map(order => {
    // Convert payment_status to payment number
    const paymentStatusValue = (order.payment_status || '').toLowerCase().trim()

    let payment = 2 // default: Pending

    // Check for completed/paid status
    if (
      paymentStatusValue === 'completed' ||
      paymentStatusValue === 'paid' ||
      paymentStatusValue === 'success' ||
      paymentStatusValue === 'successful'
    ) {
      payment = 1 // Paid
    }
    // Check for failed status
    else if (paymentStatusValue === 'failed' || paymentStatusValue === 'error' || paymentStatusValue === 'declined') {
      payment = 4 // Failed
    }
    // Check for refunded status
    else if (paymentStatusValue === 'refunded' || paymentStatusValue === 'refund') {
      payment = 5 // Refunded
    }
    // Check for cancelled status
    else if (paymentStatusValue === 'cancelled' || paymentStatusValue === 'canceled') {
      payment = 3 // Cancelled
    }
    // Check for pending status
    else if (paymentStatusValue === 'pending' || paymentStatusValue === 'processing' || paymentStatusValue === '') {
      payment = 2 // Pending
    }

    // Shipping status should come from shipping_status in API response
    const shippingStatusValue = (order.shipping_status || '').toLowerCase()
    const orderStatusValue = (order.status || '').toLowerCase()

    const statusValue = shippingStatusValue || (statusConfig[orderStatusValue] ? orderStatusValue : 'pending')

    const status = getStatusDisplay(statusValue)

    // Convert payment_method to method with support for PayPlug and Floa
    let method = 'mastercard' // default
    const paymentMethod = (order.payment_method || '').toLowerCase()

    if (paymentMethod === 'paypal' || paymentMethod.includes('paypal')) {
      method = 'paypal'
    } else if (paymentMethod === 'payplug' || paymentMethod.includes('payplug')) {
      method = 'payplug'
    } else if (paymentMethod === 'floa' || paymentMethod.includes('floa')) {
      method = 'floa'
    }

    // Parse created_at date
    const createdDate = new Date(order.created_at)
    const date = createdDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    const time = createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    return {
      id: order.id,
      order: order.id.toString(),
      customer: order.customer_name || order.customer_email.split('@')[0],
      email: order.customer_email,
      avatar: null, // Will use initials
      payment: payment,
      status: status,
      statusValue: statusValue, // Keep original value for color mapping
      spent: parseFloat(order.total_amount),
      method: method,
      paymentTransactionId: order.payment_transaction_id || '', // معرف الدفع
      date: date,
      time: time,
      methodNumber: Math.floor(Math.random() * 9000) + 1000 // Random for display
    }
  })
}

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

// Column Definitions
const columnHelper = createColumnHelper()

const OrderListTable = ({ orderData }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const { lang: locale } = useParams()

  // Convert API data to table format when orderData changes
  useEffect(() => {
    const convertedData = convertApiDataToTableFormat(orderData)
    setData(convertedData)
  }, [orderData])

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
      columnHelper.accessor('order', {
        header: 'Order',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.order}`, locale)}
            color='primary.main'
          >{`#${row.original.order}`}</Typography>
        )
      }),
      columnHelper.accessor('customer', {
        header: 'Customers',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatar: row.original.avatar, customer: row.original.customer })}
            <div className='flex flex-col'>
              <Typography
                component={Link}
                href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.order}`, locale)}
                color='text.primary'
                className='font-medium hover:text-primary'
              >
                {row.original.customer}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography>{`${new Date(row.original.date).toDateString()}, ${row.original.time}`}</Typography>
        )
      }),
      columnHelper.accessor('payment', {
        header: 'Payment',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i
              className={classnames(
                'tabler-circle-filled bs-2.5 is-2.5',
                paymentStatus[row.original.payment].colorClassName
              )}
            />
            <Typography color={`${paymentStatus[row.original.payment].color}.main`} className='font-medium'>
              {paymentStatus[row.original.payment].text}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Shipping Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            color={getStatusColor(row.original.statusValue)}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('method', {
        header: 'Method',
        cell: ({ row }) => {
          const method = row.original.method
          const transactionId = row.original.paymentTransactionId

          // عرض PayPlug
          if (method === 'payplug') {
            return (
              <div className='flex items-center gap-2'>
                <div className='flex justify-center items-center bg-primary-lighterOpacity rounded-sm px-2 py-1'>
                  <i className='tabler-credit-card text-primary text-base' />
                </div>
                <div className='flex flex-col'>
                  <Typography className='font-medium' variant='body2'>
                    PayPlug
                  </Typography>
                  {transactionId && (
                    <Typography variant='caption' color='text.secondary'>
                      {transactionId.substring(0, 12)}...
                    </Typography>
                  )}
                </div>
              </div>
            )
          }

          // عرض Floa
          if (method === 'floa') {
            return (
              <div className='flex items-center gap-2'>
                <div className='flex justify-center items-center bg-warning-lighterOpacity rounded-sm px-2 py-1'>
                  <i className='tabler-wallet text-warning text-base' />
                </div>
                <div className='flex flex-col'>
                  <Typography className='font-medium' variant='body2'>
                    Floa
                  </Typography>
                  {transactionId && (
                    <Typography variant='caption' color='text.secondary'>
                      {transactionId}
                    </Typography>
                  )}
                </div>
              </div>
            )
          }

          // عرض PayPal
          if (method === 'paypal') {
            return (
              <div className='flex items-center gap-2'>
                <div className='flex justify-center items-center bg-info-lighterOpacity rounded-sm px-2 py-1'>
                  <i className='tabler-brand-paypal text-info text-base' />
                </div>
                <div className='flex flex-col'>
                  <Typography className='font-medium' variant='body2'>
                    PayPal
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    ...@gmail.com
                  </Typography>
                </div>
              </div>
            )
          }

          // عرض Mastercard (افتراضي)
          return (
            <div className='flex items-center gap-2'>
              <div className='flex justify-center items-center bg-secondary-lighterOpacity rounded-sm px-2 py-1'>
                <i className='tabler-credit-card text-secondary text-base' />
              </div>
              <div className='flex flex-col'>
                <Typography className='font-medium' variant='body2'>
                  Mastercard
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  ...{row.original.methodNumber}
                </Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'View',
                  icon: 'tabler-eye',
                  href: getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.order}`, locale),
                  linkProps: { className: 'flex items-center gap-2 is-full plb-2 pli-4' }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => setData(data?.filter(order => order.id !== row.original.id)),
                    className: 'flex items-center'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
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

  const getAvatar = params => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(customer)}
        </CustomAvatar>
      )
    }
  }

  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Order'
          className='sm:is-auto'
        />
        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='is-[70px] max-sm:is-full'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>
          <Button
            variant='tonal'
            color='secondary'
            startIcon={<i className='tabler-upload' />}
            className='max-sm:is-full is-auto'
          >
            Export
          </Button>
        </div>
      </CardContent>
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
  )
}

export default OrderListTable
