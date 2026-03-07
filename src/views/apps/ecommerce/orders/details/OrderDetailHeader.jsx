'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import UpdateOrderDialog from '@components/dialogs/update-order-dialog'
import { useDictionary } from '@/hooks/useDictionary'

export const paymentStatus = {
  completed: { text: 'Paid', color: 'success' },
  pending: { text: 'Pending', color: 'warning' },
  cancelled: { text: 'Cancelled', color: 'secondary' },
  refunded: { text: 'Refunded', color: 'secondary' },
  failed: { text: 'Failed', color: 'error' }
}

// Helper function to get payment status safely
const getPaymentStatus = status => {
  return paymentStatus[status] || paymentStatus['pending']
}

export const statusChipColor = {
  delivered: { status: 'Delivered', color: 'success' },
  shipped: { status: 'Out for Delivery', color: 'primary' },
  pending: { status: 'Pending', color: 'warning' },
  confirmed: { status: 'Confirmed', color: 'info' },
  processing: { status: 'Processing', color: 'info' },
  completed: { status: 'Completed', color: 'success' },
  cancelled: { status: 'Cancelled', color: 'error' }
}

const OrderDetailHeader = ({ orderData, order, onUpdate }) => {
  // States
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false)
  const dictionary = useDictionary()

  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

  // Get shipping status from API
  // Parse date
  const orderDate = orderData?.created_at ? new Date(orderData.created_at) : new Date()
  const dateStr = orderDate.toDateString()
  const timeStr = orderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  // Get payment status safely
  const paymentInfo = (() => {
    const statusMap = {
      completed: { text: dictionary?.orders?.paid || 'Paid', color: 'success' },
      pending: { text: dictionary?.orders?.pending || 'Pending', color: 'warning' },
      cancelled: { text: dictionary?.orders?.cancelled || 'Cancelled', color: 'secondary' },
      refunded: { text: dictionary?.orders?.refunded || 'Refunded', color: 'secondary' },
      failed: { text: dictionary?.orders?.failed || 'Failed', color: 'error' }
    }

    return statusMap[orderData?.payment_status] || getPaymentStatus(orderData?.payment_status)
  })()

  return (
    <>
      <div className='flex flex-wrap justify-between sm:items-center max-sm:flex-col gap-y-4'>
        <div className='flex flex-col items-start gap-1'>
          <div className='flex items-center gap-2'>
            <Typography variant='h5'>{`${dictionary?.orders?.orderNo || 'Order #'}${order}`}</Typography>
            <Chip variant='tonal' label={paymentInfo.text} color={paymentInfo.color} size='small' />
          </div>
          <Typography>{`${dateStr}, ${timeStr} (ET)`}</Typography>
        </div>
        <div className='flex gap-2'>
          <Button variant='contained' color='primary' onClick={() => setOpenUpdateDialog(true)}>
            {dictionary?.orders?.updateOrder || 'Update Order'}
          </Button>
          <OpenDialogOnElementClick
            element={Button}
            elementProps={buttonProps(dictionary?.orders?.deleteOrder || 'Delete Order', 'error', 'tonal')}
            dialog={ConfirmationDialog}
            dialogProps={{ type: 'delete-order' }}
          />
        </div>
      </div>

      {/* Update Order Dialog */}
      <UpdateOrderDialog
        open={openUpdateDialog}
        setOpen={setOpenUpdateDialog}
        orderData={orderData}
        onUpdate={onUpdate}
      />
    </>
  )
}

export default OrderDetailHeader
