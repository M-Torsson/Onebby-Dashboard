'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserProfileHeader from './UserProfileHeader'

const UserProfile = ({ tabContentList }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserProfileHeader />
      </Grid>
      <Grid size={{ xs: 12 }}>{tabContentList['profile']}</Grid>
    </Grid>
  )
}

export default UserProfile
