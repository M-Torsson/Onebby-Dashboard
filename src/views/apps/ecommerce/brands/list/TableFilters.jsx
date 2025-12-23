// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const brandStockObj = {
  'In Stock': true,
  'Out of Stock': false
}

const TableFilters = ({ setData, brandData, dictionary = { common: {} } }) => {
  // States
  const [stock, setStock] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const filteredData = brandData?.filter(brand => {
      if (stock && brand.stock !== brandStockObj[stock]) return false
      if (status && brand.status !== status) return false

      return true
    })

    setData(filteredData ?? [])
  }, [stock, status, brandData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>{dictionary.common?.selectStatus || 'Select Status'}</MenuItem>
            <MenuItem value='Active'>{dictionary.common?.publish || 'Publish'}</MenuItem>
            <MenuItem value='Inactive'>{dictionary.common?.inactive || 'Inactive'}</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-stock'
            value={stock}
            onChange={e => setStock(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>{dictionary.common?.selectStock || 'Select Stock'}</MenuItem>
            <MenuItem value='In Stock'>{dictionary.common?.inStock || 'In Stock'}</MenuItem>
            <MenuItem value='Out of Stock'>{dictionary.common?.outOfStock || 'Out of Stock'}</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
