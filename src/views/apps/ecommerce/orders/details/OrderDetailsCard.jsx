'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

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
import Link from '@components/Link'
import { useDictionary } from '@/hooks/useDictionary'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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

// Column Definitions
const columnHelper = createColumnHelper()

const OrderTable = ({ orderData }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const dictionary = useDictionary()

  // Convert API items to table format
  useEffect(() => {
    if (orderData?.items && Array.isArray(orderData.items)) {
      const formattedItems = orderData.items.map(item => {
        let deliveryOption = null
        let warrantyOption = null

        try {
          if (item.delivery_option && typeof item.delivery_option === 'string') {
            deliveryOption = JSON.parse(item.delivery_option)
          } else if (item.delivery_option && typeof item.delivery_option === 'object') {
            deliveryOption = item.delivery_option
          }
        } catch (error) {
          console.error('[OrderDetailsCard] Failed to parse delivery_option:', error)
        }

        try {
          if (item.warranty_option && typeof item.warranty_option === 'string') {
            warrantyOption = JSON.parse(item.warranty_option)
          } else if (item.warranty_option && typeof item.warranty_option === 'object') {
            warrantyOption = item.warranty_option
          }
        } catch (error) {
          console.error('[OrderDetailsCard] Failed to parse warranty_option:', error)
        }

        return {
          productName: item.product_name_en || item.product_title?.split(' – ')[0] || item.product_title,
          productImage: item.product_image || '/images/apps/ecommerce/product-1.png',
          brand: item.product_sku || dictionary?.orders?.notAvailable || 'N/A',
          price: parseFloat(item.unit_price || 0),
          quantity: item.quantity || 0,
          total: parseFloat(item.subtotal || 0),
          deliveryOption,
          warrantyOption
        }
      })

      setData(formattedItems)
    }
  }, [orderData, dictionary])

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
        header: dictionary?.orders?.productColumn || 'PRODUCT',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <img src={row.original.productImage} alt={row.original.productName} height={34} className='rounded' />
            <div className='flex flex-col items-start max-w-[450px]'>
              <Typography
                color='text.primary'
                className='font-medium truncate max-w-full'
                title={row.original.productName}
              >
                {row.original.productName}
              </Typography>
              <Typography variant='body2' className='text-gray-600'>
                {row.original.brand}
              </Typography>
              {row.original.deliveryOption && (
                <Typography variant='caption' className='text-success'>
                  🚚 {row.original.deliveryOption.option} (+€{parseFloat(row.original.deliveryOption.price).toFixed(2)})
                </Typography>
              )}
              {row.original.warrantyOption && (
                <Typography variant='caption' className='text-info'>
                  🛡️ {row.original.warrantyOption.title} (+€{parseFloat(row.original.warrantyOption.price).toFixed(2)})
                </Typography>
              )}
            </div>
          </div>
        )
      }),
      columnHelper.accessor('price', {
        header: dictionary?.orders?.priceColumn || 'PRICE',
        cell: ({ row }) => <Typography>€{row.original.price.toFixed(2)}</Typography>
      }),
      columnHelper.accessor('quantity', {
        header: dictionary?.orders?.qtyColumn || 'QTY',
        cell: ({ row }) => <Typography>{`${row.original.quantity}`}</Typography>
      }),
      columnHelper.accessor('total', {
        header: dictionary?.orders?.totalColumn || 'TOTAL',
        cell: ({ row }) => <Typography>€{row.original.total.toFixed(2)}</Typography>
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dictionary]
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

  return (
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
                {dictionary?.common?.noDataAvailable || 'No data available'}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className='border-be'>
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
  )
}

const OrderDetailsCard = ({ orderData }) => {
  const dictionary = useDictionary()
  // Calculate totals from API data
  const subtotal = orderData?.subtotal ? parseFloat(orderData.subtotal) : 0
  const shippingCost = orderData?.shipping_cost ? parseFloat(orderData.shipping_cost) : 0
  const tax = orderData?.tax_amount ? parseFloat(orderData.tax_amount) : orderData?.tax ? parseFloat(orderData.tax) : 0
  const total = orderData?.total_amount ? parseFloat(orderData.total_amount) : 0
  const currency = orderData?.currency || 'EUR'

  // Calculate delivery and warranty costs from items
  const deliveryTotal =
    orderData?.items?.reduce((sum, item) => {
      try {
        let deliveryOption = null
        if (item.delivery_option && typeof item.delivery_option === 'string') {
          deliveryOption = JSON.parse(item.delivery_option)
        } else if (item.delivery_option && typeof item.delivery_option === 'object') {
          deliveryOption = item.delivery_option
        }
        return sum + (deliveryOption ? parseFloat(deliveryOption.price || 0) : 0)
      } catch (e) {
        return sum
      }
    }, 0) || 0

  const warrantyTotal =
    orderData?.items?.reduce((sum, item) => {
      try {
        let warrantyOption = null
        if (item.warranty_option && typeof item.warranty_option === 'string') {
          warrantyOption = JSON.parse(item.warranty_option)
        } else if (item.warranty_option && typeof item.warranty_option === 'object') {
          warrantyOption = item.warranty_option
        }
        return sum + (warrantyOption ? parseFloat(warrantyOption.price || 0) : 0)
      } catch (e) {
        return sum
      }
    }, 0) || 0

  return (
    <Card>
      <CardHeader title={dictionary?.orders?.orderDetails || 'Order Details'} />
      <OrderTable orderData={orderData} />
      <CardContent className='flex justify-end'>
        <div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[100px]'>
              {dictionary?.orders?.subtotal || 'Subtotal:'}
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency === 'EUR' ? '€' : '$'}
              {subtotal.toFixed(2)}
            </Typography>
          </div>
          {deliveryTotal > 0 && (
            <div className='flex items-center gap-12'>
              <Typography color='text.primary' className='min-is-[100px]'>
                {dictionary?.orders?.deliveryServices || 'Delivery Services:'}
              </Typography>
              <Typography color='text.primary' className='font-medium text-success'>
                {currency === 'EUR' ? '€' : '$'}
                {deliveryTotal.toFixed(2)}
              </Typography>
            </div>
          )}
          {warrantyTotal > 0 && (
            <div className='flex items-center gap-12'>
              <Typography color='text.primary' className='min-is-[100px]'>
                {dictionary?.orders?.warrantyServices || 'Warranty Services:'}
              </Typography>
              <Typography color='text.primary' className='font-medium text-info'>
                {currency === 'EUR' ? '€' : '$'}
                {warrantyTotal.toFixed(2)}
              </Typography>
            </div>
          )}
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[100px]'>
              {dictionary?.orders?.shippingFee || dictionary?.orders?.shippingCost || 'Shipping Fee:'}
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency === 'EUR' ? '€' : '$'}
              {shippingCost.toFixed(2)}
            </Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[100px]'>
              {dictionary?.orders?.tax || 'Tax:'}
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency === 'EUR' ? '€' : '$'}
              {tax.toFixed(2)}
            </Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='font-medium min-is-[100px]'>
              {dictionary?.orders?.total || 'Total:'}
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency === 'EUR' ? '€' : '$'}
              {total.toFixed(2)}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderDetailsCard
