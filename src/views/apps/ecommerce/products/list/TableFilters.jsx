// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Vars
const productStockObj = {
  'In Stock': true,
  'Out of Stock': false
}

const TableFilters = ({ setData, productData, dictionary = { common: {} } }) => {
  // States
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const [status, setStatus] = useState('')

  useEffect(
    () => {
      const filteredData = productData?.filter(product => {
        if (category && product.category !== category) return false
        if (stock && product.stock !== productStockObj[stock]) return false
        if (status && product.status !== status) return false

        return true
      })

      setData(filteredData ?? [])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, stock, status, productData]
  )

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
            <MenuItem value='Scheduled'>{dictionary.common?.scheduled || 'Scheduled'}</MenuItem>
            <MenuItem value='Published'>{dictionary.common?.publish || 'Publish'}</MenuItem>
            <MenuItem value='Inactive'>{dictionary.common?.inactive || 'Inactive'}</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-category'
            value={category}
            onChange={e => setCategory(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>{dictionary.common?.selectCategory || 'Select Category'}</MenuItem>
            <MenuItem value='Accessories'>{dictionary.common?.accessories || 'Accessories'}</MenuItem>
            <MenuItem value='Home Decor'>{dictionary.common?.homeDecor || 'Home Decor'}</MenuItem>
            <MenuItem value='Electronics'>{dictionary.common?.electronics || 'Electronics'}</MenuItem>
            <MenuItem value='Shoes'>{dictionary.common?.shoes || 'Shoes'}</MenuItem>
            <MenuItem value='Office'>{dictionary.common?.office || 'Office'}</MenuItem>
            <MenuItem value='Games'>{dictionary.common?.games || 'Games'}</MenuItem>
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
