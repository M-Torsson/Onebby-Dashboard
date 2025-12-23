// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AccountDetails from './AccountDetails'
import AccountDelete from './AccountDelete'

const Account = ({ dictionary = { common: {} } }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AccountDetails dictionary={dictionary} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AccountDelete dictionary={dictionary} />
      </Grid>
    </Grid>
  )
}

export default Account
