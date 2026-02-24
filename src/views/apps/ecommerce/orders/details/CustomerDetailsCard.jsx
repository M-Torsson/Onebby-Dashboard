// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const getAvatar = params => {
  const { avatar, customer } = params

  if (avatar) {
    return <Avatar src={avatar} />
  } else {
    return <Avatar>{getInitials(customer)}</Avatar>
  }
}

const CustomerDetails = ({ orderData }) => {
  // Extract customer info from orderData
  const customerInfo = orderData?.customer_info || {}
  const billingAddress = orderData?.billing_address || {}
  const firstName = customerInfo?.first_name || ''
  const lastName = customerInfo?.last_name || ''

  // Check for company name in multiple locations
  const companyName =
    billingAddress?.company ||
    billingAddress?.company_name ||
    customerInfo?.company ||
    customerInfo?.company_name ||
    null

  // Prioritize company name, then full name, then fallback to Guest
  const customerName =
    companyName ||
    (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || orderData?.customer_name || 'Guest')

  const customerEmail = customerInfo?.email || orderData?.customer_email || 'N/A'
  const customerPhone = customerInfo?.phone || billingAddress?.phone || 'N/A'

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <Typography variant='h5'>Customer details</Typography>
        <div className='flex items-center gap-3'>
          {getAvatar({ avatar: '', customer: customerName })}
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-medium'>
              {customerName}
            </Typography>
            <Typography>Customer ID: #{orderData?.customer_info?.user_id || orderData?.user_id || 'Guest'}</Typography>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <CustomAvatar skin='light' color='success' size={40}>
            <i className='tabler-shopping-cart' />
          </CustomAvatar>
          <Typography color='text.primary' className='font-medium'>
            {orderData?.items_count || orderData?.items?.length || 0} Items
          </Typography>
        </div>
        <div className='flex flex-col gap-1'>
          <Typography color='text.primary' className='font-medium'>
            Contact info
          </Typography>
          <Typography>Email: {customerEmail}</Typography>
          <Typography>Mobile: {customerPhone}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerDetails
