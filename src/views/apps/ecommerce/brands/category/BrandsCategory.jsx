'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const BrandsCategory = () => {
  return (
    <Card>
      <CardHeader title='Brand Categories' />
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          Brand category management will be implemented here.
        </Typography>
      </CardContent>
    </Card>
  )
}

export default BrandsCategory
