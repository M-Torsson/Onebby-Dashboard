// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const ShippingAddress = ({ orderData }) => {
  const shippingAddress = orderData?.shipping_address || {}

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <Typography variant='h5'>Shipping Address</Typography>
        <div className='flex flex-col'>
          <Typography>{shippingAddress.address_house_number || 'N/A'}</Typography>
          <Typography>{shippingAddress.city || 'N/A'}</Typography>
          <Typography>
            {shippingAddress.postal_code ? `${shippingAddress.postal_code}, ${shippingAddress.city}` : 'N/A'}
          </Typography>
          <Typography>{shippingAddress.country || 'N/A'}</Typography>
          {shippingAddress.phone && <Typography>Phone: {shippingAddress.phone}</Typography>}
        </div>
      </CardContent>
    </Card>
  )
}

export default ShippingAddress
