'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'

import CustomAvatar from '@core/components/mui/Avatar'
import AnimatedStatNumber from '@views/dashboards/crm/AnimatedStatNumber'

const formatCompact = value => {
  const number = Number(value || 0)

  if (!Number.isFinite(number)) return '0'

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(number)
}

const StatisticsOverviewCard = ({ loading, stats }) => {
  const data = [
    {
      value: stats?.categories,
      title: 'Categories',
      color: 'primary',
      icon: 'tabler-category',
      formatter: value => formatCompact(value)
    },
    {
      value: stats?.brands,
      title: 'Brands',
      color: 'info',
      icon: 'tabler-award',
      formatter: value => formatCompact(value)
    },
    {
      value: stats?.products,
      title: 'Products',
      color: 'error',
      icon: 'tabler-shopping-cart',
      formatter: value => formatCompact(value)
    },
    {
      value: stats?.revenue,
      title: 'Revenue',
      color: 'success',
      icon: 'tabler-currency-dollar',
      formatter: value => `€${formatCompact(value)}`
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
      <CardContent
        className='flex justify-between flex-wrap gap-4 md:pbs-10 max-md:pbe-6'
        sx={{
          '@keyframes statFadeIn': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes statFloat': {
            '0%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-2px)' },
            '100%': { transform: 'translateY(0px)' }
          }
        }}
      >
        <Grid container spacing={4} sx={{ inlineSize: '100%' }}>
          {data.map((item, index) => (
            <Grid
              key={index}
              size={{ xs: 6, sm: 3 }}
              className='flex items-center gap-4 rounded-lg'
              sx={{
                p: 2,
                animation: 'statFadeIn .45s ease both',
                animationDelay: `${index * 90}ms`
              }}
            >
              <CustomAvatar
                color={item.color}
                variant='rounded'
                size={48}
                skin='light'
                sx={{ animation: 'statFloat 2.8s ease-in-out infinite', animationDelay: `${index * 140}ms` }}
              >
                <i className={`${item.icon} text-[24px]`} />
              </CustomAvatar>
              <div className='flex flex-col'>
                {loading ? (
                  <Skeleton variant='text' width={86} height={38} />
                ) : (
                  <Typography variant='h4' className='font-semibold leading-tight'>
                    <AnimatedStatNumber value={item.value} formatValue={item.formatter} />
                  </Typography>
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

export default StatisticsOverviewCard
