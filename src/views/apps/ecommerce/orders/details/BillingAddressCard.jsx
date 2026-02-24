// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const BillingAddress = ({ orderData }) => {
  const billingAddress = orderData?.billing_address || {}

  // Get payment method display name
  const paymentMethodDisplay = orderData?.payment_method
    ? orderData.payment_method.charAt(0).toUpperCase() + orderData.payment_method.slice(1)
    : 'N/A'

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
          <Typography variant='h5'>Billing Address</Typography>
          <div className='flex flex-col'>
            <Typography>{billingAddress.address_house_number || 'N/A'}</Typography>
            <Typography>{billingAddress.city || 'N/A'}</Typography>
            <Typography>
              {billingAddress.postal_code ? `${billingAddress.postal_code}, ${billingAddress.city}` : 'N/A'}
            </Typography>
            <Typography>{billingAddress.country || 'N/A'}</Typography>
            {billingAddress.phone && <Typography>Phone: {billingAddress.phone}</Typography>}
          </div>
        </div>
        <div className='flex flex-col items-start gap-1'>
          <Typography variant='h5'>{paymentMethodDisplay}</Typography>
          {orderData?.payment_transaction_id && (
            <Typography>Transaction ID: {orderData.payment_transaction_id}</Typography>
          )}
          {!orderData?.payment_transaction_id && (
            <Typography>Payment Status: {orderData?.payment_status || 'Pending'}</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BillingAddress
