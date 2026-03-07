// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useDictionary } from '@/hooks/useDictionary'

const ShippingAddress = ({ orderData }) => {
  const dictionary = useDictionary()
  const shippingAddress = orderData?.shipping_address || {}

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <Typography variant='h5'>{dictionary?.orders?.shippingAddress || 'Shipping Address'}</Typography>
        <div className='flex flex-col'>
          <Typography>{shippingAddress.address_house_number || dictionary?.orders?.notAvailable || 'N/A'}</Typography>
          <Typography>{shippingAddress.city || dictionary?.orders?.notAvailable || 'N/A'}</Typography>
          <Typography>
            {shippingAddress.postal_code
              ? `${shippingAddress.postal_code}, ${shippingAddress.city}`
              : dictionary?.orders?.notAvailable || 'N/A'}
          </Typography>
          <Typography>{shippingAddress.country || dictionary?.orders?.notAvailable || 'N/A'}</Typography>
          {shippingAddress.phone && (
            <Typography>
              {dictionary?.orders?.phoneLabel || 'Phone:'} {shippingAddress.phone}
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ShippingAddress
