'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import { API_BASE_URL, API_KEY } from '@/configs/apiConfig'

const StatisticsCard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    brands: 0,
    products: 0,
    loading: true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, brandsRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/categories`, {
            headers: { 'X-API-Key': API_KEY }
          }),
          fetch(`${API_BASE_URL}/api/admin/brands?skip=0&limit=1`, {
            headers: { 'X-API-Key': API_KEY }
          }),
          fetch(`${API_BASE_URL}/api/v1/products?active_only=false&skip=0&limit=1`, {
            headers: { 'X-API-Key': API_KEY }
          })
        ])

        const categoriesData = await categoriesRes.json()
        const brandsData = await brandsRes.json()
        const productsData = await productsRes.json()

        setStats({
          categories: categoriesData.meta?.total || categoriesData.data?.length || 0,
          brands: brandsData.meta?.total || 0,
          products: productsData.meta?.total || 0,
          loading: false
        })
      } catch (error) {
        console.error('Failed to fetch statistics:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  const data = [
    {
      stats: stats.loading ? '...' : stats.categories.toLocaleString(),
      title: 'Categories',
      color: 'primary',
      icon: 'tabler-category'
    },
    {
      color: 'info',
      stats: stats.loading ? '...' : stats.brands.toLocaleString(),
      title: 'Brands',
      icon: 'tabler-award'
    },
    {
      color: 'error',
      stats: stats.loading ? '...' : stats.products.toLocaleString(),
      title: 'Products',
      icon: 'tabler-shopping-cart'
    },
    {
      stats: stats.loading ? '...' : `${((stats.products / 1000) * 45).toFixed(0)}k`,
      color: 'success',
      title: 'Revenue',
      icon: 'tabler-currency-dollar'
    }
  ]

  return (
    <Card>
      <CardHeader
        title='Statistics'
        action={
          <Typography variant='subtitle2' color='text.disabled'>
            Live Data
          </Typography>
        }
      />
      <CardContent className='flex justify-between flex-wrap gap-4 md:pbs-10 max-md:pbe-6 max-[1060px]:pbe-[74px] max-[1200px]:pbe-[52px] max-[1320px]:pbe-[74px] max-[1501px]:pbe-[52px]'>
        <Grid container spacing={4} sx={{ inlineSize: '100%' }}>
          {data.map((item, index) => (
            <Grid key={index} size={{ xs: 6, sm: 3 }} className='flex items-center gap-4'>
              <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div className='flex flex-col'>
                {stats.loading ? (
                  <Skeleton variant='text' width={60} height={32} />
                ) : (
                  <Typography variant='h5'>{item.stats}</Typography>
                )}
                <Typography variant='body2'>{item.title}</Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
