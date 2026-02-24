// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import OrderDetailHeader from './OrderDetailHeader'
import OrderDetailsCard from './OrderDetailsCard'
import ShippingActivity from './ShippingActivityCard'
import CustomerDetails from './CustomerDetailsCard'
import ShippingAddress from './ShippingAddressCard'
import BillingAddress from './BillingAddressCard'
import PaymentDetailsCard from './PaymentDetailsCard'

const OrderDetails = ({ orderData, order, onUpdate }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderDetailHeader orderData={orderData} order={order} onUpdate={onUpdate} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <OrderDetailsCard orderData={orderData} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <PaymentDetailsCard orderId={orderData?.id} onUpdate={onUpdate} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShippingActivity order={order} orderData={orderData} />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomerDetails orderData={orderData} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShippingAddress orderData={orderData} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <BillingAddress orderData={orderData} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OrderDetails
