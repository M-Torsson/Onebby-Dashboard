// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useDictionary } from '@/hooks/useDictionary'

const BillingAddress = ({ orderData }) => {
  const dictionary = useDictionary()
  const billingAddress = orderData?.billing_address || {}

  // Get payment method display name
  const paymentMethodDisplay = orderData?.payment_method
    ? orderData.payment_method.charAt(0).toUpperCase() + orderData.payment_method.slice(1)
    : dictionary?.orders?.notAvailable || 'N/A'

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
          <Typography variant='h5'>{dictionary?.orders?.billingAddress || 'Billing Address'}</Typography>
          <div className='flex flex-col'>
            <Typography>{billingAddress.address_house_number || dictionary?.orders?.notAvailable || 'N/A'}</Typography>
            <Typography>{billingAddress.city || dictionary?.orders?.notAvailable || 'N/A'}</Typography>
            <Typography>
              {billingAddress.postal_code
                ? `${billingAddress.postal_code}, ${billingAddress.city}`
                : dictionary?.orders?.notAvailable || 'N/A'}
            </Typography>
            <Typography>{billingAddress.country || dictionary?.orders?.notAvailable || 'N/A'}</Typography>
            {billingAddress.phone && (
              <Typography>
                {dictionary?.orders?.phoneLabel || 'Phone:'} {billingAddress.phone}
              </Typography>
            )}
          </div>
        </div>
        <div className='flex flex-col items-start gap-1'>
          <Typography variant='h5'>{paymentMethodDisplay}</Typography>
          {orderData?.payment_transaction_id && (
            <Typography>
              {dictionary?.orders?.transactionId || 'Transaction ID:'} {orderData.payment_transaction_id}
            </Typography>
          )}
          {!orderData?.payment_transaction_id && (
            <Typography>
              {dictionary?.orders?.paymentStatus || 'Payment Status:'}{' '}
              {orderData?.payment_status || dictionary?.orders?.pending || 'Pending'}
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BillingAddress
