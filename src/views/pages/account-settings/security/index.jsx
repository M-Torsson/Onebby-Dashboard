// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ChangePasswordCard from './ChangePasswordCard'

const Security = ({ dictionary = { common: {} } }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ChangePasswordCard dictionary={dictionary} />
      </Grid>
    </Grid>
  )
}

export default Security
